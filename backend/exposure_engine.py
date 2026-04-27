# exposure_engine.py
# All math/formulas — no API calls here

"""
WEIGHTED EXPOSURE SCORE (WES) FORMULA:
WES = Σ (Pollutant_Concentration × Sensitivity_Weight × Breathing_Factor)

Where:
- Pollutant_Concentration: Actual µg/m³ value from CPCB/WAQI
- Sensitivity_Weight: How dangerous this pollutant is for the condition
- Breathing_Factor: How much air this person inhales relative to normal adult
"""

# ── SENSITIVITY WEIGHTS ───────────────────────────────────────────
# Medical basis: WHO Air Quality Guidelines 2021 + CPCB health impact studies
SENSITIVITY_WEIGHTS = {
    "asthma": {
        "pm25": 0.9,  # Most dangerous — triggers bronchospasm
        "pm10": 0.8,  # Highly dangerous — irritates airways
        "no2":  0.7,  # Causes airway inflammation
        "o3":   0.6,  # Irritates bronchial lining
        "reasoning": "PM2.5 and PM10 penetrate deep into lungs, triggering bronchial inflammation"
    },
    "heart disease": {
        "pm25": 0.8,  # Very dangerous — enters bloodstream, causes arterial inflammation
        "pm10": 0.6,  # Moderate cardiovascular effect
        "no2":  0.9,  # MOST dangerous — reduces oxygen delivery to heart
        "o3":   0.5,  # Minimal direct heart effect
        "reasoning": "NO2 reduces oxygen delivery to heart while PM2.5 causes arterial inflammation"
    },
    "pregnant": {
        "pm25": 0.9,  # MOST dangerous — crosses placenta, affects fetal development
        "pm10": 0.7,  # Developmental concerns
        "no2":  0.6,  # Moderate fetal risk
        "o3":   0.8,  # High risk — linked to birth complications
        "reasoning": "PM2.5 and O3 can cross placenta and affect fetal development"
    },
    "elderly": {
        "pm25": 0.8,  # High — reduced lung function with age
        "pm10": 0.7,  # High — general respiratory stress
        "no2":  0.7,  # High — cardiovascular strain
        "o3":   0.6,  # Moderate — still concerning for reduced immunity
        "reasoning": "All pollutants are concerning due to reduced organ reserve capacity"
    },
    "child": {
        "pm25": 0.9,  # MOST dangerous — developing lungs absorb more
        "pm10": 0.8,  # Very dangerous — higher breathing rate per body weight
        "no2":  0.8,  # Very dangerous — affects lung development
        "o3":   0.7,  # Dangerous — causes respiratory issues in developing lungs
        "reasoning": "Children breathe faster per body weight; developing lungs are more vulnerable"
    },
    "normal": {
        "pm25": 0.5,  # Primary concern for general population
        "pm10": 0.4,  # Secondary concern
        "no2":  0.3,  # Minimal at typical urban levels
        "o3":   0.3,  # Minimal at typical urban levels
        "reasoning": "PM2.5 is primary concern for general healthy adults"
    }
}

# ── BREATHING RATE FACTOR ─────────────────────────────────────────
# Relative to normal adult at rest (1.0 = baseline)
# Source: WHO breathing rate data per demographic
BREATHING_FACTOR = {
    "asthma":        1.3,   # Higher during inflammation episodes (+30%)
    "heart disease": 1.1,   # Slightly elevated due to compensation (+10%)
    "pregnant":      1.2,   # Increased oxygen demand, 20% more air intake
    "elderly":       0.9,   # Slightly reduced lung capacity (-10%)
    "child":         1.4,   # Much higher per kg body weight (+40%)
    "normal":        1.0    # Baseline adult
}

# ── DEC TABLE (Daily Exposure Capacity) ───────────────────────────
# Used to calculate max safe outdoor hours
DEC_TABLE = {
    "normal":        200,
    "asthma":        120,
    "heart disease": 130,
    "pregnant":      150,
    "elderly":       140,
    "child":         110,
}


# ── CORE FUNCTIONS ────────────────────────────────────────────────

def calculate_wes(pm25, pm10, no2, o3, condition="normal", duration_min=30):
    """
    Calculate Weighted Exposure Score (WES).
    
    Now includes DURATION to reflect total exposure.
    Exposure = Concentration × Sensitivity × Breathing × (Time / 30min)
    
    Risk ranges (scaled for 30min base):
    0-50:   Safe
    50-100: Moderate
    100-150: High Risk
    150+:   Dangerous
    """
    weights   = SENSITIVITY_WEIGHTS.get(condition, SENSITIVITY_WEIGHTS["normal"])
    breathing = BREATHING_FACTOR.get(condition, 1.0)
    
    # Time factor (normalized to 30 mins)
    # If a route is 60 mins, exposure is doubled.
    time_factor = duration_min / 30.0

    pm25 = pm25 or 0
    pm10 = pm10 or 0
    no2  = no2  or 0
    o3   = o3   or 0

    base_wes = (
        (pm25 * weights["pm25"] * breathing) +
        (pm10 * weights["pm10"] * breathing) +
        (no2  * weights["no2"]  * breathing) +
        (o3   * weights["o3"]   * breathing)
    )
    
    wes = base_wes * time_factor
    return round(wes, 2)


def get_wes_breakdown(pm25, pm10, no2, o3, condition="normal", duration_min=30):
    """Return step-by-step WES calculation — useful for UI display"""
    weights   = SENSITIVITY_WEIGHTS.get(condition, SENSITIVITY_WEIGHTS["normal"])
    breathing = BREATHING_FACTOR.get(condition, 1.0)
    time_factor = duration_min / 30.0

    contributions = {
        "PM2.5": round((pm25 or 0) * weights["pm25"] * breathing * time_factor, 2),
        "PM10":  round((pm10 or 0) * weights["pm10"] * breathing * time_factor, 2),
        "NO2":   round((no2  or 0) * weights["no2"]  * breathing * time_factor, 2),
        "O3":    round((o3   or 0) * weights["o3"]   * breathing * time_factor, 2),
    }
    total = sum(contributions.values())

    return {
        "condition":        condition,
        "duration_min":     duration_min,
        "breathing_factor": breathing,
        "contributions":    contributions,
        "total_wes":        round(total, 2),
        "reasoning":        weights["reasoning"],
        "formula": (
            f"WES = [({pm25}×{weights['pm25']}×{breathing})"
            f" + ({pm10}×{weights['pm10']}×{breathing})"
            f" + ({no2}×{weights['no2']}×{breathing})"
            f" + ({o3}×{weights['o3']}×{breathing})]"
            f" × ({duration_min}/30)"
            f" = {round(total, 2)}"
        )
    }


def compare_patients(pm25, pm10, no2, o3):
    """
    Show how different patients experience the SAME air.
    Useful for demo day — proves personalization works.
    """
    results = {}
    for condition in ["asthma", "heart disease", "pregnant", "elderly", "child", "normal"]:
        wes = calculate_wes(pm25, pm10, no2, o3, condition)
        results[condition] = {"wes": wes, "risk": get_risk_emoji(wes)}
    return results


def calculate_el(wes, outdoor_hours):
    """Exposure Load = WES × hours spent outdoors"""
    return round(wes * outdoor_hours, 2)


def calculate_safe_time(condition, aqi):
    """Maximum safe outdoor hours based on condition and current AQI"""
    dec  = DEC_TABLE.get(condition, 200)
    safe = round(dec / max(aqi, 1), 2)
    return max(safe, 0.25)  # minimum 15 minutes


def get_risk(wes):
    if wes < 50:  return "Safe"
    if wes < 100: return "Moderate"
    if wes < 150: return "High Risk"
    return               "Dangerous"


def get_risk_emoji(wes):
    if wes < 50:  return "🟢 Safe"
    if wes < 100: return "🟡 Moderate"
    if wes < 150: return "🟠 High Risk"
    return               "🔴 Dangerous"


# ── DEMO / TEST ───────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 70)
    print("WES DEMO — Same Air, Different Patients")
    print("Scenario: Heavy Traffic Junction")
    print(f"PM2.5=120 µg/m³ | PM10=150 µg/m³ | NO2=80 µg/m³ | O3=40 µg/m³")
    print("=" * 70)

    results = compare_patients(120, 150, 80, 40)
    for condition, data in results.items():
        print(f"{condition.upper():15} → WES: {data['wes']:6.1f}  {data['risk']}")

    print("\n" + "=" * 70)
    print("Detailed Breakdown — ASTHMA Patient:")
    print("=" * 70)
    breakdown = get_wes_breakdown(120, 150, 80, 40, "asthma")
    print(f"\nFormula: {breakdown['formula']}")
    print(f"Reasoning: {breakdown['reasoning']}")