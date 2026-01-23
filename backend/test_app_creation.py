import sys
import os

# Set environment variables
os.environ['FLASK_APP'] = 'wsgi:app'
os.environ['FLASK_DEBUG'] = '1'

print("Starting app test...")
print(f"Python: {sys.version}")
print(f"Working directory: {os.getcwd()}")
print("")

try:
    print("Step 1: Importing create_app...")
    from app import create_app
    print("[OK] Imported successfully")
    
    print("\nStep 2: Creating app instance...")
    app = create_app()
    print("[OK] App created successfully")
    
    print("\nStep 3: Checking app configuration...")
    print(f"  - Debug mode: {app.debug}")
    print(f"  - Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')[:50]}...")
    
    print("\n[SUCCESS] App is ready to run!")
    
except Exception as e:
    print(f"\n[ERROR] Failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
