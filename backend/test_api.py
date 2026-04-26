# test_api.py - Test your Flask API
import requests
import json

url = "http://localhost:5000/api/route"

data = {
    "start_lat": 12.9236,
    "start_lng": 77.4989,
    "end_lat": 12.9780,
    "end_lng": 77.5722,
    "condition": "asthma"
}

print("📡 Testing BreatheEasy+ API...")
print(f"   URL: {url}")
print(f"   Data: {json.dumps(data, indent=2)}")
print()

try:
    response = requests.post(url, json=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ SUCCESS!")
        print(f"   Condition: {result.get('condition', 'N/A')}")
        print(f"   Routes found: {len(result.get('routes', []))}")
        
        for route in result.get('routes', []):
            tag = "⭐" if route.get('recommended') else "  "
            print(f"   {tag} Route {route['route_id']}: {route['distance']}km, {route['duration']}min | WES: {route['avg_wes']} ({route['risk']})")
    else:
        print(f"❌ Error: {response.text}")
        
except Exception as e:
    print(f"❌ Connection error: {e}")
    print("   Make sure Flask is running on port 5000")