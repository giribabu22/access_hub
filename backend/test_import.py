#!/usr/bin/env python
import sys
import traceback

try:
    print("Attempting to import app...")
    from app import create_app
    print("[OK] Successfully imported create_app")
    
    print("Attempting to create app...")
    app = create_app()
    print("[OK] Successfully created app")
    
    print("\n[OK] All imports successful!")
    sys.exit(0)
    
except Exception as e:
    print(f"\n[ERROR] {e}")
    print("\nTraceback:")
    traceback.print_exc()
    sys.exit(1)