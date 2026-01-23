"""
Update Role Permissions Script
This script updates the permissions for existing roles
"""
import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
load_dotenv()

from app import create_app
from app.extensions import db
from app.models.role import Role

print("=" * 70)
print("UPDATE ROLE PERMISSIONS")
print("=" * 70)

app = create_app()

def update_permissions():
    """Update permissions for all roles"""
    with app.app_context():
        print("\nUpdating role permissions...")
        
        # Super Admin - Full access to everything
        super_admin = Role.query.filter_by(id='super_admin').first()
        if super_admin:
            super_admin.permissions = {
                'organizations': ['create', 'read', 'update', 'delete'],
                'users': ['create', 'read', 'update', 'delete'],
                'employees': ['create', 'read', 'update', 'delete'],
                'departments': ['create', 'read', 'update', 'delete'],
                'attendance': ['create', 'read', 'update', 'delete'],
                'cameras': ['create', 'read', 'update', 'delete'],
                'locations': ['create', 'read', 'update', 'delete'],
                'shifts': ['create', 'read', 'update', 'delete'],
                'leave_requests': ['create', 'read', 'update', 'delete', 'approve', 'reject'],
                'visitors': ['create', 'read', 'update', 'delete'],
                'reports': ['read', 'export'],
                'audit_logs': ['read'],
            }
            print("   ✓ Updated Super Admin permissions")
        
        # Org Admin - Full access within organization
        org_admin = Role.query.filter_by(id='org_admin').first()
        if org_admin:
            org_admin.permissions = {
                'users': ['create', 'read', 'update', 'delete'],
                'employees': ['create', 'read', 'update', 'delete'],
                'departments': ['create', 'read', 'update', 'delete'],
                'attendance': ['create', 'read', 'update', 'delete'],
                'cameras': ['create', 'read', 'update', 'delete'],
                'locations': ['create', 'read', 'update', 'delete'],
                'shifts': ['create', 'read', 'update', 'delete'],
                'leave_requests': ['create', 'read', 'update', 'delete', 'approve', 'reject'],
                'visitors': ['create', 'read', 'update', 'delete'],
                'reports': ['read', 'export'],
                'audit_logs': ['read'],
                'organizations': ['read'],
            }
            print("   ✓ Updated Organization Admin permissions")
        
        # Manager - Team management
        manager = Role.query.filter_by(id='manager').first()
        if manager:
            manager.permissions = {
                'employees': ['read', 'update'],
                'departments': ['read'],
                'attendance': ['read', 'approve'],
                'leave_requests': ['read', 'approve', 'reject'],
                'cameras': ['read'],
                'locations': ['read'],
                'shifts': ['read'],
                'visitors': ['read'],
                'reports': ['read'],
            }
            print("   ✓ Updated Manager permissions")
        
        # Employee - Limited access
        employee = Role.query.filter_by(id='employee').first()
        if employee:
            employee.permissions = {
                'attendance': ['read'],
                'leave_requests': ['create', 'read'],
                'profile': ['read', 'update'],
                'shifts': ['read'],
                'locations': ['read'],
            }
            print("   ✓ Updated Employee permissions")
        
        db.session.commit()
        print("\n" + "=" * 70)
        print("✅ Role permissions updated successfully!")
        print("=" * 70)
        
        # Display updated permissions
        print("\n📋 Updated Permissions Summary:\n")
        
        roles = Role.query.all()
        for role in roles:
            print(f"\n{role.name} ({role.id}):")
            if role.permissions:
                for resource, actions in role.permissions.items():
                    print(f"   • {resource}: {', '.join(actions)}")
            else:
                print("   • No permissions defined")

if __name__ == '__main__':
    try:
        update_permissions()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
