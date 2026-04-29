# osm_router.py
# Handles: OpenStreetMap (via OpenRouteService) routing + Granular AQI fetching
# Optimized with ThreadPoolExecutor for faster parallel AQI requests

import os
import requests
import math
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from dotenv import load_dotenv
from exposure_engine import calculate_wes, get_risk

load_dotenv()

# ── CREDENTIALS ──────────────────────────────────────────────────
ORS_KEY    = os.getenv("ORS_KEY")
WAQI_TOKEN = os.getenv("WAQI_TOKEN")

# ── REGIONAL FALLBACK AQI ────────────────────────────────────────
# Moved from ola_oauth_router to make osm_router independent
REGION_AQI_FALLBACK = {
    "north":   {"name": "North Bangalore (Estimated)", "pm25": 85,  "pm10": 110, "no2": 45, "o3": 35, "aqi": 120},
    "south":   {"name": "South Bangalore (Estimated)", "pm25": 110, "pm10": 140, "no2": 75, "o3": 40, "aqi": 160},
    "east":    {"name": "East Bangalore (Estimated)",  "pm25": 95,  "pm10": 120, "no2": 55, "o3": 38, "aqi": 135},
    "west":    {"name": "West Bangalore (Estimated)",  "pm25": 70,  "pm10": 90,  "no2": 35, "o3": 30, "aqi": 100},
    "central": {"name": "Central Bangalore (Estimated)","pm25": 105,"pm10": 130, "no2": 65, "o3": 42, "aqi": 150},
    "other":   {"name": "Unknown Region (Estimated)",  "pm25": 50,  "pm10": 60,  "no2": 30, "o3": 25, "aqi": 75},
}

def get_region(lat, lng):
    """Determine region from coordinates (Bangalore-specific or generic)"""
    # Bangalore bounds: Lat [12.7, 13.2], Lng [77.3, 77.9]
    is_bangalore = (12.7 <= lat <= 13.2) and (77.3 <= lng <= 77.9)
    
    if not is_bangalore:
        return "other"

    if lat > 13.02:              return "north"
    if lat < 12.90:              return "south"
    if lng > 77.70:              return "east"
    if lng < 77.53:              return "west"
    return                              "central"

# ── STATION CACHE ────────────────────────────────────────────────
station_cache = {} # (lat, lng) -> data

def get_waqi_data(lat, lng):
    """Fetch real-time AQI from WAQI with caching"""
    cache_key = (round(lat, 3), round(lng, 3))
    if cache_key in station_cache:
        return station_cache[cache_key]

    if not WAQI_TOKEN:
        return None

    try:
        url      = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={WAQI_TOKEN}"
        response = requests.get(url, timeout=5)
        res      = response.json()

        if res.get("status") == "ok":
            data    = res["data"]
            iaqi    = data.get("iaqi", {})
            result = {
                "pm25":    iaqi.get("pm25", {}).get("v", None),
                "pm10":    iaqi.get("pm10", {}).get("v", None),
                "no2":     iaqi.get("no2",  {}).get("v", None),
                "o3":      iaqi.get("o3",   {}).get("v", None),
                "aqi":     data.get("aqi", 100),
                "station": data.get("city", {}).get("name", "CPCB Station"),
                "verified": True
            }
            station_cache[cache_key] = result
            return result
    except Exception as e:
        pass # Silent fail, handled by caller
    return None

def fetch_aqi_for_point(point_data):
    """Worker function for ThreadPoolExecutor"""
    lng, lat, condition = point_data
    data = get_waqi_data(lat, lng)
    if data:
        wes = calculate_wes(data["pm25"], data["pm10"], data["no2"], data["o3"], condition)
        return {
            "coord": [lng, lat],
            "aqi": data["aqi"],
            "pm25": data["pm25"],
            "no2": data["no2"],
            "pm10": data["pm10"],
            "o3": data.get("o3"),
            "wes": wes,
            "risk": get_risk(wes),
            "station": data["station"]
        }
    return None

def get_granular_route_aqi(coords, condition):
    """Fetch AQI for points along the route in parallel"""
    if not coords or len(coords) < 2:
        return []

    total_dist_km = 0
    for i in range(1, len(coords)):
        p1, p2 = coords[i-1], coords[i]
        total_dist_km += math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) * 111
    
    num_points = max(8, min(25, int(total_dist_km * 2) + 1))
    step = max(1, len(coords) // num_points)
    
    # Prepare points for parallel fetching
    points_to_fetch = []
    for i in range(0, len(coords), step):
        points_to_fetch.append((coords[i][0], coords[i][1], condition))
    
    # Ensure end point
    if coords[-1][0] != points_to_fetch[-1][0]:
        points_to_fetch.append((coords[-1][0], coords[-1][1], condition))

    # Parallel requests using ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_aqi_for_point, points_to_fetch))
    
    return [r for r in results if r is not None]

def get_osm_routes(start_lat, start_lng, end_lat, end_lng):
    """Fetch routes from OpenRouteService (OSM-based)"""
    if not ORS_KEY:
        return []

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    headers = {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': ORS_KEY,
        'Content-Type': 'application/json; charset=utf-8'
    }
    body = {
        "coordinates": [[start_lng, start_lat], [end_lng, end_lat]],
        "alternative_routes": {
            "target_count": 3,
            "share_factor": 0.85  # Allow more overlap to ensure we get 3 routes even in sparse areas
        },
        "instructions": "true"
    }

    try:
        response = requests.post(url, json=body, headers=headers, timeout=10)
        if response.status_code != 200:
            return []

        data = response.json()
        features = data.get("features", [])
        
        routes = []
        for idx, feature in enumerate(features):
            props = feature["properties"]
            summary = props["summary"]
            segments = props["segments"][0]
            
            directions = []
            for s_idx, step in enumerate(segments.get("steps", [])):
                directions.append({
                    "step": s_idx + 1,
                    "instruction": step.get("instruction", ""),
                    "distance": round(step.get("distance", 0) / 1000, 2),
                    "duration": round(step.get("duration", 0) / 60, 1)
                })

            # BANGALORE TRAFFIC REALITY CHECK
            # Standard ORS time is often 2-3x faster than real Bangalore traffic
            raw_duration_min = summary.get("duration", 0) / 60
            
            # Apply a 2.5x multiplier if we are in Bangalore to match Google Maps reality
            # (19 mins becomes ~48 mins, which is much more accurate for 16km in BLR)
            is_blr = (12.7 <= start_lat <= 13.2)
            traffic_multiplier = 2.5 if is_blr else 1.2
            realistic_duration = round(raw_duration_min * traffic_multiplier, 1)

            routes.append({
                "route_id": idx + 1,
                "route_name": f"OSM Route {idx + 1}",
                "distance": round(summary.get("distance", 0) / 1000, 1),
                "duration": realistic_duration,
                "coords": feature["geometry"]["coordinates"],
                "directions": directions,
                "verified": True
            })
        return routes
    except Exception as e:
        return []

def recommend_route(start_lat, start_lng, end_lat, end_lng, condition="normal", start_name="", end_name=""):
    """OSM Pipeline with optimized parallel fetching"""
    print(f"OSM Route Finder: {start_name or 'Origin'} to {end_name or 'Destination'} ({condition})")
    
    alpha_map = {
        "asthma": 0.8, "heart disease": 0.8, "pregnant": 0.8,
        "elderly": 0.7, "child": 0.7, "normal": 0.5,
    }
    alpha = alpha_map.get(condition.lower(), 0.5)

    routes = get_osm_routes(start_lat, start_lng, end_lat, end_lng)
    if not routes:
        return []

    results = []
    for route in routes:
        point_aqi = get_granular_route_aqi(route["coords"], condition)
        
        if not point_aqi:
            region = get_region(start_lat, start_lng)
            fallback = REGION_AQI_FALLBACK[region]
            avg_pm25, avg_no2, avg_pm10, avg_aqi, avg_o3 = fallback["pm25"], fallback["no2"], fallback["pm10"], fallback["aqi"], fallback["o3"]
            avg_wes = calculate_wes(avg_pm25, avg_pm10, avg_no2, avg_o3, condition, duration_min=route["duration"])
        else:
            # Calculate granular averages for the entire path
            avg_pm25 = round(sum((p["pm25"] or 0) for p in point_aqi) / len(point_aqi), 1)
            avg_no2  = round(sum((p["no2"]  or 0) for p in point_aqi) / len(point_aqi), 1)
            avg_pm10 = round(sum((p["pm10"] or 0) for p in point_aqi) / len(point_aqi), 1)
            avg_o3   = round(sum((p.get("o3") or 0) for p in point_aqi) / len(point_aqi), 1)
            avg_aqi  = round(sum(p["aqi"] for p in point_aqi) / len(point_aqi), 1)

            # CRITICAL FIX: Use CUMULATIVE Exposure (Pollution Level * Duration)
            # This ensures that even if air quality is similar, longer routes reflect higher total risk
            avg_wes = calculate_wes(avg_pm25, avg_pm10, avg_no2, avg_o3, condition, duration_min=route["duration"])

        # Normalize for combined score (Scale: WES ~150 is high, Distance ~15km is typical)
        norm_wes = avg_wes / 150
        norm_dist = route["distance"] / 15
        combined = round((alpha * norm_wes) + ((1 - alpha) * norm_dist), 4)

        results.append({
            "route_id": route["route_id"],
            "route_name": route.get("route_name") or f"Route {route['route_id']}",
            "distance": route["distance"],
            "duration": route["duration"],
            "avg_wes": avg_wes,
            "risk": get_risk(avg_wes),
            "combined_score": combined,
            "avg_pm25": avg_pm25,
            "avg_no2": avg_no2,
            "avg_pm10": avg_pm10,
            "avg_aqi": avg_aqi,
            "coords": route["coords"],
            "point_aqi": point_aqi,
            "directions": route["directions"],
            "recommended": False,
            "recommendation_reason": "",
            "data_source": "OSM + WAQI Granular",
            "data_verified": len(point_aqi) > 0
        })

    if not results: return []
    
    # Sort by combined score (lower is better)
    results.sort(key=lambda x: x["combined_score"])
    results[0]["recommended"] = True
    
    # Generate human-readable reason for the recommendation
    best = results[0]
    others = results[1:] if len(results) > 1 else []
    
    if others:
        fastest = min(results, key=lambda x: x["distance"])
        if best["route_id"] == fastest["route_id"]:
            best["recommendation_reason"] = "This is both the fastest and the healthiest route available."
        else:
            wes_save = round(((fastest["avg_wes"] - best["avg_wes"]) / max(fastest["avg_wes"], 1)) * 100)
            best["recommendation_reason"] = f"Reduces pollution exposure by {wes_save}% compared to the fastest route, with a minimal time trade-off."
    else:
        best["recommendation_reason"] = "Optimal health-aware path found for your condition."
    
    print(f"   OK: Done! Processed {len(results)} routes.")
    return results
