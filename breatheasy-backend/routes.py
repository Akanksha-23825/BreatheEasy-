from flask import jsonify, request
from app import app
from models import db, HourlyReading, User, ExposureLog, AdminAlert, UnsafeRoad
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
        'role': user.role,
        'vf': vf,
        'message': 'User registered successfully'
    }), 201


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    d = request.json
    email = d.get('email')
    password = d.get('password') # In a real app, use hashed passwords
    
    user = User.query.filter_by(email=email, role='admin').first()
    if user and user.password == password:
        return jsonify({
            'user_id': user.id,
            'username': user.username,
            'role': user.role,
            'message': 'Admin login successful'
        }), 200
    return jsonify({'error': 'Invalid admin credentials'}), 401


@app.route('/api/admin/stats')
def get_admin_stats():
    total_users = User.query.count()
    active_alerts = AdminAlert.query.filter_by(is_active=True).count()
    unsafe_roads = UnsafeRoad.query.count()
    
    # Calculate average risk levels
    logs = ExposureLog.query.order_by(ExposureLog.date.desc()).limit(100).all()
    risk_counts = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0}
    for log in logs:
        risk = log.risk_level.upper() if log.risk_level else 'LOW'
        if risk in risk_counts:
            risk_counts[risk] += 1
            
    return jsonify({
        'total_users': total_users,
        'active_alerts': active_alerts,
        'unsafe_roads': unsafe_roads,
        'risk_distribution': risk_counts
    })


@app.route('/api/admin/heatmap-advanced/<city>')
def get_advanced_heatmap(city):
    """Enhanced heatmap with Predicted Human Exposure Risk."""
    from cpcb_client import fetch_hourly
    data = fetch_hourly(city)
    stations = []
    
    # Mock some population density data for 'Unique Feature'
    # In a real app, this would come from a geospatial database
    import random
    
    for rec in data:
        aqi = rec.get('aqi', 0)
        # Exposure Risk = (AQI * Population Density Factor) + Trend Factor
        pop_density = random.uniform(0.5, 2.0) 
        exposure_risk = aqi * pop_density
        
        stations.append({
            'station': rec.get('station_id', 'Unknown'),
            'aqi': aqi,
            'exposure_risk': round(exposure_risk, 2),
            'pop_density_level': 'High' if pop_density > 1.5 else 'Medium' if pop_density > 1.0 else 'Low',
            'lat': rec.get('lat', 12.9716),
            'lng': rec.get('lng', 77.5946),
        })
    return jsonify({'city': city, 'stations': stations})


@app.route('/api/admin/alerts', methods=['GET', 'POST'])
def manage_alerts():
    if request.method == 'POST':
        d = request.json
        alert = AdminAlert(
            title=d['title'],
            message=d['message'],
            city=d.get('city', 'All'),
            zone=d.get('zone', 'General'),
            severity=d.get('severity', 'medium')
        )
        db.session.add(alert)
        db.session.commit()
        return jsonify({'message': 'Alert broadcasted', 'id': alert.id}), 201
    
    alerts = AdminAlert.query.order_by(AdminAlert.created_at.desc()).all()
    return jsonify([{
        'id': a.id, 'title': a.title, 'message': a.message,
        'city': a.city, 'zone': a.zone, 'severity': a.severity,
        'created_at': str(a.created_at), 'is_active': a.is_active
    } for a in alerts])


@app.route('/api/admin/roads', methods=['GET', 'POST'])
def manage_roads():
    if request.method == 'POST':
        d = request.json
        road = UnsafeRoad(
            road_name=d['road_name'],
            lat=d['lat'],
            lng=d['lng'],
            radius=d.get('radius', 0.5),
            reason=d.get('reason', 'High Pollution')
        )
        db.session.add(road)
        db.session.commit()
        return jsonify({'message': 'Road marked unsafe', 'id': road.id}), 201
    
    roads = UnsafeRoad.query.all()
    return jsonify([{
        'id': r.id, 'road_name': r.road_name, 'lat': r.lat, 'lng': r.lng,
        'radius': r.radius, 'reason': r.reason, 'marked_at': str(r.marked_at)
    } for r in roads])


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
    safest_window = find_safest_window(user.city, user.health_condition)
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

@app.route('/api/alerts/<int:user_id>')
def get_alerts(user_id):
    user = User.query.get_or_404(user_id)
    waqi_data = get_current_aqi(user.city)

    if not waqi_data:
        return jsonify({'alerts': []})

    wes = calculate_wes(
        waqi_data['pm25'], waqi_data['pm10'],
        waqi_data['no2'], waqi_data['o3'],
        user.health_condition, user.vf
    )
    el_result = calculate_el(wes, user.daily_outdoor_hours)
    trend = get_weekly_trend(user_id)
    ces_alert = check_ces_alert(trend)

    alerts = []

    if waqi_data['aqi'] > 150:
        alerts.append({
            'type': 'aqi_spike',
            'severity': 'high',
            'message': f"AQI is {waqi_data['aqi']} — Stay indoors today.",
            'icon': '🚨'
        })

    if el_result['el'] > 300:
        alerts.append({
            'type': 'high_el',
            'severity': 'high',
            'message': f"Your exposure load is HIGH ({el_result['el']}). Limit outdoor time.",
            'icon': '⚠️'
        })

    if waqi_data['pm25'] > 60:
        alerts.append({
            'type': 'pm25',
            'severity': 'medium',
            'message': f"PM2.5 levels are elevated ({waqi_data['pm25']} µg/m³). Wear a mask.",
            'icon': '😷'
        })

    if ces_alert:
        alerts.append({
            'type': 'ces_rising',
            'severity': 'medium',
            'message': ces_alert,
            'icon': '📈'
        })

    if not alerts:
        alerts.append({
            'type': 'all_clear',
            'severity': 'low',
            'message': 'Air quality is acceptable for your health condition today.',
            'icon': '✅'
        })

    return jsonify({'alerts': alerts, 'count': len(alerts)})


@app.route('/api/heatmap/<city>')
def get_heatmap(city):
    """Return all station AQI data for heatmap display."""
    from cpcb_client import fetch_hourly
    data = fetch_hourly(city)
    stations = []
    for rec in data:
        if rec.get('pm25') or rec.get('aqi'):
            stations.append({
                'station': rec.get('station_id', 'Unknown'),
                'aqi': rec.get('aqi', 0),
                'pm25': rec.get('pm25', 0),
                'pm10': rec.get('pm10', 0),
                'no2': rec.get('no2', 0),
                'lat': rec.get('lat'),
                'lng': rec.get('lng'),
            })
    return jsonify({'city': city, 'stations': stations})


from osm_router import recommend_route, get_waqi_data, get_region, REGION_AQI_FALLBACK

@app.route('/api/route', methods=['POST'])
def get_route():
    data = request.json
    for field in ['start_lat', 'start_lng', 'end_lat', 'end_lng']:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        routes = recommend_route(
            data['start_lat'], data['start_lng'],
            data['end_lat'],   data['end_lng'],
            data.get('condition', 'normal'),
            data.get('start_name', ''),
            data.get('end_name', '')
        )
        if not routes:
            return jsonify({'error': 'No routes found'}), 404

        return jsonify({
            'success': True,
            'condition': data.get('condition', 'normal'),
            'routes': routes,
            'total_routes': len(routes)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500