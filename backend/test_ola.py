# test_ola.py - FIXED with POST request
import requests
import os
from dotenv import load_dotenv

load_dotenv()

OLA_API_KEY = os.getenv("OLA_MAPS_API_KEY")

if not OLA_API_KEY:
    print("❌ Please add OLA_MAPS_API_KEY to your .env file")
    exit()

print(f"🔑 Testing Ola Maps API Key: {OLA_API_KEY[:15]}...")
print()

# Test route: RVCE to Majestic
origin = "12.9236,77.4989"      # lat,lng format
destination = "12.9780,77.5722"

url = "https://api.olamaps.io/routing/v1/directions"

params = {
    "origin": origin,
    "destination": destination,
    "api_key": OLA_API_KEY,
    "alternatives": "true",
    "steps": "true",
    "overview": "full"
}

print(f"📍 From: RVCE ({origin})")
print(f"📍 To: Majestic ({destination})")
print(f"🌐 Calling Ola Maps API with POST request...")
print()

try:
    # CHANGE: Use POST instead of GET
    response = requests.post(url, params=params, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        routes = data.get('routes', [])
        print(f"\n✅ SUCCESS! Found {len(routes)} route(s)\n")
        
        for i, route in enumerate(routes):
            leg = route['legs'][0]
            distance_km = leg['distance']['value'] / 1000
            duration_min = leg['duration']['value'] / 60
            print(f"📌 Route {i+1}: {distance_km:.1f} km, {duration_min:.0f} min")
    else:
        print(f"❌ Error: {response.text[:200]}")
        
except Exception as e:
    print(f"❌ Exception: {e}")