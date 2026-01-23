"""Create prem user"""
from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User

app = create_app()

with app.app_context():
    print("\n=== Creating 'prem' user ===\n")
    
    # Check if user already exists
    existing_user = User.query.filter_by(username="prem").first()
    if existing_user:
        print(f"User 'prem' already exists with ID: {existing_user.id}")
    else:
        # Hash password
        password_hash = bcrypt.generate_password_hash("Admin@123").decode('utf-8')
        
        # Create user with same role as superadmin (role_id = 7)
        user = User(
            username="prem",
            email="prem@sparquer.com",
            password_hash=password_hash,
            role_id="7",  # super_admin role
            is_active=True,
            organization_id=None
        )
        
        db.session.add(user)
        db.session.commit()
        
        print(f"✓ User 'prem' created successfully!")
        print(f"  ID: {user.id}")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Role ID: {user.role_id}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Password: Admin@123")
