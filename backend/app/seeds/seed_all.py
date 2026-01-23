"""
Master seed file that initializes all required data in the correct order.
Usage: python -m app.seeds.seed_all
"""
from flask import Flask
from ..config import Config
from ..extensions import db
from .init_roles import init_roles
from .init_super_admin import init_super_admin
from .init_sparquer_org import init_sparquer_organization


def seed_all():
    """Run all seed scripts in the correct order"""
    
    print("\n" + "="*60)
    print("🌱 STARTING SEED PROCESS")
    print("="*60 + "\n")
    
    try:
        # Step 1: Initialize roles
        print("Step 1: Initializing roles...")
        init_roles()
        
        # Step 2: Initialize Super Admin
        print("\nStep 2: Initializing Super Admin...")
        init_super_admin()
        
        # Step 3: Initialize Sparquer organization
        print("\nStep 3: Initializing Sparquer organization...")
        init_sparquer_organization()
        
        print("\n" + "="*60)
        print("✅ ALL SEED OPERATIONS COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\n📝 Login Credentials:")
        print("-" * 60)
        print("Super Admin:")
        print("  Email: admin@sparquer.com")
        print("  Password: Admin@123")
        print("\nOrg Admin (Prem):")
        print("  Email: giribabunettlinx@gmail.com")
        print("  Password: Welcome@123")
        print("\nAll Employees:")
        print("  Default Password: Welcome@123")
        print("-" * 60)
        print("\n⚠️  IMPORTANT: Change all passwords after first login!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        db.session.rollback()
        raise


if __name__ == "__main__":
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        seed_all()