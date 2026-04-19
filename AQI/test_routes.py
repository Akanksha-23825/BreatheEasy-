import requests

ORS_KEY    = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjNkNjNkNjIyYjk4YjQ2NjRiZmMyMGE3NzZmMWRmOTA2IiwiaCI6Im11cm11cjY0In0="
WAQI_TOKEN = "c4db6c2113ee55a3dcb7ca680537c39a9d07ca4a"

# ---- STEP 1: GET ROUTE FROM ORS ----
def get_route(start_lng, start_lat, end_lng, end_lat):
    url     = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {"Authorization": ORS_KEY}
    params  = {
        "start": f"{start_lng},{start_lat}",
        "end":   f"{end_lng},{end_lat}"
    }
    data     = requests.get(url, headers=headers, params=params).json()
    coords   = data["features"][0]["geometry"]["coordinates"]
    distance = data["features"][0]["properties"]["summary"]["distance"]
    duration = data["features"][0]["properties"]["summary"]["duration"]
    return coords, round(distance/1000, 1), round(duration/60, 1)

# ---- STEP 2: SAMPLE WAYPOINTS ----
def sample_waypoints(coords, n=10):
    step    = max(1, len(coords) // n)
    sampled = coords[::step][:n]
    return sampled

# ---- STEP 3: GET AQI FOR A COORDINATE ----
def get_aqi_by_coords(lat, lng):
    url  = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={WAQI_TOKEN}"
    data = requests.get(url).json()
    if data["status"] == "ok":
        iaqi = data["data"]["iaqi"]
        return {
            "station": data["data"]["city"]["name"],
            "aqi":     data["data"]["aqi"],
            "pm25":    iaqi.get("pm25", {}).get("v", None),
            "pm10":    iaqi.get("pm10", {}).get("v", None),
            "no2":     iaqi.get("no2",  {}).get("v", None),
            "o3":      iaqi.get("o3",   {}).get("v", None),
        }
    return None

# ---- STEP 4: WES FORMULA ----
VULNERABILITY = {
    "normal":        1.0,
    "elderly":       1.3,
    "child":         1.3,
    "asthma":        1.6,
    "heart disease": 1.6,
    "pregnant":      1.8,
}
WEIGHTS = {
    "normal":        {"pm25": 0.4,  "pm10": 0.3,  "no2": 0.2,  "o3": 0.1},
    "asthma":        {"pm25": 0.5,  "pm10": 0.3,  "no2": 0.1,  "o3": 0.1},
    "heart disease": {"pm25": 0.4,  "pm10": 0.2,  "no2": 0.3,  "o3": 0.1},
    "pregnant":      {"pm25": 0.45, "pm10": 0.3,  "no2": 0.15, "o3": 0.1},
    "elderly":       {"pm25": 0.35, "pm10": 0.35, "no2": 0.15, "o3": 0.15},
    "child":         {"pm25": 0.45, "pm10": 0.3,  "no2": 0.15, "o3": 0.1},
}

def calculate_wes(pm25, pm10, no2, o3, condition="normal"):
    vf   = VULNERABILITY[condition]
    w    = WEIGHTS[condition]
    pm25 = pm25 or (pm10 * 0.8 if pm10 else 0)
    pm10 = pm10 or 0
    no2  = no2  or 0
    o3   = o3   or 0
    return round(
        (pm25 * w["pm25"] * vf) +
        (pm10 * w["pm10"] * vf) +
        (no2  * w["no2"]  * vf) +
        (o3   * w["o3"]   * vf), 2
    )

def get_risk(wes):
    if wes < 50:  return "🟢 Safe"
    if wes < 100: return "🟡 Moderate"
    if wes < 150: return "🟠 High Risk"
    return               "🔴 Dangerous"

# ---- STEP 5: EVALUATE ONE ROUTE ----
def evaluate_route(label, start, end, condition):
    start_lng, start_lat = start
    end_lng,   end_lat   = end

    coords, dist_km, dur_min = get_route(start_lng, start_lat, end_lng, end_lat)
    waypoints = sample_waypoints(coords, n=10)

    print(f"\n📍 {label}")
    print(f"   Distance: {dist_km} km  |  Est. Time: {dur_min} mins")
    print(f"   {'─'*55}")

    total_wes = 0
    count     = 0
    seen_stations = set()  # track stations already counted

    for i, (lng, lat) in enumerate(waypoints):
        d = get_aqi_by_coords(lat, lng)
        if d:
            # skip if we already recorded this station
            if d["station"] in seen_stations:
                continue
            seen_stations.add(d["station"])

            wes        = calculate_wes(d["pm25"], d["pm10"], d["no2"], d["o3"], condition)
            total_wes += wes
            count     += 1
            print(f"   ✦ {d['station'][:40]:<40} AQI:{str(d['aqi']):<5} WES:{wes}")

    avg_wes = round(total_wes / count, 2) if count else 999
    print(f"   {'─'*55}")
    print(f"   Unique stations checked: {count}")
    print(f"   Avg WES: {avg_wes}  →  {get_risk(avg_wes)}")
    return avg_wes, dist_km, dur_min

# ---- STEP 6: RUN ----
USER_CONDITION = "asthma"  # try: normal, asthma, pregnant, child, elderly, heart disease

RVCE       = (77.4989, 12.9236)
WHITEFIELD = (77.7500, 12.9698)
HEBBAL     = (77.5970, 13.0350)

print(f"\n🌬️  BreatheEasy+ Route Recommendation")
print(f"👤 User Condition : {USER_CONDITION.upper()}")
print(f"📌 From: RVCE  →  To: Whitefield")
print(f"{'='*60}")

wes_a, dist_a, dur_a = evaluate_route(
    "Route A: Direct via Outer Ring Road",
    RVCE, WHITEFIELD, USER_CONDITION
)
wes_b, dist_b, dur_b = evaluate_route(
    "Route B: Via Hebbal northern bypass",
    RVCE, HEBBAL, USER_CONDITION
)

print(f"\n{'='*60}")
print(f"📊 FINAL COMPARISON")
print(f"   Route A → WES: {wes_a}  |  {dist_a} km  |  {dur_a} mins")
print(f"   Route B → WES: {wes_b}  |  {dist_b} km  |  {dur_b} mins")
print(f"\n{'='*60}")

if wes_a <= wes_b:
    print(f"✅ RECOMMENDED: Route A (WES: {wes_a}) — cleaner air exposure")
    print(f"❌ AVOID:       Route B (WES: {wes_b})")
else:
    print(f"✅ RECOMMENDED: Route B (WES: {wes_b}) — cleaner air exposure")
    print(f"❌ AVOID:       Route A (WES: {wes_a})")