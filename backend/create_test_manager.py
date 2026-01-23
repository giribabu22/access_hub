"""
Create a test manager user for testing manager role functionality.
This script creates a manager role user with appropriate permissions.
"""
from flask import Flask
from app import create_app
from app.extensions import db
from app.models.role import Role
from app.models.user import User
from app.models.organization import Organization
from app.models.department import Department
from app.models.employee import Employee
import bcrypt
import uuid
from datetime import datetime

def create_test_manager():
    """Create a test manager user"""
    app = create_app()
    
    with app.app_context():
        try:
            # Find or create manager role
            manager_role = Role.query.filter_by(name='manager').first()
            if not manager_role:
                manager_role = Role(
                    id=str(uuid.uuid4()),
                    name='manager',
                    description='Department Manager with team management access',
                    permissions={
                        "departments": ["read"],
                        "employees": ["read", "update"],
                        "users": ["read"],
                        "attendance": ["read", "update", "approve"],
                        "leaves": ["read", "approve", "reject"],
                        "shifts": ["read"],
                        "analytics": ["read"],
                        "team_reports": ["read"],
                        "profile": ["read", "update"],
                    },
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(manager_role)
                db.session.flush()
                print("✅ Created manager role")
            else:
                print("✅ Manager role already exists")

            # Find a test organization
            organization = Organization.query.filter_by(name='Sparquer Technologies').first()
            if not organization:
                print("❌ No test organization found. Please run seed_all first.")
                return

            # Find a department to manage
            department = Department.query.filter_by(organization_id=organization.id).first()
            if not department:
                print("❌ No department found in the organization.")
                return

            # Check if manager user already exists
            existing_user = User.query.filter_by(email='manager@sparquer.com').first()
            if existing_user:
                print("✅ Test manager user already exists")
                print(f"   Email: manager@sparquer.com")
                print(f"   Password: Welcome@123")
                return

            # Create manager user
            manager_user = User(
                id=str(uuid.uuid4()),
                email='manager@sparquer.com',
                username='manager_test',
                password_hash=bcrypt.hashpw('Welcome@123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                role_id=manager_role.id,
                organization_id=organization.id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(manager_user)
            db.session.flush()
            print("✅ Created manager user")

            # Create manager employee record
            manager_employee = Employee(
                id=str(uuid.uuid4()),
                user_id=manager_user.id,
                organization_id=organization.id,
                department_id=department.id,
                employee_code=f"MGR{datetime.now().strftime('%Y%m%d')}",
                full_name='Test Manager',
                gender='Other',
                phone_number='9876543210',
                designation='Department Manager',
                employment_type='FULL_TIME',
                joining_date=datetime.utcnow().date(),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(manager_employee)
            
            # Update department to set this employee as manager
            department.manager_id = manager_employee.id
            db.session.add(department)

            db.session.commit()
            
            print("\n" + "="*60)
            print("✅ TEST MANAGER USER CREATED SUCCESSFULLY!")
            print("="*60)
            print("📝 Login Credentials:")
            print("-" * 60)
            print("Email: manager@sparquer.com")
            print("Password: Welcome@123")
            print(f"Organization: {organization.name}")
            print(f"Department: {department.name}")
            print(f"Role: {manager_role.name}")
            print("-" * 60)
            print("\n🎯 You can now:")
            print("1. Login to the frontend with these credentials")
            print("2. Access the manager dashboard at /manager/dashboard")
            print("3. Test manager role permissions and features")
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"❌ Error creating test manager: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    create_test_manager()