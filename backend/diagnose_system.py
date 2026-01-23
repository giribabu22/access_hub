"""
Comprehensive system diagnostic script
"""
import sys
import os

print("=" * 70)
print("VMS BACKEND - SYSTEM DIAGNOSTIC")
print("=" * 70)
print()

# Test 1: Environment Variables
print("[1/8] Checking Environment Variables...")
try:
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = ['DATABASE_URL', 'JWT_SECRET_KEY', 'SECRET_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"   [WARNING] Missing environment variables: {', '.join(missing_vars)}")
    else:
        print("   [OK] All required environment variables present")
except Exception as e:
    print(f"   [ERROR] {e}")

# Test 2: Configuration
print("\n[2/8] Testing Configuration Loading...")
try:
    from app.config import Config, settings
    print(f"   [OK] Config loaded successfully")
    print(f"   - Environment: {settings.environment}")
    print(f"   - Database: {settings.db_url[:50]}...")
except Exception as e:
    print(f"   [ERROR] {e}")
    import traceback
    traceback.print_exc()

# Test 3: Database Connection
print("\n[3/8] Testing Database Connection...")
try:
    from sqlalchemy import create_engine, text
    from app.config import settings
    
    engine = create_engine(settings.db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("   [OK] Database connection successful")
except Exception as e:
    print(f"   [ERROR] Database connection failed: {e}")

# Test 4: Models Import
print("\n[4/8] Testing Models Import...")
try:
    from app.models import (
        User, Role, Organization, Department, Employee,
        AttendanceRecord, LeaveRequest, AuditLog
    )
    print("   [OK] All models imported successfully")
except Exception as e:
    print(f"   [ERROR] Models import failed: {e}")
    import traceback
    traceback.print_exc()

# Test 5: Flask App Creation
print("\n[5/8] Testing Flask App Creation...")
try:
    # Don't actually create the app yet, just import
    from app import create_app
    print("   [OK] create_app function imported successfully")
except Exception as e:
    print(f"   [ERROR] {e}")
    import traceback
    traceback.print_exc()

# Test 6: Extensions
print("\n[6/8] Testing Extensions...")
try:
    from app.extensions import db, jwt, bcrypt, migrate, socketio
    print("   [OK] All extensions imported successfully")
except Exception as e:
    print(f"   [ERROR] {e}")

# Test 7: Critical Routes
print("\n[7/8] Testing Route Imports...")
routes_to_test = [
    ('app.api.auth.routes', 'auth'),
    ('app.api.organizations.routes', 'organizations'),
    ('app.api.health.routes', 'health'),
]

for module_path, name in routes_to_test:
    try:
        __import__(module_path)
        print(f"   [OK] {name} routes imported")
    except Exception as e:
        print(f"   [ERROR] {name} routes failed: {e}")

# Test 8: Check for common issues
print("\n[8/8] Checking for Common Issues...")
issues_found = []

# Check if models have proper relationships
try:
    from app.models.user import User
    from app.models.employee import Employee
    
    if not hasattr(User, 'employees'):
        issues_found.append("User model missing 'employees' relationship")
    
    if not hasattr(Employee, 'user'):
        issues_found.append("Employee model missing 'user' relationship")
        
except Exception as e:
    issues_found.append(f"Model relationship check failed: {e}")

if issues_found:
    print("   [WARNING] Issues found:")
    for issue in issues_found:
        print(f"   - {issue}")
else:
    print("   [OK] No common issues detected")

print("\n" + "=" * 70)
print("DIAGNOSTIC COMPLETE")
print("=" * 70)
