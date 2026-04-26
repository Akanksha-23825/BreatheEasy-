# test_ors_direct.py
import requests
import os
from dotenv import load_dotenv

load_dotenv()
ORS_KEY = os.getenv("ORS_KEY")

print(f"Testing ORS Key: {ORS_KEY[:10]}...")

# Test with a simple request
url = "https://api.openrouteservice.org/v2/directions/driving-car"

headers = {
    "Authorization": ORS_KEY,
    "Content-Type": "application/json"
}

# Simple coordinates (RVCE to nearby point)
body = {
    "coordinates": [
        [77.4989, 12.9236],  # [longitude, latitude]
        [77.5367, 12.9352]   # [longitude, latitude]
    ]
}

print("\nSending request to ORS...")
try:
    response = requests.post(url, json=body, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")