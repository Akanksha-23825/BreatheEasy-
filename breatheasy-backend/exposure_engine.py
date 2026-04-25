# exposure_engine.py

# ── Vulnerability Factor Table ──
VF_TABLE = {
    'healthy':  1.0,
    'asthma':   1.5,
    'heart':    1.4,
    'pregnant': 1.3,
    'elderly':  1.6,
}

# ── Sensitivity Weights per health condition ──
SENSITIVITY_WEIGHTS = {
    'healthy':  {'pm25': 1.0, 'pm10': 1.0, 'no2': 1.0, 'o3': 1.0},
    'asthma':   {'pm25': 1.3, 'pm10': 1.1, 'no2': 1.4, 'o3': 1.2},
    'heart':    {'pm25': 1.4, 'pm10': 1.1, 'no2': 1.2, 'o3': 1.1},
    'pregnant': {'pm25': 1.3, 'pm10': 1.0, 'no2': 1.1, 'o3': 1.2},
    'elderly':  {'pm25': 1.3, 'pm10': 1.2, 'no2': 1.2, 'o3': 1.3},
}

# ── Risk Thresholds ──
RISK_THRESHOLDS = [
    (150,   'Low',      '#4CAF50'),  # green
    (300,   'Moderate', '#FF9800'),  # amber
    (999999,'High',     '#F44336'),  # red
]

# ── DEC Table (Daily Exposure Capacity) ──
DEC_TABLE = {
    'healthy':  200,
    'asthma':   120,
    'heart':    130,
    'pregnant': 150,
    'elderly':  140,
}


# ── STEP 5: WES Engine ──
def calculate_wes(pm25, pm10, no2, o3, condition, vf):
    """
    Weighted Exposure Score — personalises raw pollutant
    data to the user's health condition.
    WES = (PM2.5 × w_pm25 × VF) + (PM10 × w_pm10 × VF)
        + (NO2 × w_no2 × VF) + (O3 × w_o3 × VF)
    """
    w = SENSITIVITY_WEIGHTS.get(condition, SENSITIVITY_WEIGHTS['healthy'])
    wes = (
        pm25 * w['pm25'] * vf +
        pm10 * w['pm10'] * vf +
        no2  * w['no2']  * vf +
        o3   * w['o3']   * vf
    )
    return round(wes, 2)


# ── STEP 6: EL + Risk Classifier ──
def calculate_el(wes, outdoor_hours):
    """
    Exposure Load = WES × Outdoor Duration (hours)
    Classifies into Low / Moderate / High with colour.
    """
    el = round(wes * outdoor_hours, 2)
    for threshold, label, color in RISK_THRESHOLDS:
        if el <= threshold:
            return {'el': el, 'risk': label, 'color': color}
    return {'el': el, 'risk': 'High', 'color': '#F44336'}


# ── STEP 7: Safe Exposure Budget (DEC) ──
def calculate_safe_time(condition, aqi):
    """
    Safe Outdoor Time (hours) = DEC / Current AQI
    Minimum floor of 0.25 hrs (15 minutes).
    """
    dec = DEC_TABLE.get(condition, 200)
    safe = round(dec / max(aqi, 1), 2)
    return max(safe, 0.25)

# ── STEP 8: CES Recovery Tracker ──

RECOVERY_FACTOR = 0.7  # 30% recovery each day (physiological)

# def update_ces(user_id, el_today):
#     """
#     CES[today] = CES[yesterday] × 0.7 + EL[today]
#     Fetches yesterday's CES from DB and applies recovery decay.
#     """
#     from models import ExposureLog
#     yesterday = ExposureLog.query\
#         .filter_by(user_id=user_id)\
#         .order_by(ExposureLog.date.desc())\
#         .first()

#     prev_ces = yesterday.ces if yesterday else 0.0
#     new_ces = round(prev_ces * RECOVERY_FACTOR + el_today, 2)
#     return new_ces


def update_ces(user_id, el_today):
    """
    CES[today] = CES[yesterday] × 0.7 + EL[today]
    Looks at YESTERDAY specifically — not most recent record.
    """
    from models import ExposureLog
    import datetime
    yesterday = datetime.date.today() - datetime.timedelta(days=1)

    prev_log = ExposureLog.query\
        .filter_by(user_id=user_id)\
        .filter(ExposureLog.date == yesterday)\
        .first()

    prev_ces = prev_log.ces if prev_log else 0.0
    new_ces = round(prev_ces * RECOVERY_FACTOR + el_today, 2)
    return new_ces


def get_weekly_trend(user_id):
    """Return last 7 days of EL + CES for trend chart."""
    from models import ExposureLog
    logs = ExposureLog.query\
        .filter_by(user_id=user_id)\
        .order_by(ExposureLog.date.desc())\
        .limit(7).all()
    return [
        {
            'date': str(l.date),
            'el': l.el,
            'ces': l.ces,
            'risk': l.risk_level
        }
        for l in reversed(logs)
    ]


def check_ces_alert(trend_data):
    """Fire alert if CES has risen 3 consecutive days."""
    ces_values = [d['ces'] for d in trend_data]
    if len(ces_values) >= 3:
        if ces_values[-1] > ces_values[-2] > ces_values[-3]:
            return 'Your cumulative exposure has risen 3 days in a row. Consider reducing outdoor activity tomorrow.'
    return None