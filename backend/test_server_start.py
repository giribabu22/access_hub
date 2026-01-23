#!/usr/bin/env python
"""Test if the Flask app can start"""
import sys
import os

# Set Flask environment
os.environ['FLASK_APP'] = 'wsgi:app'
os.environ['FLASK_DEBUG'] = '1'

print("=" * 60)
print("Testing Flask Server Startup")
print("=" * 60)
print()

try:
    print("Step 1: Importing create_app...")
    from app import create_app
    print("[OK] Successfully imported create_app")
    
    print("\nStep 2: Creating app instance...")
    app = create_app()
    print("[OK] App created successfully")
    
    print("\nStep 3: Starting Flask development server...")
    print("Server URL: http://0.0.0.0:5001")
    print("Press Ctrl+C to stop")
    print("-" * 60)
    print()
    
    # Run the server
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
    
except Exception as e:
    print(f"\n[ERROR] Failed to start server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
