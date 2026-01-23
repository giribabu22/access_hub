"""
Initialize a Super Admin user for system-wide administration.
This user can manage all organizations.
"""
from ..extensions import db, bcrypt
from werkzeug.security import generate_password_hash as _legacy_generate_password_hash
from ..models import User, Role


def init_super_admin():
    """Create super admin user"""
    
    print("\n👑 Initializing Super Admin...")
    
    # Get super_admin role
    super_admin_role = Role.query.filter_by(name="super_admin").first()
    
    if not super_admin_role:
        print("❌ Error: 'super_admin' role not found. Please run init_roles first.")
        return None
    
    # Check if super admin already exists
    existing_admin = User.query.filter_by(email="admin@sparquer.com").first()
    
    if existing_admin:
        # If existing password was created with a different hasher (e.g. werkzeug),
        # ensure it uses bcrypt so AuthService can verify it. Update if verification fails.
        try:
            if not bcrypt.check_password_hash(existing_admin.password_hash, "Admin@123"):
                existing_admin.password_hash = bcrypt.generate_password_hash("Admin@123").decode('utf-8')
                db.session.commit()
        except Exception:
            # Any error while checking (e.g. invalid salt for bcrypt) -> update hash
            existing_admin.password_hash = bcrypt.generate_password_hash("Admin@123").decode('utf-8')
            db.session.commit()

        print(f"ℹ️  Super Admin already exists: {existing_admin.email}")
        return existing_admin
    
    # Create super admin user
    super_admin = User(
        email="admin@sparquer.com",
        username="superadmin",
        password_hash=bcrypt.generate_password_hash("Admin@123").decode('utf-8'),
        role_id=super_admin_role.id,
        organization_id=None,  # Super admin is not tied to any organization
        is_active=True
    )
    db.session.add(super_admin)
    db.session.commit()
    
    print(f"✅ Super Admin created successfully!")
    print(f"   Email: {super_admin.email}")
    print(f"   Username: {super_admin.username}")
    print(f"   Password: Admin@123")
    print(f"   ⚠️  Please change the password after first login!")
    
    return super_admin


if __name__ == "__main__":
    from flask import Flask
    from ..config import Config
    
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        init_super_admin()
