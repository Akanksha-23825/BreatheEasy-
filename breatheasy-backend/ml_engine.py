import os
import pickle
import tempfile
import datetime
from datetime import datetime as dt
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Suppress TensorFlow logs to keep output clean
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense

from models import db, User, HourlyReading, ExposureLog, MLModel
from waqi_client import get_current_aqi

def get_latest_reading(city):
    return HourlyReading.query\
        .filter_by(city=city)\
        .order_by(HourlyReading.timestamp.desc())\
        .first()

def get_aqi_averages_by_date(city):
    """
    Fetches all hourly readings for a city and averages them by date.
    Returns a dictionary of date -> average_aqi.
    """
    readings = HourlyReading.query.filter_by(city=city).all()
    aqi_by_date = {}
    
    # Group by date
    for r in readings:
        if r.timestamp and r.aqi is not None:
            # Handle both datetime and string format timestamps using pandas
            date_val = pd.to_datetime(r.timestamp).date()
            if date_val not in aqi_by_date:
                aqi_by_date[date_val] = []
            aqi_by_date[date_val].append(r.aqi)
            
    # Calculate average
    return {d: sum(vals)/len(vals) for d, vals in aqi_by_date.items()}

# --- STEP 1: Feature Engineering ---
def build_features(user_id):
    """
    Queries ExposureLog and HourlyReading history for a user, 
    generating lag and rolling features.
    Returns a pandas DataFrame.
    """
    user = User.query.get(user_id)
    if not user:
        return pd.DataFrame()
        
    logs = ExposureLog.query.filter_by(user_id=user_id).order_by(ExposureLog.date.asc()).all()
    if len(logs) < 3:
        # Need at least 3 logs to construct 2 lags and 1 current row
        return pd.DataFrame()
        
    aqi_avg_by_date = get_aqi_averages_by_date(user.city)
    
    data = []
    for i in range(2, len(logs)):
        prev_log = logs[i-1]
        prev2_log = logs[i-2]
        curr_log = logs[i]
        
        # AQI for current log date (with fallback to latest reading/default)
        aqi_val = aqi_avg_by_date.get(curr_log.date)
        if aqi_val is None:
            latest_r = get_latest_reading(user.city)
            aqi_val = float(latest_r.aqi) if latest_r and latest_r.aqi else 100.0
            
        oh = curr_log.outdoor_hours_actual
        if oh is None or oh == 0.0:
            oh = user.daily_outdoor_hours or 2.0
            
        data.append({
            'el_lag1': prev_log.el or 0.0,
            'el_lag2': prev2_log.el or 0.0,
            'ces': prev_log.ces or 0.0,  # previous day's cumulative score
            'aqi': aqi_val,
            'outdoor_hours': oh,
            'weekday': curr_log.date.weekday(),
            'el': curr_log.el or 0.0  # target
        })
        
    return pd.DataFrame(data)

# --- STEP 2: Linear Regression Model ---
def train_linear_model(user_id):
    """
    Trains a Linear Regression model on user history (requires >=5 logs).
    Saves metrics and the serialized model blob to the database.
    """
    logs = ExposureLog.query.filter_by(user_id=user_id).all()
    if len(logs) < 5:
        print(f"[PELM] User {user_id} has insufficient history for Linear Regression (<5 logs)")
        return None
        
    df = build_features(user_id)
    if df.empty:
        return None
        
    X = df[['el_lag1', 'el_lag2', 'ces', 'aqi', 'outdoor_hours', 'weekday']]
    y = df['el']
    
    # Train / Test split
    if len(df) > 1:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    else:
        X_train, X_test, y_train, y_test = X, X, y, y
        
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    # Serialize and Save to DB
    model_blob = pickle.dumps(model)
    
    existing = MLModel.query.filter_by(user_id=user_id, model_type='linear').first()
    if existing:
        existing.trained_at = dt.utcnow()
        existing.mae_score = float(mae)
        existing.rmse_score = float(rmse)
        existing.model_blob = model_blob
    else:
        new_model = MLModel(
            user_id=user_id,
            model_type='linear',
            trained_at=dt.utcnow(),
            mae_score=float(mae),
            rmse_score=float(rmse),
            model_blob=model_blob
        )
        db.session.add(new_model)
        
    db.session.commit()
    print(f"[PELM] Linear Regression model trained for user {user_id} (MAE: {mae:.2f}, RMSE: {rmse:.2f})")
    return model

def predict_el_linear(model, latest_row):
    """
    Predicts next-day EL using a trained Linear Regression model.
    """
    if isinstance(latest_row, dict):
        features = [
            latest_row['el_lag1'],
            latest_row['el_lag2'],
            latest_row['ces'],
            latest_row['aqi'],
            latest_row['outdoor_hours'],
            latest_row['weekday']
        ]
        X = [features]
    elif isinstance(latest_row, (list, tuple)):
        X = [latest_row]
    else:
        X = latest_row
        
    pred = model.predict(X)
    return float(pred[0])

# --- STEP 3: LSTM Time Series Model ---
def train_lstm_model(user_id):
    """
    Trains an LSTM Time Series model on user history (requires >=30 logs).
    Uses a rolling 7-day sequence window of features.
    Saves metrics and the serialized model blob to the database.
    """
    user = User.query.get(user_id)
    logs = ExposureLog.query.filter_by(user_id=user_id).order_by(ExposureLog.date.asc()).all()
    if len(logs) < 30:
        print(f"[PELM] User {user_id} has insufficient history for LSTM (<30 logs)")
        return None
        
    aqi_avg_by_date = get_aqi_averages_by_date(user.city)
    
    # Extract features: EL, CES, AQI, outdoor_hours
    features_list = []
    for log in logs:
        aqi_val = aqi_avg_by_date.get(log.date)
        if aqi_val is None:
            latest_r = get_latest_reading(user.city)
            aqi_val = float(latest_r.aqi) if latest_r and latest_r.aqi else 100.0
            
        oh = log.outdoor_hours_actual
        if oh is None or oh == 0.0:
            oh = user.daily_outdoor_hours or 2.0
            
        features_list.append([log.el or 0.0, log.ces or 0.0, aqi_val, oh])
        
    features_arr = np.array(features_list)  # Shape (N, 4)
    
    X_seq = []
    y_seq = []
    # Create rolling 7-day windows
    for i in range(len(features_arr) - 7):
        X_seq.append(features_arr[i:i+7])
        y_seq.append(features_arr[i+7, 0])  # Target is next-day EL (index 0)
        
    X_seq = np.array(X_seq)  # Shape (M, 7, 4)
    y_seq = np.array(y_seq)  # Shape (M,)
    
    # Sequential Split for time series
    split_idx = int(len(X_seq) * 0.8)
    X_train, X_test = X_seq[:split_idx], X_seq[split_idx:]
    y_train, y_test = y_seq[:split_idx], y_seq[split_idx:]
    
    if len(X_test) == 0:
        X_train, X_test, y_train, y_test = X_seq, X_seq, y_seq, y_seq
        
    # Build LSTM Model
    model = Sequential([
        LSTM(32, input_shape=(7, 4)),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mae')
    model.fit(X_train, y_train, epochs=20, batch_size=4, verbose=0)
    
    # Evaluate
    y_pred = model.predict(X_test, verbose=0).flatten()
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    # Serialize Keras Model using tempfile
    fd, temp_path = tempfile.mkstemp(suffix='.keras')
    os.close(fd)
    try:
        model.save(temp_path)
        with open(temp_path, 'rb') as f:
            model_blob = f.read()
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    # Save to database
    existing = MLModel.query.filter_by(user_id=user_id, model_type='lstm').first()
    if existing:
        existing.trained_at = dt.utcnow()
        existing.mae_score = float(mae)
        existing.rmse_score = float(rmse)
        existing.model_blob = model_blob
    else:
        new_model = MLModel(
            user_id=user_id,
            model_type='lstm',
            trained_at=dt.utcnow(),
            mae_score=float(mae),
            rmse_score=float(rmse),
            model_blob=model_blob
        )
        db.session.add(new_model)
        
    db.session.commit()
    print(f"[PELM] LSTM model trained for user {user_id} (MAE: {mae:.2f}, RMSE: {rmse:.2f})")
    return model

def predict_el_lstm(model, sequence):
    """
    Predicts next-day EL using the rolling 7-day sequence input.
    """
    seq_arr = np.array(sequence)
    if seq_arr.ndim == 2:
        seq_arr = np.expand_dims(seq_arr, axis=0)
    pred = model.predict(seq_arr, verbose=0)
    return float(pred[0, 0])

# --- STEP 4: Model Selection Logic ---
def get_best_prediction(user_id):
    """
    Determines history length and fetches the prediction using the appropriate model.
    """
    logs = ExposureLog.query.filter_by(user_id=user_id).order_by(ExposureLog.date.asc()).all()
    history_len = len(logs)
    
    if history_len < 5:
        return None
        
    user = User.query.get(user_id)
    if not user:
        return None
        
    # Get current/today's AQI for the user's city
    waqi_data = get_current_aqi(user.city)
    if waqi_data:
        aqi_val = float(waqi_data['aqi'])
    else:
        latest_r = get_latest_reading(user.city)
        aqi_val = float(latest_r.aqi) if latest_r and latest_r.aqi else 100.0
        
    # LINEAR REGRESSION ROUTE (5 <= history < 30)
    if history_len >= 5 and history_len < 30:
        db_model = MLModel.query.filter_by(user_id=user_id, model_type='linear').first()
        if not db_model:
            # Train model on-the-fly if it doesn't exist
            model = train_linear_model(user_id)
            if not model:
                return None
        else:
            model = pickle.loads(db_model.model_blob)
            
        latest_row = {
            'el_lag1': logs[-1].el or 0.0,
            'el_lag2': logs[-2].el or 0.0,
            'ces': logs[-1].ces or 0.0,
            'aqi': aqi_val,
            'outdoor_hours': user.daily_outdoor_hours or 2.0,
            'weekday': datetime.date.today().weekday()
        }
        
        pred_el = predict_el_linear(model, latest_row)
        return {
            "predicted_el": max(0.0, round(pred_el, 2)),
            "model_used": "linear"
        }
        
    # LSTM ROUTE (history >= 30)
    else:
        db_model = MLModel.query.filter_by(user_id=user_id, model_type='lstm').first()
        if not db_model:
            model = train_lstm_model(user_id)
            if not model:
                # Fallback to linear if LSTM training failed
                return get_best_prediction_linear_fallback(user_id, logs, aqi_val, user)
        else:
            # Deserialize Keras model
            fd, temp_path = tempfile.mkstemp(suffix='.keras')
            os.close(fd)
            try:
                with open(temp_path, 'wb') as f:
                    f.write(db_model.model_blob)
                model = load_model(temp_path)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        # Extract features for last 7 days
        aqi_avg_by_date = get_aqi_averages_by_date(user.city)
        sequence = []
        for log in logs[-7:]:
            log_aqi = aqi_avg_by_date.get(log.date)
            if log_aqi is None:
                log_aqi = aqi_val
            oh = log.outdoor_hours_actual
            if oh is None or oh == 0.0:
                oh = user.daily_outdoor_hours or 2.0
            sequence.append([log.el or 0.0, log.ces or 0.0, log_aqi, oh])
            
        # Ensure sequence is padded if something went wrong
        while len(sequence) < 7:
            sequence.insert(0, [0.0, 0.0, 100.0, 2.0])
            
        pred_el = predict_el_lstm(model, sequence)
        return {
            "predicted_el": max(0.0, round(pred_el, 2)),
            "model_used": "lstm"
        }

def get_best_prediction_linear_fallback(user_id, logs, aqi_val, user):
    """
    Fallback helper to get linear regression predictions when LSTM fails.
    """
    db_model = MLModel.query.filter_by(user_id=user_id, model_type='linear').first()
    if not db_model:
        model = train_linear_model(user_id)
        if not model:
            return None
    else:
        model = pickle.loads(db_model.model_blob)
        
    latest_row = {
        'el_lag1': logs[-1].el or 0.0,
        'el_lag2': logs[-2].el or 0.0,
        'ces': logs[-1].ces or 0.0,
        'aqi': aqi_val,
        'outdoor_hours': user.daily_outdoor_hours or 2.0,
        'weekday': datetime.date.today().weekday()
    }
    pred_el = predict_el_linear(model, latest_row)
    return {
        "predicted_el": max(0.0, round(pred_el, 2)),
        "model_used": "linear"
    }

# --- STEP 5: Adaptive Advisory Generator ---
def generate_ml_advisory(user_id):
    """
    Computes delta% between predicted EL and past 7-day average EL 
    to generate an adaptive advisory message personalized to health, age and outdoor hours.
    """
    pred_res = get_best_prediction(user_id)
    if not pred_res:
        return None
        
    user = User.query.get(user_id)
    if not user:
        return None

    # Get last 7 days of logs to calculate personal average
    logs = ExposureLog.query.filter_by(user_id=user_id).order_by(ExposureLog.date.desc()).limit(7).all()
    el_vals = [log.el for log in logs if log.el is not None]
    
    personal_average_el = sum(el_vals) / len(el_vals) if el_vals else 0.0
    predicted_el = pred_res['predicted_el']
    
    if personal_average_el == 0.0:
        delta_percent = 0.0
    else:
        delta_percent = ((predicted_el - personal_average_el) / personal_average_el) * 100
        
    # Personalized capacities (DEC Table)
    DEC_TABLE = {
        'healthy':  400.0,
        'asthma':   250.0,
        'heart':    280.0,
        'pregnant': 300.0,
        'elderly':  220.0,
    }
    
    base_capacity = DEC_TABLE.get(user.health_condition.lower(), 400.0)
    personal_capacity = base_capacity
    
    # Age adjustments
    age_suffix = ""
    if user.age > 60:
        personal_capacity = round(base_capacity * 0.8, 1)
        age_suffix = " (adjusted for age > 60)"
    elif user.age < 12:
        personal_capacity = round(base_capacity * 0.9, 1)
        age_suffix = " (adjusted for child)"
        
    outdoor_hours = user.daily_outdoor_hours or 2.0
    
    # Condition-specific advice
    CONDITION_ADVICE = {
        'healthy':  '',
        'asthma':   'Carry your inhaler.',
        'heart':    'Keep activity light.',
        'pregnant': 'Limit to short walks.',
        'elderly':  'Avoid strenuous activity.',
    }
    spec_advice = CONDITION_ADVICE.get(user.health_condition.lower(), '')

    if predicted_el > personal_capacity:
        # Calculate max recommended safe outdoor hours
        predicted_wes = max(predicted_el / max(outdoor_hours, 0.1), 1.0)
        max_safe_hours = round(personal_capacity / predicted_wes, 1)
        max_safe_hours = max(max_safe_hours, 0.25)
        
        advisory = (
            f"Tomorrow's predicted exposure load ({predicted_el}) exceeds your safe threshold of {personal_capacity}{age_suffix}. "
            f"Based on your {user.health_condition} condition, please reduce your outdoor time from {outdoor_hours}h to a maximum of {max_safe_hours}h. "
            f"{spec_advice}"
        ).strip()
    else:
        advisory = (
            f"Tomorrow's predicted exposure ({predicted_el}) is within your safe daily capacity of {personal_capacity}{age_suffix}. "
            f"Your planned {outdoor_hours}h outdoors is safe for your {user.health_condition} condition. "
            f"{spec_advice}"
        ).strip()
        
    return {
        "predicted_el": predicted_el,
        "model_used": pred_res['model_used'],
        "delta_percent": round(delta_percent, 2),
        "advisory": advisory
    }

# --- STEP 7: Scheduler Callback ---
def retrain_all_users():
    """
    Invoked weekly (Sundays at 2 AM) to retrain appropriate ML models 
    for all registered users.
    """
    from app import app
    with app.app_context():
        users = User.query.all()
        print(f"[PELM Scheduler] Starting weekly retraining for {len(users)} users...")
        for user in users:
            log_count = ExposureLog.query.filter_by(user_id=user.id).count()
            if log_count >= 30:
                try:
                    train_lstm_model(user.id)
                except Exception as e:
                    print(f"[PELM Scheduler] Error retraining LSTM for user {user.id}: {e}")
            elif log_count >= 5:
                try:
                    train_linear_model(user.id)
                except Exception as e:
                    print(f"[PELM Scheduler] Error retraining Linear Regression for user {user.id}: {e}")
            else:
                print(f"[PELM Scheduler] Skipping user {user.id} (Insufficient logs: {log_count})")
        print("[PELM Scheduler] Weekly retraining completed.")