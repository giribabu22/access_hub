"""Check prem user details in database"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User
from werkzeug.security import check_password_hash as werkzeug_check_password_hash

app = create_app()

with app.app_context():
    print("\n=== Checking 'prem' user ===\n")
    
    # Find prem user
    user = User.query.filter_by(username="prem").first()
    
    if not user:
        print("ERROR: User 'prem' not found in database!")
        print("\nLet's check what users exist:")
        all_users = User.query.all()
        for u in all_users:
            print(f"  - {u.username} (email: {u.email})")
        sys.exit(1)
    
    print(f"User found:")
    print(f"  ID: {user.id}")
    print(f"  Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Role ID: {user.role_id}")
    print(f"  Password Hash: {user.password_hash[:60]}...")
    print(f"  Password Hash Length: {len(user.password_hash)}")
    
    if user.role:
        print(f"  Role Name: {user.role.name}")
    else:
        print(f"  Role: *** NO ROLE ASSIGNED ***")
    
    # Test password verification
    test_password = "Admin@123"
    print(f"\n=== Testing password verification for '{test_password}' ===\n")
    
    # Test with bcrypt
    try:
        bcrypt_result = bcrypt.check_password_hash(user.password_hash, test_password)
        print(f"bcrypt.check_password_hash: {bcrypt_result}")
    except Exception as e:
        print(f"bcrypt.check_password_hash FAILED: {e}")
    
    # Test with werkzeug
    try:
        werkzeug_result = werkzeug_check_password_hash(user.password_hash, test_password)
        print(f"werkzeug.check_password_hash: {werkzeug_result}")
    except Exception as e:
        print(f"werkzeug.check_password_hash FAILED: {e}")
    
    # Compare with superadmin
    print("\n=== Comparing with 'superadmin' user ===\n")
    superadmin = User.query.filter_by(username="superadmin").first()
    if superadmin:
        print(f"Superadmin ID: {superadmin.id}")
        print(f"Superadmin Is Active: {superadmin.is_active}")
        print(f"Superadmin Role ID: {superadmin.role_id}")
        print(f"Superadmin Password Hash: {superadmin.password_hash[:60]}...")
        
        # Test superadmin password
        try:
            sa_bcrypt = bcrypt.check_password_hash(superadmin.password_hash, test_password)
            print(f"Superadmin bcrypt check: {sa_bcrypt}")
        except Exception as e:
            print(f"Superadmin bcrypt check FAILED: {e}")
