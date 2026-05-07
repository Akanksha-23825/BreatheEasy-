from app import app
from models import db, User

def create_admin():
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@breatheasy.com').first()
        if not admin:
            admin = User(
                username='SuperAdmin',
                email='admin@breatheasy.com',
                password='adminpassword', # In production, use hashed passwords!
                role='admin',
                age=35,
                health_condition='healthy',
                vf=1.0,
                city='Bengaluru',
                lat=12.9716,
                lng=77.5946
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: admin@breatheasy.com / adminpassword")
        else:
            print("Admin user already exists.")

if __name__ == '__main__':
    create_admin()
