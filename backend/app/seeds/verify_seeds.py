"""
Verify that all seed data has been properly created.
Usage: python -m app.seeds.verify_seeds
"""
from ..models import Role, User, Organization, Department, Employee
from ..extensions import db


def verify_seeds():
    """Verify all seed data"""
    
    print("\n" + "="*60)
    print("🔍 VERIFYING SEED DATA")
    print("="*60 + "\n")
    
    errors = []
    warnings = []
    
    # Verify Roles
    print("Checking Roles...")
    roles = Role.query.all()
    expected_roles = ["super_admin", "org_admin", "employee"]
    
    if len(roles) < 3:
        errors.append(f"Expected 3 roles, found {len(roles)}")
    else:
        print(f"  ✅ Found {len(roles)} roles")
        for role in roles:
            if role.name in expected_roles:
                print(f"     • {role.name} - {role.description}")
    
    # Verify Super Admin
    print("\nChecking Super Admin...")
    super_admin = User.query.join(Role).filter(Role.name == "super_admin").first()
    
    if not super_admin:
        warnings.append("No super admin user found")
        print("  ⚠️  No super admin user found")
    else:
        print(f"  ✅ Super Admin: {super_admin.email}")
    
    # Verify Organizations
    print("\nChecking Organizations...")
    organizations = Organization.query.all()
    
    if len(organizations) == 0:
        warnings.append("No organizations found")
        print("  ⚠️  No organizations found")
    else:
        print(f"  ✅ Found {len(organizations)} organization(s)")
        for org in organizations:
            print(f"     • {org.name} ({org.code})")
    
    # Verify Sparquer Organization
    sparquer = Organization.query.filter_by(code="SPARQUER").first()
    
    if sparquer:
        print(f"\nChecking Sparquer Organization Details...")
        print(f"  ✅ Organization: {sparquer.name}")
        print(f"     • Code: {sparquer.code}")
        print(f"     • Type: {sparquer.organization_type}")
        print(f"     • Timezone: {sparquer.timezone}")
        
        # Verify Departments
        print(f"\n  Checking Departments...")
        departments = Department.query.filter_by(organization_id=sparquer.id).all()
        
        if len(departments) < 4:
            errors.append(f"Expected 4 departments for Sparquer, found {len(departments)}")
        else:
            print(f"  ✅ Found {len(departments)} departments")
            for dept in departments:
                emp_count = Employee.query.filter_by(department_id=dept.id).count()
                print(f"     • {dept.name} ({dept.code}) - {emp_count} employees")
        
        # Verify Employees
        print(f"\n  Checking Employees...")
        employees = Employee.query.filter_by(organization_id=sparquer.id).all()
        
        if len(employees) < 11:
            errors.append(f"Expected 11 employees for Sparquer, found {len(employees)}")
        else:
            print(f"  ✅ Found {len(employees)} employees")
            
            # Check by department
            for dept in departments:
                dept_employees = Employee.query.filter_by(department_id=dept.id).all()
                if dept_employees:
                    print(f"\n     {dept.name}:")
                    for emp in dept_employees:
                        user_email = emp.user.email if emp.user else "No user"
                        role_name = emp.user.role.name if emp.user and emp.user.role else "No role"
                        print(f"       • {emp.full_name} ({emp.employee_code}) - {user_email} [{role_name}]")
        
        # Verify Org Admin
        print(f"\n  Checking Org Admin...")
        org_admins = User.query.join(Role).filter(
            Role.name == "org_admin",
            User.organization_id == sparquer.id
        ).all()
        
        if len(org_admins) == 0:
            warnings.append("No org admin found for Sparquer")
            print("  ⚠️  No org admin found")
        else:
            print(f"  ✅ Found {len(org_admins)} org admin(s)")
            for admin in org_admins:
                print(f"     • {admin.email}")
    
    # Summary
    print("\n" + "="*60)
    print("📊 VERIFICATION SUMMARY")
    print("="*60)
    
    print(f"\nDatabase Statistics:")
    print(f"  • Roles: {Role.query.count()}")
    print(f"  • Users: {User.query.count()}")
    print(f"  • Organizations: {Organization.query.count()}")
    print(f"  • Departments: {Department.query.count()}")
    print(f"  • Employees: {Employee.query.count()}")
    
    if errors:
        print(f"\n❌ Errors Found ({len(errors)}):")
        for error in errors:
            print(f"   • {error}")
    
    if warnings:
        print(f"\n⚠️  Warnings ({len(warnings)}):")
        for warning in warnings:
            print(f"   • {warning}")
    
    if not errors and not warnings:
        print("\n✅ All seed data verified successfully!")
    elif not errors:
        print("\n✅ Seed data verified with some warnings")
    else:
        print("\n❌ Seed data verification failed with errors")
    
    print("="*60 + "\n")
    
    return len(errors) == 0


if __name__ == "__main__":
    from flask import Flask
    from ..config import Config
    
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        verify_seeds()
