from flask import jsonify, request
from app import app
from models import db, HourlyReading, User, ExposureLog
from cpcb_client import fetch_hourly
from waqi_client import get_current_aqi
from exposure_engine import calculate_wes, calculate_el, calculate_safe_time, update_ces, get_weekly_trend, check_ces_alert
from advisory import find_safest_window, get_forecast_advisory
from datetime import datetime
import datetime as dt

# ── Helpers ──
def get_latest_reading(city):
    return HourlyReading.query\
        .filter_by(city=city)\
        .order_by(HourlyReading.timestamp.desc())\
        .first()

def save_readings(city):
    data = fetch_hourly(city)
    for rec in data:
        reading = HourlyReading(
            city=city,
            station_id=rec.get('station_id', 'UNKNOWN'),
            timestamp=datetime.fromisoformat(rec['timestamp']),
            pm25=rec['pm25'], pm10=rec['pm10'],
            no2=rec['no2'], o3=rec['o3'], aqi=rec['aqi']
        )
        db.session.add(reading)
    db.session.commit()
    print(f"[DB] Saved AQI data for {city}")

def log_exposure(user_id, wes, el_result, safe_time, aqi):
    today = dt.date.today()
    existing = ExposureLog.query.filter_by(user_id=user_id, date=today).first()
    if existing:
        ces = update_ces(user_id, el_result['el'])
        existing.wes = wes
        existing.el = el_result['el']
        existing.ces = ces
        existing.safe_hours = safe_time
        existing.risk_level = el_result['risk']
        db.session.commit()
        return ces
    else:
        ces = update_ces(user_id, el_result['el'])
        log = ExposureLog(
            user_id=user_id, date=today,
            wes=wes, el=el_result['el'], ces=ces,
            safe_hours=safe_time, risk_level=el_result['risk'],
            outdoor_hours_actual=0.0
        )
        db.session.add(log)
        db.session.commit()
        return ces

VF_TABLE = {
    'healthy': 1.0, 'asthma': 1.5,
    'heart': 1.4, 'pregnant': 1.3, 'elderly': 1.6,
}

# ── Routes ──

@app.route('/')
def index():
    return jsonify({'status': 'BreatheEasy+ backend running'})


@app.route('/api/aqi/<city>')
def get_aqi(city):
    waqi_data = get_current_aqi(city)
    if waqi_data:
        return jsonify({
            'city': city,
            'aqi': waqi_data['aqi'],
            'pm25': waqi_data['pm25'],
            'pm10': waqi_data['pm10'],
            'no2': waqi_data['no2'],
            'o3': waqi_data['o3'],
            'timestamp': str(datetime.now()),
            'source': 'WAQI'
        })
    reading = get_latest_reading(city)
    if not reading:
        save_readings(city)
        reading = get_latest_reading(city)
    if not reading:
        return jsonify({'error': 'No data found for city'}), 404
    return jsonify(reading.to_dict())


@app.route('/api/register', methods=['POST'])
def register():
    d = request.json
    required = ['username', 'email', 'age', 'health_condition', 'city']
    for field in required:
        if field not in d:
            return jsonify({'error': f'Missing field: {field}'}), 400
    existing = User.query.filter_by(email=d['email']).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409
    vf = VF_TABLE.get(d['health_condition'], 1.0)
    user = User(
        username=d['username'], email=d['email'],
        age=d['age'], health_condition=d['health_condition'],
        vf=vf, daily_outdoor_hours=d.get('daily_outdoor_hours', 2.0),
        city=d['city'], lat=d.get('lat'), lng=d.get('lng')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'user_id': user.id,
        'username': user.username,
        'vf': vf,
        'message': 'User registered successfully'
    }), 201


@app.route('/api/user/<int:user_id>')
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id, 'username': user.username,
        'email': user.email, 'age': user.age,
        'health_condition': user.health_condition,
        'vf': user.vf, 'city': user.city,
        'daily_outdoor_hours': user.daily_outdoor_hours
    })


@app.route('/api/exposure/<int:user_id>')
def get_exposure(user_id):
    user = User.query.get_or_404(user_id)
    waqi_data = get_current_aqi(user.city)
    if not waqi_data:
        return jsonify({'error': 'No AQI data for user city'}), 404
    wes = calculate_wes(
        waqi_data['pm25'], waqi_data['pm10'],
        waqi_data['no2'], waqi_data['o3'],
        user.health_condition, user.vf
    )
    el_result = calculate_el(wes, user.daily_outdoor_hours)
    safe_time = calculate_safe_time(user.health_condition, waqi_data['aqi'])
    log_exposure(user_id, wes, el_result, safe_time, waqi_data['aqi'])
    return jsonify({
        'user_id': user_id, 'username': user.username,
        'health_condition': user.health_condition,
        'city': user.city, 'aqi': waqi_data['aqi'],
        'wes': wes, 'el': el_result['el'],
        'risk': el_result['risk'], 'color': el_result['color'],
        'safe_hours': safe_time,
        'daily_outdoor_hours': user.daily_outdoor_hours
    })


@app.route('/api/exposure/compare/<int:user_id>')
def compare_exposure(user_id):
    user = User.query.get_or_404(user_id)
    waqi_data = get_current_aqi(user.city)
    if not waqi_data:
        return jsonify({'error': 'No AQI data'}), 404
    user_wes = calculate_wes(
        waqi_data['pm25'], waqi_data['pm10'],
        waqi_data['no2'], waqi_data['o3'],
        user.health_condition, user.vf
    )
    healthy_wes = calculate_wes(
        waqi_data['pm25'], waqi_data['pm10'],
        waqi_data['no2'], waqi_data['o3'],
        'healthy', 1.0
    )
    return jsonify({
        'city': user.city, 'aqi': waqi_data['aqi'],
        'user': {
            'condition': user.health_condition, 'vf': user.vf,
            'wes': user_wes,
            'el': calculate_el(user_wes, user.daily_outdoor_hours)['el'],
            'risk': calculate_el(user_wes, user.daily_outdoor_hours)['risk'],
            'safe_hours': calculate_safe_time(user.health_condition, waqi_data['aqi'])
        },
        'healthy_baseline': {
            'condition': 'healthy', 'vf': 1.0,
            'wes': healthy_wes,
            'el': calculate_el(healthy_wes, user.daily_outdoor_hours)['el'],
            'risk': calculate_el(healthy_wes, user.daily_outdoor_hours)['risk'],
            'safe_hours': calculate_safe_time('healthy', waqi_data['aqi'])
        }
    })


@app.route('/api/trend/<int:user_id>')
def get_trend(user_id):
    User.query.get_or_404(user_id)
    trend = get_weekly_trend(user_id)
    ces_alert = check_ces_alert(trend)
    return jsonify({
        'user_id': user_id,
        'weekly_trend': trend,
        'ces_alert': ces_alert
    })


@app.route('/api/advisory/<int:user_id>')
def get_advisory(user_id):
    user = User.query.get_or_404(user_id)
    waqi_data = get_current_aqi(user.city)

    if not waqi_data:
        return jsonify({'error': 'No AQI data for city'}), 404

    wes = calculate_wes(
        waqi_data['pm25'], waqi_data['pm10'],
        waqi_data['no2'], waqi_data['o3'],
        user.health_condition, user.vf
    )
    el_result = calculate_el(wes, user.daily_outdoor_hours)
    safe_time = calculate_safe_time(user.health_condition, waqi_data['aqi'])
    ces = log_exposure(user_id, wes, el_result, safe_time, waqi_data['aqi'])

    trend = get_weekly_trend(user_id)
    ces_alert = check_ces_alert(trend)
    safest_window = find_safest_window(user.city)
    forecast_data = get_forecast_advisory(user.city)

    return jsonify({
        'user_id': user_id,
        'username': user.username,
        'city': user.city,
        'aqi': waqi_data['aqi'],
        'wes': wes,
        'el': el_result['el'],
        'risk': el_result['risk'],
        'color': el_result['color'],
        'safe_hours': safe_time,
        'safest_window': safest_window,
        'ces': ces,
        'ces_alert': ces_alert,
        'weekly_trend': trend,
        'forecast': forecast_data
    })


@app.route('/api/forecast/<city>')
def get_forecast_route(city):
    data = get_forecast_advisory(city)
    return jsonify(data)