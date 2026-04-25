import requests, os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv('CPCB_API_KEY')
RESOURCE_ID = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69'
BASE_URL = f'https://api.data.gov.in/resource/{RESOURCE_ID}'

def fetch_hourly(city: str) -> list:
    if not API_KEY or API_KEY == 'your_cpcb_api_key_here':
        print(f"[MOCK] No API key. Using mock data for {city}")
        return get_mock_data(city)

    try:
        # Fetch more records to get all pollutants across stations
        resp = requests.get(
            BASE_URL,
            params={
                'api-key': API_KEY,
                'format': 'json',
                'limit': 100,
                'filters[city]': city
            },
            timeout=10
        )
        resp.raise_for_status()
        raw = resp.json()

        records = parse_ogd_response(raw, city)

        if not records:
            print(f"[WARN] No records for {city}. Using mock data.")
            return get_mock_data(city)

        print(f"[API] Successfully parsed {len(records)} station records for {city}")
        return records

    except Exception as e:
        print(f"[ERROR] OGD API failed: {e}. Falling back to mock data.")
        return get_mock_data(city)


def parse_ogd_response(raw: dict, city: str) -> list:
    """
    OGD returns one row per pollutant per station.
    We group by station, then collect all pollutants into one record.
    """
    entries = raw.get('records', [])

    # Group by station
    stations = {}
    for rec in entries:
        station = rec.get('station', 'Unknown')
        if station not in stations:
            stations[station] = {
                'station': station,
                'city': city,
                'last_update': rec.get('last_update', ''),
                'latitude': rec.get('latitude'),
                'longitude': rec.get('longitude'),
                'pm25': 0.0,
                'pm10': 0.0,
                'no2': 0.0,
                'o3': 0.0,
                'so2': 0.0,
                'co': 0.0,
            }

        pollutant = rec.get('pollutant_id', '').upper()
        avg = safe_float(rec.get('avg_value'))

        # Map pollutant names to our fields
        if pollutant == 'PM2.5':
            stations[station]['pm25'] = avg
        elif pollutant == 'PM10':
            stations[station]['pm10'] = avg
        elif pollutant == 'NO2':
            stations[station]['no2'] = avg
        elif pollutant in ('OZONE', 'O3'):
            stations[station]['o3'] = avg
        elif pollutant == 'SO2':
            stations[station]['so2'] = avg
        elif pollutant == 'CO':
            stations[station]['co'] = avg

    # Convert grouped stations to our standard format
    records = []
    for station_name, data in stations.items():
        aqi = calculate_aqi(data['pm25'], data['pm10'])
        records.append({
            'timestamp': datetime.now().isoformat(),
            'city': city,
            'station_id': station_name,
            'pm25': data['pm25'],
            'pm10': data['pm10'],
            'no2': data['no2'],
            'o3': data['o3'],
            'aqi': aqi
        })

    return records


def calculate_aqi(pm25: float, pm10: float) -> int:
    """
    Simple AQI calculation based on PM2.5 and PM10.
    Uses Indian NAQI breakpoints.
    """
    # PM2.5 based AQI
    if pm25 <= 30:
        aqi_pm25 = pm25 * (50/30)
    elif pm25 <= 60:
        aqi_pm25 = 50 + (pm25 - 30) * (50/30)
    elif pm25 <= 90:
        aqi_pm25 = 100 + (pm25 - 60) * (50/30)
    elif pm25 <= 120:
        aqi_pm25 = 150 + (pm25 - 90) * (50/30)
    elif pm25 <= 250:
        aqi_pm25 = 200 + (pm25 - 120) * (100/130)
    else:
        aqi_pm25 = 300 + (pm25 - 250) * (100/130)

    # PM10 based AQI
    if pm10 <= 50:
        aqi_pm10 = pm10 * (50/50)
    elif pm10 <= 100:
        aqi_pm10 = 50 + (pm10 - 50) * (50/50)
    elif pm10 <= 250:
        aqi_pm10 = 100 + (pm10 - 100) * (50/150)
    elif pm10 <= 350:
        aqi_pm10 = 150 + (pm10 - 250) * (50/100)
    elif pm10 <= 430:
        aqi_pm10 = 200 + (pm10 - 350) * (100/80)
    else:
        aqi_pm10 = 300 + (pm10 - 430) * (100/80)

    # Take the higher of the two
    return int(max(aqi_pm25, aqi_pm10))


def safe_float(val) -> float:
    try:
        return float(val) if val not in (None, '', 'NA', 'N/A') else 0.0
    except:
        return 0.0


def get_mock_data(city: str) -> list:
    return [
        {
            'timestamp': datetime.now().isoformat(),
            'city': city,
            'station_id': 'MOCK_001',
            'pm25': 68.0,
            'pm10': 92.0,
            'no2': 34.0,
            'o3': 28.0,
            'aqi': 142
        }
    ]