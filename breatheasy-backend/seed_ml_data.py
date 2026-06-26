from app import app
from models import db, User, ExposureLog, HourlyReading
import datetime
import random

def seed_test_data():
    with app.app_context():
        # Clean existing exposure logs, models, and users (except admins)
        from models import MLModel, RouteCache
        ExposureLog.query.delete()
        MLModel.query.delete()
        RouteCache.query.delete()
        User.query.filter(User.role != 'admin').delete()
        HourlyReading.query.delete()
        db.session.commit()

        # 1. Create five test users representing different health conditions and age profiles
        users = [
            User(
                username='TestUserLR',
                email='user_lr@test.com',
                age=25,
                health_condition='asthma',
                vf=1.5,
                daily_outdoor_hours=2.0,
                city='Bengaluru',
                password='password'
            ),
            User(
                username='TestUserLSTM',
                email='user_lstm@test.com',
                age=30,
                health_condition='healthy',
                vf=1.0,
                daily_outdoor_hours=3.0,
                city='Bengaluru',
                password='password'
            ),
            User(
                username='TestUserHeart',
                email='user_heart@test.com',
                age=45,
                health_condition='heart',
                vf=1.4,
                daily_outdoor_hours=2.5,
                city='Bengaluru',
                password='password'
            ),
            User(
                username='TestUserElderly',
                email='user_elderly@test.com',
                age=72,
                health_condition='elderly',
                vf=1.6,
                daily_outdoor_hours=1.5,
                city='Bengaluru',
                password='password'
            ),
            User(
                username='TestUserPregnant',
                email='user_pregnant@test.com',
                age=28,
                health_condition='pregnant',
                vf=1.3,
                daily_outdoor_hours=2.0,
                city='Bengaluru',
                password='password'
            )
        ]

        for u in users:
            db.session.add(u)
        db.session.commit()

        print(f"[SEED] Created 5 users: TestUserLR, TestUserLSTM, TestUserHeart, TestUserElderly, TestUserPregnant")

        # 2. Seed daily HourlyReadings for Bengaluru to calculate averages
        today = datetime.date.today()
        for d_offset in range(40):
            date_val = today - datetime.timedelta(days=d_offset)
            # Create a few hourly readings for this date
            for hour in range(8, 20, 2):
                timestamp = datetime.datetime.combine(date_val, datetime.time(hour, 0))
                reading = HourlyReading(
                    city='Bengaluru',
                    station_id='BENG_TEST',
                    timestamp=timestamp,
                    pm25=random.uniform(20, 80),
                    pm10=random.uniform(40, 120),
                    no2=random.uniform(10, 40),
                    o3=random.uniform(5, 30),
                    aqi=int(random.uniform(50, 160))
                )
                db.session.add(reading)
        db.session.commit()
        print("[SEED] Seeded hourly reading data.")

        # 3. Seed Exposure logs for all users
        def seed_user_logs(user, days_count):
            base_ces = 0.0
            for d_offset in reversed(range(days_count)):
                date_val = today - datetime.timedelta(days=d_offset)
                # Generate realistic exposure scores
                wes = round(random.uniform(40, 100) * user.vf, 2)
                el = round(wes * user.daily_outdoor_hours, 2)
                base_ces = round(base_ces * 0.7 + el, 2)
                
                # Determine risk label
                from exposure_engine import get_risk
                risk = get_risk(el)
                
                log = ExposureLog(
                    user_id=user.id,
                    date=date_val,
                    wes=wes,
                    el=el,
                    ces=base_ces,
                    safe_hours=round(200.0 / (wes + 1.0), 2),
                    risk_level=risk,
                    outdoor_hours_actual=user.daily_outdoor_hours
                )
                db.session.add(log)

        # Seed specific log histories
        seed_user_logs(users[0], 10) # TestUserLR (asthma) -> 10 days
        seed_user_logs(users[1], 35) # TestUserLSTM (healthy) -> 35 days
        seed_user_logs(users[2], 15) # TestUserHeart (heart) -> 15 days
        seed_user_logs(users[3], 12) # TestUserElderly (elderly) -> 12 days
        seed_user_logs(users[4], 8)  # TestUserPregnant (pregnant) -> 8 days

        db.session.commit()
        print("[SEED] Seeded mock ExposureLog history successfully!")

if __name__ == '__main__':
    seed_test_data()
