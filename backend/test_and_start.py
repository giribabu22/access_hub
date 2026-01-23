"""
Final comprehensive test and server start script
"""
import sys
import os

# Set environment
os.environ['FLASK_APP'] = 'wsgi:app'
os.environ['FLASK_DEBUG'] = '1'

def main():
    print("=" * 70)
    print("VMS BACKEND - FINAL SYSTEM CHECK & START")
    print("=" * 70)
    
    # Quick diagnostic
    print("\n[Step 1/4] Quick Diagnostic Check...")
    try:
        from app import create_app
        from app.config import settings
        print(f"   [OK] Configuration loaded")
        print(f"   [OK] Environment: {settings.environment}")
        print(f"   [OK] Database: {settings.db_url[:50]}...")
    except Exception as e:
        print(f"   [ERROR] {e}")
        return False
    
    # Test database
    print("\n[Step 2/4] Testing Database Connection...")
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(settings.db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("   [OK] Database connection OK")
    except Exception as e:
        print(f"   [ERROR] Database error: {e}")
        print("\n   Please ensure PostgreSQL is running on port 5432")
        return False
    
    # Create app
    print("\n[Step 3/4] Creating Flask Application...")
    try:
        app = create_app()
        print("   [OK] Flask app created successfully")
        print(f"   [OK] Registered {len(app.url_map._rules)} routes")
    except Exception as e:
        print(f"   [ERROR] Error creating app: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Start server
    print("\n[Step 4/4] Starting Development Server...")
    print("   Server URL: http://0.0.0.0:5001")
    print("   Swagger Docs: http://localhost:5001/api/docs/")
    print("   Health Check: http://localhost:5001/api/health/status")
    print("\n   Press Ctrl+C to stop the server")
    print("=" * 70)
    print()
    
    try:
        # Use socketio for real-time features
        from app.extensions import socketio
        socketio.run(
            app,
            host='0.0.0.0',
            port=5001,
            debug=True,
            use_reloader=True,
            allow_unsafe_werkzeug=True
        )
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
        return True
    except Exception as e:
        print(f"\n[ERROR] Server error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)