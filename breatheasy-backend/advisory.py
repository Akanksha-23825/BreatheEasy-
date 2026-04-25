from waqi_client import get_current_aqi, get_forecast, get_safest_window

def find_safest_window(city: str) -> str:
    """Get safest time window using WAQI forecast data."""
    return get_safest_window(city)


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