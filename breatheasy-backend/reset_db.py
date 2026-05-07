from app import app
from models import db, User

def reset_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database reset successfully.")
        
        # Re-create admin
        admin = User(
            username='SuperAdmin',
            email='admin@breatheasy.com',
            password='adminpassword',
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

if __name__ == '__main__':
    reset_db()
