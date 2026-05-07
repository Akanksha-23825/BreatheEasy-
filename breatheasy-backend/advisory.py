from waqi_client import get_current_aqi, get_forecast, get_safest_window

# def find_safest_window(city: str) -> str:
#     """Get safest time window using WAQI forecast data."""
#     return get_safest_window(city)


# from waqi_client import get_current_aqi, get_forecast, get_safest_window

def find_safest_window(city: str, condition: str = 'healthy') -> str:
    """Get safest time window personalized to health condition."""
    
    forecast = get_forecast(city)
    if not forecast:
        return '06:00 AM'

    from datetime import date
    today = str(date.today())

    # Find best forecast day
    best = min(forecast, key=lambda x: x['pm25_avg'])
    best_pm25 = best['pm25_avg']

    # Personalized thresholds — what's "acceptable" per condition
    SAFE_THRESHOLDS = {
        'healthy':  100,
        'asthma':    60,
        'heart':     70,
        'pregnant':  80,
        'elderly':   75,
    }

    # Condition-specific advice
    CONDITION_ADVICE = {
        'healthy':  '',
        'asthma':   'Carry your inhaler.',
        'heart':    'Keep activity light.',
        'pregnant': 'Limit to short walks.',
        'elderly':  'Avoid strenuous activity.',
    }

    threshold = SAFE_THRESHOLDS.get(condition, 100)
    advice    = CONDITION_ADVICE.get(condition, '')

    if best['day'] == today:
        time_str = '06:00 AM today'
    else:
        time_str = 'Tomorrow morning'

    if best_pm25 <= threshold:
        return f"{time_str} (PM2.5: {best_pm25}) ✅ {advice}".strip()
    else:
        return f"{time_str} (PM2.5: {best_pm25}) ⚠️ Still elevated for {condition}. {advice}".strip()


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

def get_recommended_window(aqi, health_condition):

    vulnerability_map = {
        "Healthy": 1.0,
        "Asthma": 1.8,
        "COPD": 2.0,
        "Elderly": 1.6
    }

    vf = vulnerability_map.get(health_condition, 1.0)

    adjusted_risk = aqi * vf

    if adjusted_risk < 80:
        return "Early Morning (6–8 AM)"

    elif adjusted_risk < 140:
        return "Late Evening (7–9 PM)"

    elif adjusted_risk < 200:
        return "Short outdoor activity after 9 PM"

    else:
        return "Avoid outdoor exposure today"