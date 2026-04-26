# test_backend.py
# Quick test to verify everything works

import requests
import json

def test_route_api():
    print("=" * 60)
    print("🧪 TESTING BREATHEEASY+ BACKEND")
    print("=" * 60)
    
    # Test data
    test_data = {
        "start_lat": 12.9236,
        "start_lng": 77.4989,
        "end_lat": 12.9698,
        "end_lng": 77.7500,
        "condition": "asthma"
    }
    
    print("\n📤 Sending request to /api/route...")
    print(f"   From: RVCE")
    print(f"   To: Whitefield")
    print(f"   Condition: {test_data['condition']}")
    
    try:
        response = requests.post(
            "http://localhost:5000/api/route",
            json=test_data,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS! Received {len(data['routes'])} routes")
            
            print("\n📊 ROUTE COMPARISON:")
            print("-" * 60)
            for route in data['routes']:
                tag = "⭐ RECOMMENDED" if route.get('recommended') else "   "
                print(f"{tag} Route {route['route_id']}:")
                print(f"    Distance: {route['distance']} km")
                print(f"    Duration: {route['duration']} min")
                print(f"    WES Score: {route['avg_wes']}")
                print(f"    Risk Level: {route['risk']}")
                print(f"    Stations Sampled: {len(route['stations'])}")
                print()
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server. Make sure it's running:")
        print("   python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_advisory_api():
    print("\n" + "=" * 60)
    print("🧪 TESTING ADVISORY API")
    print("=" * 60)
    
    test_data = {
        "condition": "asthma",
        "aqi": 144
    }
    
    try:
        response = requests.post("http://localhost:5000/api/advisory", json=test_data)
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Advisory for {data['condition']} (AQI: {data['aqi']})")
            print(f"   Safe Hours: {data['safe_hours']} hours")
            print(f"   Risk: {data['risk']}")
            print(f"   Message: {data['message']}")
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("\n⚠️  Make sure Flask server is running first!")
    print("   Run: python app.py in another terminal\n")
    
    choice = input("Test API? (y/n): ")
    if choice.lower() == 'y':
        test_route_api()
        test_advisory_api()