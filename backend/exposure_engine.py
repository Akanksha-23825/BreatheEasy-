# exposure_engine.py - COMPLETE WES EQUATIONS FOR ALL PATIENTS

"""
WEIGHTED EXPOSURE SCORE (WES) FORMULA:
WES = Σ (Pollutant_Concentration × Sensitivity_Weight × Breathing_Factor)

Where:
- Pollutant_Concentration: Actual value in µg/m³ from WAQI
- Sensitivity_Weight: How dangerous this pollutant is for the condition (0-1)
- Breathing_Factor: How much air this person inhales (relative to normal)
"""

# SENSITIVITY WEIGHTS for each pollutant and condition
# Higher weight = more dangerous for this condition
SENSITIVITY_WEIGHTS = {
    "asthma": {
        "pm25": 0.9,    # Most dangerous - triggers attacks
        "pm10": 0.8,    # Highly dangerous - irritates airways
        "no2": 0.7,     # Moderately dangerous - causes inflammation
        "o3": 0.6,      # Less dangerous but still irritates
        "reasoning": "PM2.5 and PM10 penetrate deep into lungs, triggering bronchial inflammation"
    },
    "heart disease": {
        "pm25": 0.8,    # Very dangerous - enters bloodstream
        "pm10": 0.6,    # Moderately dangerous - some cardiovascular effect
        "no2": 0.9,     # MOST dangerous - reduces oxygen delivery
        "o3": 0.5,      # Less dangerous - minimal direct heart effect
        "reasoning": "NO2 reduces oxygen delivery to heart while PM2.5 causes arterial inflammation"
    },
    "pregnant": {
        "pm25": 0.9,    # MOST dangerous - crosses placenta
        "pm10": 0.7,    # Dangerous - developmental concerns
        "no2": 0.6,     # Moderate risk
        "o3": 0.8,      # Highly dangerous - birth complications
        "reasoning": "PM2.5 and O3 can cross placenta and affect fetal development"
    },
    "elderly": {
        "pm25": 0.8,    # High - reduced lung function
        "pm10": 0.7,    # High - general respiratory stress
        "no2": 0.7,     # High - cardiovascular strain
        "o3": 0.6,      # Moderate - still concerning
        "reasoning": "All pollutants are concerning due to reduced organ reserve"
    },
    "child": {
        "pm25": 0.9,    # MOST dangerous - developing lungs
        "pm10": 0.8,    # Very dangerous - higher breathing rate
        "no2": 0.8,     # Very dangerous - affects lung development
        "o3": 0.7,      # Dangerous - causes respiratory issues
        "reasoning": "Children breathe faster and developing lungs are more vulnerable to PM2.5 and NO2"
    },
    "normal": {
        "pm25": 0.5,    # Primary concern
        "pm10": 0.4,    # Secondary concern
        "no2": 0.3,     # Minimal at typical levels
        "o3": 0.3,      # Minimal at typical levels
        "reasoning": "PM2.5 is primary concern for general population"
    }
}

# BREATHING RATE FACTOR (relative to normal adult)
# Higher = more air inhaled = more pollutant intake
BREATHING_FACTOR = {
    "asthma": 1.3,      # Higher during potential attack
    "heart disease": 1.1,  # Slightly elevated
    "pregnant": 1.2,    # Increased oxygen demand (20% more air)
    "elderly": 0.9,     # Slightly reduced lung capacity
    "child": 1.4,       # Much higher per kg body weight (40% more)
    "normal": 1.0       # Baseline
}

# REFERENCE VALUES for context (not used in calculation, just for display)
REFERENCE_VALUES = {
    "pm25": {"good": 15, "moderate": 40, "unhealthy": 65},
    "pm10": {"good": 50, "moderate": 100, "unhealthy": 150},
    "no2": {"good": 40, "moderate": 80, "unhealthy": 120},
    "o3": {"good": 50, "moderate": 100, "unhealthy": 130}
}

def calculate_wes(pm25, pm10, no2, o3, condition="normal"):
    """
    Calculate Weighted Exposure Score using condition-specific weights.
    
    WES = Σ (Pollutant × Weight × Breathing_Factor)
    
    Range: 0-500
    - 0-50: Safe
    - 50-100: Moderate
    - 100-150: High Risk
    - 150+: Dangerous
    
    Example for ASTHMA:
    If PM2.5=80, PM10=100, NO2=40, O3=30:
    WES = (80 × 0.9 × 1.3) + (100 × 0.8 × 1.3) + (40 × 0.7 × 1.3) + (30 × 0.6 × 1.3)
        = 93.6 + 104 + 36.4 + 23.4
        = 257.4 (DANGEROUS)
    """
    
    # Get weights for this condition
    weights = SENSITIVITY_WEIGHTS.get(condition, SENSITIVITY_WEIGHTS["normal"])
    breathing = BREATHING_FACTOR.get(condition, 1.0)
    
    # Handle missing data (default to 0)
    pm25 = pm25 or 0
    pm10 = pm10 or 0
    no2 = no2 or 0
    o3 = o3 or 0
    
    # Calculate WES
    wes = (
        (pm25 * weights["pm25"] * breathing) +
        (pm10 * weights["pm10"] * breathing) +
        (no2 * weights["no2"] * breathing) +
        (o3 * weights["o3"] * breathing)
    )
    
    return round(wes, 2)

def get_wes_breakdown(pm25, pm10, no2, o3, condition="normal"):
    """
    Show how WES is calculated step by step
    Useful for debugging and user education
    """
    weights = SENSITIVITY_WEIGHTS.get(condition, SENSITIVITY_WEIGHTS["normal"])
    breathing = BREATHING_FACTOR.get(condition, 1.0)
    
    pm25_contrib = pm25 * weights["pm25"] * breathing if pm25 else 0
    pm10_contrib = pm10 * weights["pm10"] * breathing if pm10 else 0
    no2_contrib = no2 * weights["no2"] * breathing if no2 else 0
    o3_contrib = o3 * weights["o3"] * breathing if o3 else 0
    
    total = pm25_contrib + pm10_contrib + no2_contrib + o3_contrib
    
    return {
        "condition": condition,
        "breathing_factor": breathing,
        "contributions": {
            "PM2.5": round(pm25_contrib, 2),
            "PM10": round(pm10_contrib, 2),
            "NO2": round(no2_contrib, 2),
            "O3": round(o3_contrib, 2)
        },
        "total_wes": round(total, 2),
        "formula": f"WES = ({pm25}×{weights['pm25']}×{breathing}) + ({pm10}×{weights['pm10']}×{breathing}) + ({no2}×{weights['no2']}×{breathing}) + ({o3}×{weights['o3']}×{breathing}) = {round(total, 2)}"
    }

def compare_patients(pm25, pm10, no2, o3):
    """
    Show how different patients experience the SAME air differently
    """
    patients = ["asthma", "heart disease", "pregnant", "elderly", "child", "normal"]
    results = {}
    
    for patient in patients:
        wes = calculate_wes(pm25, pm10, no2, o3, patient)
        if wes < 50:
            risk = "🟢 Safe"
        elif wes < 100:
            risk = "🟡 Moderate"
        elif wes < 150:
            risk = "🟠 High Risk"
        else:
            risk = "🔴 DANGEROUS"
        results[patient] = {"wes": wes, "risk": risk}
    
    return results

# Risk thresholds (same for all, but different WES values cross thresholds differently)
def get_risk(wes):
    if wes < 50: return "Safe"
    if wes < 100: return "Moderate"
    if wes < 150: return "High Risk"
    return "Dangerous"

def get_risk_emoji(wes):
    if wes < 50: return "🟢 Safe"
    if wes < 100: return "🟡 Moderate"
    if wes < 150: return "🟠 High Risk"
    return "🔴 Dangerous"

def calculate_safe_time(condition, aqi):
    """Maximum safe outdoor hours based on condition and AQI"""
    dec_table = {
        "normal": 200,
        "asthma": 120,
        "heart disease": 130,
        "pregnant": 150,
        "elderly": 140,
        "child": 110
    }
    dec = dec_table.get(condition, 200)
    safe = round(dec / max(aqi, 1), 2)
    return max(safe, 0.25)

# Test function
if __name__ == "__main__":
    print("=" * 70)
    print("WES EQUATION DEMO - Same Air, Different Patients")
    print("=" * 70)
    
    # Example: High PM2.5 scenario (traffic junction)
    print("\n📊 Scenario: Heavy Traffic Area")
    print(f"   PM2.5: 120 µg/m³ | PM10: 150 µg/m³ | NO2: 80 µg/m³ | O3: 40 µg/m³")
    print("-" * 70)
    
    comparison = compare_patients(120, 150, 80, 40)
    
    for patient, data in comparison.items():
        print(f"{patient.upper():15} → WES: {data['wes']:6.2f}  ({data['risk']})")
    
    print("\n" + "=" * 70)
    print("🔬 Detailed Breakdown for ASTHMA Patient:")
    print("=" * 70)
    
    breakdown = get_wes_breakdown(120, 150, 80, 40, "asthma")
    print(f"\n{breakdown['formula']}")
    print(f"\nContributions:")
    for pollutant, contrib in breakdown['contributions'].items():
        print(f"  {pollutant}: {contrib}")
    print(f"\nReasoning: {SENSITIVITY_WEIGHTS['asthma']['reasoning']}")