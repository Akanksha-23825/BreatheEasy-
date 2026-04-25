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


def get_current_aqi(city: str) -> dict:
    """Get current pollutant readings from WAQI."""
    data = fetch_waqi(city)
    if not data:
        return None

    iaqi = data.get('iaqi', {})

    return {
        'aqi': data.get('aqi', 0),
        'pm25': iaqi.get('pm25', {}).get('v', 0.0),
        'pm10': iaqi.get('pm10', {}).get('v', 0.0),
        'no2':  iaqi.get('no2',  {}).get('v', 0.0),
        'o3':   iaqi.get('o3',   {}).get('v', 0.0),
        'so2':  iaqi.get('so2',  {}).get('v', 0.0),
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