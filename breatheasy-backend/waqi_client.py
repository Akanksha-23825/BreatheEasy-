import requests, os
from dotenv import load_dotenv
load_dotenv()

WAQI_TOKEN = os.getenv('WAQI_TOKEN')
WAQI_BASE = 'https://api.waqi.info/feed'

def fetch_waqi(city: str) -> dict:
    """Fetch current AQI + forecast from WAQI API."""
    try:
        resp = requests.get(
            f'{WAQI_BASE}/{city}/',
            params={'token': WAQI_TOKEN},
            timeout=10
        )
        resp.raise_for_status()
        data = resp.json()

        if data['status'] != 'ok':
            print(f"[WAQI] Bad status for {city}")
            return None

        return data['data']

    except Exception as e:
        print(f"[WAQI ERROR] {e}")
        return None



# Known Bengaluru monitoring stations — tried in order, freshest data wins
BENGALURU_STATIONS = [
    'Bengaluru',
    'india/bengaluru/silk-board',
    'india/bengaluru/bwssb-kadabesanahalli',
]

def get_current_aqi(city: str) -> dict:
    """Get current pollutant readings. Tries multiple stations and returns freshest data."""
    from datetime import datetime, timezone

    candidates = BENGALURU_STATIONS if 'bengaluru' in city.lower() else [city]

    best_data = None
    best_time = None

    for station in candidates:
        data = fetch_waqi(station)
        if not data:
            continue

        # Parse the station's reported timestamp
        time_str = data.get('time', {}).get('s', '')
        try:
            station_time = datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S')
            station_time = station_time.replace(tzinfo=timezone.utc)
        except Exception:
            station_time = None

        # Pick the station with the most recent data
        if best_time is None or (station_time and station_time > best_time):
            best_data = data
            best_time = station_time

    if not best_data:
        return None

    iaqi = best_data.get('iaqi', {})

    # Calculate data age in hours
    data_age_hours = None
    if best_time:
        now_utc = datetime.now(timezone.utc)
        data_age_hours = round((now_utc - best_time).total_seconds() / 3600, 1)

    return {
        'aqi':            best_data.get('aqi', 0),
        'pm25':           iaqi.get('pm25', {}).get('v', 0.0),
        'pm10':           iaqi.get('pm10', {}).get('v', 0.0),
        'no2':            iaqi.get('no2',  {}).get('v', 0.0),
        'o3':             iaqi.get('o3',   {}).get('v', 0.0),
        'so2':            iaqi.get('so2',  {}).get('v', 0.0),
        'station':        best_data.get('city', {}).get('name', city),
        'data_time':      best_data.get('time', {}).get('s', ''),
        'data_age_hours': data_age_hours,
        'stale':          data_age_hours is not None and data_age_hours > 3,
    }



def get_forecast(city: str) -> dict:
    """
    Get daily forecast for pm25 and pm10.
    Returns list of {day, pm25_avg, pm10_avg}
    """
    data = fetch_waqi(city)
    if not data:
        return []

    forecast = data.get('forecast', {}).get('daily', {})
    pm25_forecast = forecast.get('pm25', [])
    pm10_forecast = forecast.get('pm10', [])

    # Merge pm25 and pm10 by day
    result = []
    for entry in pm25_forecast:
        day = entry.get('day')
        pm10_entry = next((x for x in pm10_forecast if x['day'] == day), {})
        result.append({
            'day': day,
            'pm25_avg': entry.get('avg', 0),
            'pm25_max': entry.get('max', 0),
            'pm25_min': entry.get('min', 0),
            'pm10_avg': pm10_entry.get('avg', 0),
        })

    return result


def get_safest_window(city: str) -> str:
    """
    Find the day with lowest predicted PM2.5 in forecast.
    Returns best day and advice.
    """
    forecast = get_forecast(city)
    if not forecast:
        return '06:00 AM'  # fallback

    # Find day with lowest pm25 average
    best = min(forecast, key=lambda x: x['pm25_avg'])

    # If best day is today → recommend early morning
    from datetime import date
    today = str(date.today())

    if best['day'] == today:
        return '06:00 AM'
    else:
        return f"Tomorrow morning (PM2.5 forecast: {best['pm25_avg']})"