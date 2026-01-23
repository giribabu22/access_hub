import sys
print("Python version:", sys.version)
print("Starting import test...")

try:
    from app import create_app
    print("Import successful!")
    app = create_app()
    print("App created!")
    print("Config:", app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')[:50])
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
