import requests

TOKEN = "6d38bca96ffee8ac9cbe498aa61d84eb5f607bfd"

def get_aqi_by_coords(name, lat, lng):
    url = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={TOKEN}"
    response = requests.get(url)
    data = response.json()
    
    if data["status"] == "ok":
        iaqi = data["data"]["iaqi"]
        print(f"Area: {name}")
        print(f"Nearest Station: {data['data']['city']['name']}")
        print(f"Overall AQI: {data['data']['aqi']}")
        print(f"PM2.5: {iaqi.get('pm25', {}).get('v', 'N/A')}")
        print(f"PM10:  {iaqi.get('pm10', {}).get('v', 'N/A')}")
        print(f"NO2:   {iaqi.get('no2',  {}).get('v', 'N/A')}")
        print(f"O3:    {iaqi.get('o3',   {}).get('v', 'N/A')}")
        print("---")
    else:
        print(f"No data for {name}")
        print("---")

# Bengaluru areas with actual coordinates
locations = [
    ("Whitefield",       12.9698, 77.7500),
    ("Hebbal",           13.0350, 77.5970),
    ("Electronic City",  12.8399, 77.6770),
    ("Jayanagar",        12.9250, 77.5938),
    ("Koramangala",      12.9352, 77.6245),
    ("Marathahalli",     12.9591, 77.6974),
    ("Yeshwanthpur",     13.0280, 77.5540),
    ("Peenya",           13.0280, 77.5190),
    ("Yelahanka",        13.1007, 77.5963),
    ("Indiranagar",      12.9784, 77.6408),
    ("RVCE Mysore Road", 12.9236, 77.4989),
]

for name, lat, lng in locations:
    get_aqi_by_coords(name, lat, lng)