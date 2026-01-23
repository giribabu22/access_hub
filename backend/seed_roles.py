#!/usr/bin/env python
"""
Seed roles script - wrapper for init_roles functionality.
"""

import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.seeds.init_roles import init_roles

def main():
    """Initialize roles and permissions"""
    print("🚀 Initializing roles and permissions...")
    
    app = create_app()
    
    with app.app_context():
        try:
            created_roles = init_roles()
            
            print("\n" + "="*50)
            print("✅ ROLES INITIALIZATION COMPLETE!")
            print("="*50)
            print("Created/Updated roles:")
            for role in created_roles:
                print(f"  • {role}")
            print("="*50)
            print("🚀 Roles are ready for use!")
            
            return True
            
        except Exception as e:
            print(f"❌ Error initializing roles: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    success = main()
    if success:
        print("✅ Script completed successfully")
        sys.exit(0)
    else:
        print("❌ Script failed")
        sys.exit(1)