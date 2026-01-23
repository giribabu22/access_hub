"""
Safe Flask server startup with comprehensive error handling
"""
import sys
import os

print("=" * 70)
print("VMS BACKEND - STARTING SERVER")
print("=" * 70)

# Set environment
os.environ.setdefault('FLASK_APP', 'wsgi:app')
os.environ.setdefault('FLASK_DEBUG', '1')

try:
    print("\n[1/3] Loading configuration...")
    from app.config import settings
    print(f"   Environment: {settings.environment}")
    print(f"   Database: {settings.db_url[:50]}...")
    
    print("\n[2/3] Creating Flask application...")
    from app import create_app
    app = create_app()
    print("   [OK] Application created successfully")
    
    print("\n[3/3] Starting development server...")
    print("   Server URL: http://0.0.0.0:5001")
    print("   Press Ctrl+C to stop")
    print("=" * 70)
    print()
    
    # Start server
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
    sys.exit(0)
    
except Exception as e:
    print(f"\n[ERROR] Failed to start server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
