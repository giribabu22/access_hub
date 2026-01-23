#!/usr/bin/env python
"""
Script to update roles in the database with admin role permissions.
Run this from the vms_backend directory.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from app.config import Config
from app.extensions import db
from app.seeds.init_roles import init_roles

def main():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    with app.app_context():
        db.init_app(app)
        print("🔄 Updating roles with admin role permissions...")
        print("-" * 60)
        try:
            init_roles()
            print("-" * 60)
            print("✅ Roles updated successfully!")
            print("\nNow admin users can access their organization.")
            return 0
        except Exception as e:
            print(f"❌ Error updating roles: {e}")
            import traceback
            traceback.print_exc()
            return 1

if __name__ == "__main__":
    sys.exit(main())
