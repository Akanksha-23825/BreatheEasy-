from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, HourlyReading, User
from cpcb_client import fetch_hourly
from advisory import get_recommended_window
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

# --- Data Ingestion Job ---
def ingest_all_cities():
    with app.app_context():
        print("[SCHEDULER] Fetching AQI data for all cities...")
        cities = db.session.query(User.city).distinct().all()

        # Default to Bengaluru if no users yet
        if not cities:
            cities = [('Bengaluru',)]

        for (city,) in cities:
            if not city:
                continue
            data = fetch_hourly(city)
            for rec in data:
                reading = HourlyReading(
                    city=city,
                    station_id=rec.get('station_id', 'UNKNOWN'),
                    timestamp=rec['timestamp'],
                    pm25=rec['pm25'],
                    pm10=rec['pm10'],
                    no2=rec['no2'],
                    o3=rec['o3'],
                    aqi=rec['aqi']
                )
                db.session.add(reading)
            db.session.commit()
            print(f"[SCHEDULER] Data saved for {city}")

# Start scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(ingest_all_cities, 'interval', hours=1)
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

from routes import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        ingest_all_cities()  # fetch immediately on startup
    app.run(debug=True, port=5000)