#!/usr/bin/env python
"""
Create a test employee user for development and testing.
"""

import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User
from app.models.role import Role
from app.models.organization import Organization
from app.models.department import Department
from app.models.employee import Employee
from werkzeug.security import generate_password_hash
from sqlalchemy import text
import uuid
from datetime import datetime

def create_test_employee():
    """Create a test employee user"""
    
    app = create_app()
    
    with app.app_context():
        try:
            print("🚀 Creating test employee user...")
            
            # Get or create organization
            org = Organization.query.filter_by(name='Sparquer').first()
            if not org:
                org = Organization(
                    id=str(uuid.uuid4()),
                    name='Sparquer',
                    domain='sparquer.com',
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                db.session.add(org)
                db.session.flush()
                print(f"📋 Created organization: {org.name}")
            else:
                print(f"📋 Using existing organization: {org.name}")
            
            # Get or create department
            dept = Department.query.filter_by(name='Engineering', organization_id=org.id).first()
            if not dept:
                dept = Department(
                    id=str(uuid.uuid4()),
                    name='Engineering',
                    description='Software Engineering Department',
                    organization_id=org.id,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                db.session.add(dept)
                db.session.flush()
                print(f"🏢 Created department: {dept.name}")
            else:
                print(f"🏢 Using existing department: {dept.name}")
            
            # Get employee role
            employee_role = Role.query.filter_by(name='employee').first()
            if not employee_role:
                print("❌ Employee role not found. Please run seed scripts first.")
                return False
                
            print(f"👤 Using role: {employee_role.name}")
            
            # Check if test employee already exists
            existing_user = User.query.filter_by(email='john.employee@sparquer.com').first()
            if existing_user:
                print(f"⚠️  Test employee already exists: {existing_user.email}")
                
                # Update the user if needed
                existing_user.role_id = employee_role.id
                existing_user.organization_id = org.id
                existing_user.is_active = True
                
                # Check employee record
                employee_record = Employee.query.filter_by(user_id=existing_user.id).first()
                if not employee_record:
                    employee_record = Employee(
                        id=str(uuid.uuid4()),
                        user_id=existing_user.id,
                        employee_id='EMP001',
                        organization_id=org.id,
                        department_id=dept.id,
                        position='Software Developer',
                        phone='+1-555-0123',
                        hire_date=datetime.utcnow().date(),
                        salary=75000.00,
                        is_active=True,
                        created_at=datetime.utcnow()
                    )
                    db.session.add(employee_record)
                    print("👨‍💼 Created employee record")
                else:
                    employee_record.department_id = dept.id
                    employee_record.is_active = True
                    print("👨‍💼 Updated existing employee record")
                
                db.session.commit()
                print(f"✅ Updated existing test employee: {existing_user.email}")
                return True
            
            # Create new user
            test_user = User(
                id=str(uuid.uuid4()),
                username='john.employee',
                email='john.employee@sparquer.com',
                password_hash=generate_password_hash('password123'),
                first_name='John',
                last_name='Employee',
                role_id=employee_role.id,
                organization_id=org.id,
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            db.session.add(test_user)
            db.session.flush()  # Get the user ID
            
            print(f"👤 Created user: {test_user.email}")
            
            # Create employee record
            test_employee = Employee(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                employee_id='EMP001',
                organization_id=org.id,
                department_id=dept.id,
                position='Software Developer',
                phone='+1-555-0123',
                hire_date=datetime.utcnow().date(),
                salary=75000.00,
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            db.session.add(test_employee)
            db.session.commit()
            
            print(f"👨‍💼 Created employee record: {test_employee.employee_id}")
            
            print("\n" + "="*50)
            print("✅ TEST EMPLOYEE CREATED SUCCESSFULLY!")
            print("="*50)
            print(f"📧 Email: {test_user.email}")
            print(f"🔑 Password: password123")
            print(f"👤 Role: {employee_role.name}")
            print(f"🏢 Department: {dept.name}")
            print(f"🆔 Employee ID: {test_employee.employee_id}")
            print(f"📍 Position: {test_employee.position}")
            print("="*50)
            print("🚀 You can now login with these credentials!")
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating test employee: {str(e)}")
            db.session.rollback()
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    success = create_test_employee()
    if success:
        print("✅ Script completed successfully")
        sys.exit(0)
    else:
        print("❌ Script failed")
        sys.exit(1)