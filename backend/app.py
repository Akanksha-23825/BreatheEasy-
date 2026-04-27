# app.py
# Flask server — API endpoints only

from flask import Flask, jsonify, request
from flask_cors import CORS
from ola_oauth_router import recommend_route, get_waqi_data, get_region, REGION_AQI_FALLBACK
from exposure_engine import calculate_safe_time, get_risk_emoji
from datetime import datetime

app = Flask(__name__)
CORS(app)


# ── HEALTH CHECK ──────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status":   "BreatheEasy+ backend is running",
        "version":  "2.0",
        "endpoints": ["/api/route", "/api/advisory"]
    })


# ── ROUTE RECOMMENDATION ──────────────────────────────────────────
@app.route("/api/route", methods=["POST"])
def get_route_recommendation():
    """
    Input JSON:
    {
        "start_lat":  12.9236,
        "start_lng":  77.4989,
        "end_lat":    12.9698,
        "end_lng":    77.7500,
        "condition":  "asthma",
        "start_name": "RVCE",       (optional)
        "end_name":   "Whitefield"  (optional)
    }
    """
    data = request.json

    # Validate required fields
    for field in ["start_lat", "start_lng", "end_lat", "end_lng"]:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    start_lat  = data["start_lat"]
    start_lng  = data["start_lng"]
    end_lat    = data["end_lat"]
    end_lng    = data["end_lng"]
    condition  = data.get("condition",  "normal")
    start_name = data.get("start_name", "")
    end_name   = data.get("end_name",   "")

    try:
        # FIX: Now passes start_name and end_name to recommend_route
        routes = recommend_route(
            start_lat, start_lng,
            end_lat,   end_lng,
            condition, start_name, end_name
        )

        if not routes:
            return jsonify({"error": "No routes found. Check coordinates or Ola Maps API."}), 404

        return jsonify({
            "success":   True,
            "condition": condition,
            "routes":    routes,
            "summary": {
                "total_routes":     len(routes),
                "live_data_routes": sum(1 for r in routes if r.get("data_verified")),
                "timestamp":        datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── SAFE TIME ADVISORY ────────────────────────────────────────────
@app.route("/api/advisory", methods=["POST"])
def get_advisory():
    """
    Input JSON:
    {
        "condition": "asthma",
        "aqi":       144
    }
    """
    data      = request.json
    condition = data.get("condition", "normal")
    aqi       = data.get("aqi", 100)

    safe_hours = calculate_safe_time(condition, aqi)
    risk       = get_risk_emoji(aqi)

    if aqi <= 50:
        message = "Air quality is good. Safe to go outside normally."
    elif aqi <= 100:
        message = f"Air quality is satisfactory. Limit outdoor time to {safe_hours} hours."
    elif aqi <= 200:
        message = f"Air is moderately polluted. Limit outdoor time to {safe_hours} hours. Wear a mask."
    elif aqi <= 300:
        message = f"Air quality is poor. Strictly limit outdoor activity to {safe_hours} hours."
    else:
        message = f"Severe pollution. Avoid going outside. If necessary, limit to {safe_hours} hours with N95 mask."

    return jsonify({
        "condition":  condition,
        "aqi":        aqi,
        "safe_hours": safe_hours,
        "risk":       risk,
        "message":    message
    })


# ── SINGLE POINT AQI ──────────────────────────────────────────────
@app.route("/api/aqi", methods=["GET"])
def get_point_aqi():
    """
    Get AQI for a specific point.
    Query params: lat, lng
    """
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    
    if lat is None or lng is None:
        return jsonify({"error": "Missing lat/lng"}), 400
        
    data = get_waqi_data(lat, lng)
    if not data:
        # Fallback to regional estimate if API fails or returns foreign data
        region = get_region(lat, lng)
        data = REGION_AQI_FALLBACK[region]
        data["source"] = "Estimated (Regional Fallback)"
    else:
        data["source"] = "Real-time CPCB / WAQI"
        
    return jsonify(data)


# ── RUN ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*55)
    print("🚀 BreatheEasy+ Backend v2.0")
    print("   http://localhost:5000")
    print("="*55 + "\n")
    app.run(debug=True, port=5000)