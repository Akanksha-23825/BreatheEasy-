from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    health_condition = db.Column(db.String(30), nullable=False)
    vf = db.Column(db.Float, nullable=False)
    daily_outdoor_hours = db.Column(db.Float, default=2.0)
    city = db.Column(db.String(80))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

class HourlyReading(db.Model):
    __tablename__ = 'hourly_readings'
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(80))
    station_id = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime)
    pm25 = db.Column(db.Float)
    pm10 = db.Column(db.Float)
    no2 = db.Column(db.Float)
    o3 = db.Column(db.Float)
    aqi = db.Column(db.Integer)

    def to_dict(self):
        return {
            'city': self.city,
            'timestamp': str(self.timestamp),
            'pm25': self.pm25,
            'pm10': self.pm10,
            'no2': self.no2,
            'o3': self.o3,
            'aqi': self.aqi
        }

class ExposureLog(db.Model):
    __tablename__ = 'exposure_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    date = db.Column(db.Date)
    wes = db.Column(db.Float)
    el = db.Column(db.Float)
    ces = db.Column(db.Float)
    safe_hours = db.Column(db.Float)
    risk_level = db.Column(db.String(20))
    outdoor_hours_actual = db.Column(db.Float)

class RouteCache(db.Model):
    __tablename__ = 'route_cache'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    origin_lat = db.Column(db.Float)
    origin_lng = db.Column(db.Float)
    dest_lat = db.Column(db.Float)
    dest_lng = db.Column(db.Float)
    recommended_route_json = db.Column(db.Text)
    score = db.Column(db.Float)

class MLModel(db.Model):
    __tablename__ = 'ml_models'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    model_type = db.Column(db.String(20))
    trained_at = db.Column(db.DateTime)
    feature_cols = db.Column(db.Text)
    model_blob = db.Column(db.LargeBinary)
    mae_score = db.Column(db.Float)