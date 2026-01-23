"""
Initialize Sparquer organization with departments and employees.
Run this script after init_roles to set up the organization structure.
"""
from datetime import datetime, date
from ..extensions import db, bcrypt
from werkzeug.security import generate_password_hash as _legacy_generate_password_hash
from ..models import Organization, Department, Employee, User, Role


# Department to employee mapping
DEPARTMENT_ASSIGNMENTS = {
    "AI": ["Sai Krishna", "Sankara Bharadwaj"],
    "Frontend": ["DP", "Shirlene"],
    "Backend": ["Prem", "Manoj"],
    "HR": ["Kajal Yadav", "Navyasree Yadavalli", "Nisha Yadav", "Ramesh", "Sujay Jacob"]
}


def init_sparquer_organization():
    """Create Sparquer organization with departments and employees"""
    
    print("\n🏢 Initializing Sparquer Organization...")
    
    # Step 1: Create/Get Organization
    organization = Organization.query.filter_by(code="SPARQUER").first()
    
    if not organization:
        organization = Organization(
            name="Sparquer",
            code="SPARQUER",
            address="India",
            contact_email="info@sparquer.com",
            contact_phone="+91-1234567890",
            organization_type="office",
            timezone="Asia/Kolkata",
            working_hours={
                "start": "09:00",
                "end": "18:00",
                "days": [1, 2, 3, 4, 5]  # Monday to Friday
            },
            subscription_tier="premium",
            is_active=True
        )
        db.session.add(organization)
        db.session.flush()
        print(f"✅ Created organization: {organization.name}")
    else:
        print(f"ℹ️  Organization already exists: {organization.name}")
    
    # Step 2: Create Departments
    departments_data = [
        {"name": "AI Team", "code": "AI", "description": "Artificial Intelligence and Machine Learning Team"},
        {"name": "Frontend", "code": "FRONTEND", "description": "Frontend Development Team"},
        {"name": "Backend", "code": "BACKEND", "description": "Backend Development Team"},
        {"name": "HR", "code": "HR", "description": "Human Resources Department"},
    ]
    
    departments = {}
    for dept_data in departments_data:
        dept = Department.query.filter_by(
            organization_id=organization.id,
            code=dept_data["code"]
        ).first()
        
        if not dept:
            dept = Department(
                organization_id=organization.id,
                name=dept_data["name"],
                code=dept_data["code"],
                description=dept_data["description"],
                is_active=True
            )
            db.session.add(dept)
            db.session.flush()
            print(f"  ✅ Created department: {dept.name}")
        else:
            print(f"  ℹ️  Department already exists: {dept.name}")
        
        departments[dept_data["code"]] = dept
    
    # Step 3: Get role for employees
    employee_role = Role.query.filter_by(name="employee").first()
    org_admin_role = Role.query.filter_by(name="org_admin").first()
    
    if not employee_role:
        print("❌ Error: 'employee' role not found. Please run init_roles first.")
        return
    
    # Step 4: Create Employees
    employees_data = [
        # AI Team
        {
            "full_name": "Sai Krishna",
            "email": "saikrishna@sparquer.com",
            "username": "saikrishna",
            "employee_code": "SPQR001",
            "department": "AI",
            "designation": "AI Engineer",
            "gender": "male"
        },
        {
            "full_name": "Sankara Bharadwaj",
            "email": "sankara@sparquer.com",
            "username": "sankara",
            "employee_code": "SPQR002",
            "department": "AI",
            "designation": "ML Engineer",
            "gender": "male"
        },
        
        # Frontend Team
        {
            "full_name": "DP",
            "email": "dp@sparquer.com",
            "username": "dp",
            "employee_code": "SPQR003",
            "department": "FRONTEND",
            "designation": "Frontend Developer",
            "gender": "male"
        },
        {
            "full_name": "Shirlene",
            "email": "shirlene@sparquer.com",
            "username": "shirlene",
            "employee_code": "SPQR004",
            "department": "FRONTEND",
            "designation": "Frontend Developer",
            "gender": "female"
        },
        
        # Backend Team
        {
            "full_name": "Prem",
            "email": "giribabunettlinx@gmail.com",
            "username": "prem",
            "employee_code": "SPQR005",
            "department": "BACKEND",
            "designation": "Backend Developer",
            "gender": "male",
            "role": "org_admin"  # Special: Org Admin
        },
        {
            "full_name": "Manoj",
            "email": "manoj@sparquer.com",
            "username": "manoj",
            "employee_code": "SPQR006",
            "department": "BACKEND",
            "designation": "Backend Developer",
            "gender": "male"
        },
        
        # HR Team
        {
            "full_name": "Kajal Yadav",
            "email": "kajal@sparquer.com",
            "username": "kajal",
            "employee_code": "SPQR007",
            "department": "HR",
            "designation": "HR Manager",
            "gender": "female"
        },
        {
            "full_name": "Navyasree Yadavalli",
            "email": "navyasree@sparquer.com",
            "username": "navyasree",
            "employee_code": "SPQR008",
            "department": "HR",
            "designation": "HR Executive",
            "gender": "female"
        },
        {
            "full_name": "Nisha Yadav",
            "email": "nisha@sparquer.com",
            "username": "nisha",
            "employee_code": "SPQR009",
            "department": "HR",
            "designation": "HR Executive",
            "gender": "female"
        },
        {
            "full_name": "Ramesh",
            "email": "ramesh@sparquer.com",
            "username": "ramesh",
            "employee_code": "SPQR010",
            "department": "HR",
            "designation": "HR Coordinator",
            "gender": "male"
        },
        {
            "full_name": "Sujay Jacob",
            "email": "sujay@sparquer.com",
            "username": "sujay",
            "employee_code": "SPQR011",
            "department": "HR",
            "designation": "HR Coordinator",
            "gender": "male"
        }
    ]
    
    created_employees = []
    for emp_data in employees_data:
        # Check if user already exists
        existing_user = User.query.filter_by(email=emp_data["email"]).first()
        
        if existing_user:
            print(f"  ℹ️  User already exists: {emp_data['full_name']} ({emp_data['email']})")
            continue
        
        # Determine role
        role = org_admin_role if emp_data.get("role") == "org_admin" else employee_role
        
        # Create user account
        user = User(
            email=emp_data["email"],
            username=emp_data["username"],
            password_hash=bcrypt.generate_password_hash("Welcome@123").decode('utf-8'),  # Default password
            role_id=role.id,
            organization_id=organization.id,
            is_active=True
        )
        db.session.add(user)
        db.session.flush()
        
        # Create employee profile
        department = departments[emp_data["department"]]
        employee = Employee(
            user_id=user.id,
            organization_id=organization.id,
            department_id=department.id,
            employee_code=emp_data["employee_code"],
            full_name=emp_data["full_name"],
            gender=emp_data.get("gender"),
            designation=emp_data["designation"],
            employment_type="full_time",
            joining_date=date.today(),
            is_active=True
        )
        db.session.add(employee)
        db.session.flush()
        
        created_employees.append(employee)
        print(f"  ✅ Created employee: {employee.full_name} ({employee.employee_code}) - {emp_data['department']}")
    
    # Commit all changes
    db.session.commit()
    
    # Summary
    print(f"\n{'='*60}")
    print(f"✅ Sparquer Organization Setup Complete!")
    print(f"{'='*60}")
    print(f"Organization: {organization.name} ({organization.code})")
    print(f"Departments: {len(departments)}")
    print(f"Employees Created: {len(created_employees)}")
    print(f"\nDefault Password for all users: Welcome@123")
    print(f"\nOrg Admin: {emp_data.get('full_name', 'Prem')} ({emp_data.get('email', 'giribabunettlinx@gmail.com')})")
    print(f"{'='*60}\n")
    
    return organization, departments, created_employees


if __name__ == "__main__":
    from flask import Flask
    from ..config import Config
    
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        init_sparquer_organization()
