from waqi_client import get_current_aqi, get_forecast, get_safest_window

# ─── Condition Config ─────────────────────────────────────────────────────────
CONDITION_CONFIG = {
    'healthy':  {'threshold': 100.0, 'vf': 1.0},
    'asthma':   {'threshold':  55.0, 'vf': 1.8},
    'heart':    {'threshold':  65.0, 'vf': 1.6},
    'pregnant': {'threshold':  75.0, 'vf': 1.4},
    'elderly':  {'threshold':  70.0, 'vf': 1.7},
    'children': {'threshold':  50.0, 'vf': 1.5},
}

WINDOWS = [
    {"name": "Early Morning", "time": "6–9 AM",  "hours": [6, 7, 8],            "icon": "🌅"},
    {"name": "Late Morning",  "time": "9 AM–12 PM","hours": [9, 10, 11],         "icon": "☀️"},
    {"name": "Afternoon",     "time": "12–4 PM",  "hours": [12, 13, 14, 15],    "icon": "🌤"},
    {"name": "Evening",       "time": "4–7 PM",   "hours": [16, 17, 18],        "icon": "🌇"},
    {"name": "Late Evening",  "time": "7–10 PM",  "hours": [19, 20, 21],        "icon": "🌆"},
    {"name": "Night",         "time": "10 PM–6 AM","hours": [22, 23, 0, 1, 2, 3, 4, 5], "icon": "🌙"},
]


def _get_window_averages(city: str) -> dict:
    """Return PM2.5 average for each window slot from DB history."""
    try:
        from models import HourlyReading
        readings = HourlyReading.query.filter_by(city=city).all()
    except Exception as e:
        print(f"[ADVISORY] DB error: {e}")
        readings = []

    # Typical Bengaluru diurnal PM2.5 pattern fallbacks
    fallbacks = [42.0, 60.0, 38.0, 52.0, 68.0, 48.0]
    buckets = {i: [] for i in range(len(WINDOWS))}
    for r in readings:
        if r.timestamp and r.pm25 is not None:
            h = r.timestamp.hour
            for idx, w in enumerate(WINDOWS):
                if h in w["hours"]:
                    buckets[idx].append(r.pm25)
                    break
    return {
        idx: (sum(v) / len(v) if v else fallbacks[idx])
        for idx, v in buckets.items()
    }


def _personalized_threshold(condition: str, age: int) -> float:
    """Return PM2.5 threshold adjusted for condition and age."""
    cfg = CONDITION_CONFIG.get(condition.lower(), CONDITION_CONFIG['healthy'])
    base = cfg['threshold']
    if age > 65:
        base *= 0.75
    elif age > 55:
        base *= 0.85
    elif age < 10:
        base *= 0.80
    elif age < 18:
        base *= 0.90
    return round(base, 1)


def _ces_risk_label(ces: float) -> str:
    if ces < 100:   return "low"
    if ces < 250:   return "moderate"
    if ces < 500:   return "high"
    return "critical"


def _generate_personalized_advice(
    condition: str, age: int, aqi: float,
    el: float, ces: float, pm25: float,
    window_name: str, window_time: str, window_pm25: float,
    is_today: bool, threshold: float
) -> dict:
    """
    Generate a fully personalized recommendation object.
    Returns a dict with: window_label, time, icon, pm25, status,
    headline, reason, tips[], urgency
    """
    condition = condition.lower()
    ces_level = _ces_risk_label(ces)
    is_safe = window_pm25 <= threshold
    today_str = "today" if is_today else "tomorrow"

    # ── Urgency level ──────────────────────────────────────────────────────────
    if ces_level == "critical" or aqi > 200:
        urgency = "critical"
    elif ces_level == "high" or aqi > 150 or not is_safe:
        urgency = "high"
    elif ces_level == "moderate" or aqi > 100:
        urgency = "moderate"
    else:
        urgency = "low"

    # ── Headline ───────────────────────────────────────────────────────────────
    if urgency == "critical":
        headline = "⛔ Avoid outdoor exposure today"
    elif urgency == "high":
        headline = f"⚠️ Limit outdoor time — {window_name} {today_str} is least harmful"
    elif is_safe:
        headline = f"✅ Best time: {window_name} {today_str}"
    else:
        headline = f"🔶 No ideal window — {window_name} {today_str} is least bad"

    # ── Condition-specific reason ──────────────────────────────────────────────
    condition_reasons = {
        'asthma':   f"PM2.5 at {window_pm25} µg/m³ is {'within' if is_safe else 'above'} your asthma threshold of {threshold} µg/m³.",
        'heart':    f"Cardiac stress peaks with PM2.5 > {threshold}. {'Window is safe.' if is_safe else 'Risk remains elevated.'}",
        'pregnant': f"Fetal exposure risk is {'minimized' if is_safe else 'elevated'} at PM2.5 {window_pm25} µg/m³.",
        'elderly':  f"Respiratory reserve is lower at age {age}. {'Window is acceptable.' if is_safe else 'Extended exposure not advised.'}",
        'children': f"Developing lungs need PM2.5 < {threshold}. {'Safe for short play.' if is_safe else 'Avoid prolonged outdoor play.'}",
        'healthy':  f"AQI is {aqi:.0f}. {'Standard guidelines apply.' if is_safe else 'Sensitive individuals may experience discomfort.'}",
    }
    reason = condition_reasons.get(condition, f"PM2.5: {window_pm25} µg/m³ vs your threshold {threshold} µg/m³.")

    # Add CES context
    if ces_level == "critical":
        reason += f" Your weekly exposure score ({ces:.0f}) is critically high — rest and recover."
    elif ces_level == "high":
        reason += f" Weekly exposure score ({ces:.0f}) is high — minimize additional dose."
    elif ces_level == "moderate":
        reason += f" Weekly exposure is building up ({ces:.0f}) — monitor closely."

    # ── Personalized tips ─────────────────────────────────────────────────────
    tips = []

    # Condition tips
    if condition == 'asthma':
        tips.append("🫁 Keep your rescue inhaler accessible at all times")
        if urgency in ("high", "critical"):
            tips.append("💊 Pre-medicate 15 min before going out (consult doctor)")
    elif condition == 'heart':
        tips.append("❤️ Keep exertion level low — no jogging or climbing")
        tips.append("💧 Stay well-hydrated to support cardiovascular function")
    elif condition == 'pregnant':
        tips.append("🤰 Limit outdoor duration to under 20 minutes per session")
        tips.append("😷 N95 mask significantly reduces fetal PM2.5 exposure")
    elif condition == 'elderly':
        tips.append("🧓 Avoid peak traffic hours — pollution spikes 8–10 AM and 6–8 PM")
        tips.append("🏠 Use an air purifier indoors if AQI exceeds 100")
    elif condition == 'children':
        tips.append("🧒 Outdoor play sessions should be under 30 minutes")
        tips.append("🏃 Avoid vigorous activity — it increases breathing rate and dose")
    else:
        if aqi > 100:
            tips.append("😷 Consider wearing a mask for extended outdoor periods")

    # Age-specific tips
    if age > 65:
        tips.append("🩺 Check with your doctor before outdoor exercise on high AQI days")
    elif age < 12:
        tips.append("👨‍👩‍👧 Children breathe 50% more air per kg — extra caution needed")

    # CES-based tips
    if ces_level in ("high", "critical"):
        tips.append("🏠 Stay indoors and use ventilation to recover your weekly exposure")
    elif ces_level == "moderate":
        tips.append("⏱ Shorten outdoor sessions today to limit cumulative dose")

    # Urgency tips
    if urgency == "critical":
        tips.append("🚨 Air quality is hazardous — postpone all non-essential trips outside")
    elif urgency == "high":
        tips.append("🪟 Keep windows closed and use indoor air filtration")

    # General
    if is_safe:
        tips.append(f"⏰ Target your outdoor activity during {window_time} for best air quality")

    return {
        "window_label": window_name,
        "window_time":  window_time,
        "icon":         WINDOWS[0]["icon"],  # overridden below
        "pm25":         round(window_pm25, 1),
        "threshold":    threshold,
        "is_safe":      is_safe,
        "today_str":    today_str,
        "headline":     headline,
        "reason":       reason,
        "tips":         tips[:5],  # max 5 tips
        "urgency":      urgency,
        "ces_level":    ces_level,
    }


def find_safest_window(city: str, condition: str = 'healthy', age: int = 30,
                       el: float = 0.0, ces: float = 0.0,
                       aqi: float = 0.0, pm25: float = 0.0) -> str:
    """
    Returns a legacy string for backward compatibility.
    Use get_personalized_recommendation() for the full object.
    """
    rec = get_personalized_recommendation(city, condition, age, el, ces, aqi, pm25)
    status = "✅" if rec["is_safe"] else "⚠️"
    return f"{rec['window_label']} ({rec['window_time']}) {rec['today_str']} (PM2.5: {rec['pm25']}) {status} {rec['headline']}"


def get_personalized_recommendation(
    city: str, condition: str = 'healthy', age: int = 30,
    el: float = 0.0, ces: float = 0.0,
    aqi: float = 0.0, pm25: float = 0.0
) -> dict:
    """
    Returns a fully personalized recommendation object based on:
    - Health condition & age → personalized PM2.5 threshold
    - Hourly DB patterns → window averages
    - Current time → only suggest future windows
    - CES/EL → urgency escalation
    - AQI → immediate context
    """
    from datetime import datetime
    now = datetime.now()
    current_hour = now.hour

    threshold = _personalized_threshold(condition, age)
    window_avgs = _get_window_averages(city)

    # Find future windows for today (strict future only)
    future_today = []
    for idx, w in enumerate(WINDOWS):
        max_hour = max(h if h > 0 else 24 for h in w["hours"])
        # Night window: usable if before 22
        if 22 in w["hours"]:
            if current_hour < 22:
                future_today.append((idx, w))
        elif max_hour > current_hour:
            future_today.append((idx, w))

    # Don't recommend if it's past 20:00 (too late for meaningful suggestions)
    if current_hour >= 20:
        future_today = []

    best_idx = None
    is_today = False

    if future_today:
        # Sort by PM2.5 ascending (cleanest first)
        sorted_today = sorted(future_today, key=lambda x: window_avgs[x[0]])
        # Prefer a window that's under threshold, else pick cleanest
        for idx, w in sorted_today:
            if window_avgs[idx] <= threshold:
                best_idx = idx
                is_today = True
                break
        if best_idx is None:
            best_idx = sorted_today[0][0]
            is_today = True

    if best_idx is None:
        # Fall to tomorrow — pick cleanest window
        best_idx = min(range(len(WINDOWS)), key=lambda i: window_avgs[i])
        is_today = False

    chosen_window = WINDOWS[best_idx]
    window_pm25 = window_avgs[best_idx]

    rec = _generate_personalized_advice(
        condition=condition,
        age=age,
        aqi=aqi,
        el=el,
        ces=ces,
        pm25=pm25,
        window_name=chosen_window["name"],
        window_time=chosen_window["time"],
        window_pm25=window_pm25,
        is_today=is_today,
        threshold=threshold,
    )
    rec["icon"] = chosen_window["icon"]
    return rec


def get_forecast_advisory(city: str) -> dict:
    """
    Return full forecast data for the next few days.
    Used by ML advisory and dashboard forecast card.
    """
    forecast = get_forecast(city)
    if not forecast:
        return {'forecast': [], 'best_day': None}

    best = min(forecast, key=lambda x: x['pm25_avg'])
    worst = max(forecast, key=lambda x: x['pm25_avg'])

    return {
        'forecast': forecast,
        'best_day': best['day'],
        'best_pm25': best['pm25_avg'],
        'worst_day': worst['day'],
        'worst_pm25': worst['pm25_avg'],
    }


def get_recommended_window(aqi, pm25, health_condition, age):
    """Legacy function - now delegates to get_personalized_recommendation."""
    rec = get_personalized_recommendation(
        city='Bengaluru', condition=health_condition,
        age=age, aqi=aqi, pm25=pm25
    )
    return {"window": rec["window_label"], "reason": rec["reason"]}
