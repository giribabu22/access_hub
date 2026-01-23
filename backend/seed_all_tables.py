"""
Comprehensive Database Seeding Script
This script populates ALL tables with sample data for testing and development
"""
import os
import sys
from datetime import datetime, date, time, timedelta
import uuid
from dotenv import load_dotenv

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

# Load environment
load_dotenv()

from app import create_app
from app.extensions import db, bcrypt
from app.models.role import Role
from app.models.organization import Organization
from app.models.user import User
from app.models.department import Department
from app.models.employee import Employee
from app.models.shift import Shift
from app.models.location import Location
from app.models.camera import Camera
from app.models.face_embedding import FaceEmbedding
from app.models.presence_event import PresenceEvent
from app.models.attendance import AttendanceRecord
from app.models.leave_request import LeaveRequest
from app.models.audit_log import AuditLog
from app.models.image import Image
from app.models.visitor import OrganizationVisitor, VisitorAlert, VisitorMovementLog

# Legacy models
from app.models import UserDetails, VisitorDetails, VisitorImage

print("=" * 70)
print("COMPREHENSIVE DATABASE SEEDING SCRIPT")
print("=" * 70)

app = create_app()

def create_roles():
    """Create system roles"""
    print("\n1. Creating Roles...")
    
    roles_data = [
        {
            'id': 'super_admin',
            'name': 'Super Admin',
            'description': 'Full system access across all organizations',
            'permissions': {
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
        },
        {
            'id': 'org_admin',
            'name': 'Organization Admin',
            'description': 'Full access within their organization',
            'permissions': {
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
        },
        {
            'id': 'manager',
            'name': 'Manager',
            'description': 'Department manager with team oversight',
            'permissions': {
                'employees': ['read', 'update'],
                'attendance': ['read', 'approve'],
                'leave_requests': ['read', 'approve', 'reject'],
            }
        },
        {
            'id': 'employee',
            'name': 'Employee',
            'description': 'Regular employee with limited access',
            'permissions': {
                'attendance': ['read'],
                'leave_requests': ['create', 'read'],
                'profile': ['read', 'update'],
            }
        }
    ]
    
    created_roles = []
    for role_data in roles_data:
        role = Role.query.filter_by(id=role_data['id']).first()
        if not role:
            role = Role(**role_data)
            db.session.add(role)
            print(f"   ✓ Created role: {role.name}")
        else:
            print(f"   ℹ Role already exists: {role.name}")
        created_roles.append(role)
    
    db.session.commit()
    return created_roles


def create_organizations():
    """Create sample organizations"""
    print("\n2. Creating Organizations...")
    
    orgs_data = [
        {
            'name': 'Sparquer Technologies',
            'code': 'SPARQUER',
            'address': '123 Tech Park, Bangalore, Karnataka 560001',
            'contact_email': 'contact@sparquer.com',
            'contact_phone': '+91-80-12345678',
            'subscription_tier': 'enterprise',
            'organization_type': 'technology',
            'timezone': 'Asia/Kolkata',
            'working_hours': {
                'monday': {'start': '09:00', 'end': '18:00'},
                'tuesday': {'start': '09:00', 'end': '18:00'},
                'wednesday': {'start': '09:00', 'end': '18:00'},
                'thursday': {'start': '09:00', 'end': '18:00'},
                'friday': {'start': '09:00', 'end': '18:00'},
            }
        },
        {
            'name': 'TechCorp Solutions',
            'code': 'TECHCORP',
            'address': '456 Business Avenue, Mumbai, Maharashtra 400001',
            'contact_email': 'info@techcorp.com',
            'contact_phone': '+91-22-87654321',
            'subscription_tier': 'professional',
            'organization_type': 'technology',
            'timezone': 'Asia/Kolkata',
        },
        {
            'name': 'Global Manufacturing Inc',
            'code': 'GLOBALMFG',
            'address': '789 Industrial Area, Pune, Maharashtra 411001',
            'contact_email': 'contact@globalmfg.com',
            'contact_phone': '+91-20-11223344',
            'subscription_tier': 'enterprise',
            'organization_type': 'manufacturing',
            'timezone': 'Asia/Kolkata',
        }
    ]
    
    created_orgs = []
    for org_data in orgs_data:
        org = Organization.query.filter_by(code=org_data['code']).first()
        if not org:
            org = Organization(**org_data)
            db.session.add(org)
            print(f"   ✓ Created organization: {org.name}")
        else:
            print(f"   ℹ Organization already exists: {org.name}")
        created_orgs.append(org)
    
    db.session.commit()
    return created_orgs


def create_users(roles, organizations):
    """Create sample users"""
    print("\n3. Creating Users...")
    
    users_data = [
        {
            'email': 'superadmin@system.com',
            'username': 'superadmin',
            'password': 'Super@123',
            'role_id': 'super_admin',
            'organization_id': None,
        },
        {
            'email': 'admin@sparquer.com',
            'username': 'sparquer_admin',
            'password': 'Admin@123',
            'role_id': 'org_admin',
            'organization_id': organizations[0].id,
        },
        {
            'email': 'manager@sparquer.com',
            'username': 'john_manager',
            'password': 'Manager@123',
            'role_id': 'manager',
            'organization_id': organizations[0].id,
        },
        {
            'email': 'employee1@sparquer.com',
            'username': 'alice_emp',
            'password': 'Employee@123',
            'role_id': 'employee',
            'organization_id': organizations[0].id,
        },
        {
            'email': 'employee2@sparquer.com',
            'username': 'bob_emp',
            'password': 'Employee@123',
            'role_id': 'employee',
            'organization_id': organizations[0].id,
        },
        {
            'email': 'admin@techcorp.com',
            'username': 'techcorp_admin',
            'password': 'Admin@123',
            'role_id': 'org_admin',
            'organization_id': organizations[1].id,
        },
    ]
    
    created_users = []
    for user_data in users_data:
        user = User.query.filter_by(email=user_data['email']).first()
        if not user:
            password = user_data.pop('password')
            user = User(**user_data)
            # Hash password using bcrypt
            user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            db.session.add(user)
            print(f"   ✓ Created user: {user.username} ({user.email})")
        else:
            print(f"   ℹ User already exists: {user.username}")
        created_users.append(user)
    
    db.session.commit()
    return created_users


def create_shifts(organizations):
    """Create work shifts"""
    print("\n4. Creating Shifts...")
    
    shifts_data = [
        {
            'organization_id': organizations[0].id,
            'name': 'Morning Shift',
            'start_time': time(9, 0),
            'end_time': time(18, 0),
            'grace_period_minutes': 15,
            'working_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Evening Shift',
            'start_time': time(14, 0),
            'end_time': time(23, 0),
            'grace_period_minutes': 15,
            'working_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Night Shift',
            'start_time': time(22, 0),
            'end_time': time(7, 0),
            'grace_period_minutes': 30,
            'working_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        },
    ]
    
    created_shifts = []
    for shift_data in shifts_data:
        shift = Shift(**shift_data)
        db.session.add(shift)
        print(f"   ✓ Created shift: {shift.name}")
        created_shifts.append(shift)
    
    db.session.commit()
    return created_shifts


def create_departments(organizations):
    """Create departments"""
    print("\n5. Creating Departments...")
    
    departments_data = [
        {
            'organization_id': organizations[0].id,
            'name': 'Engineering',
            'code': 'ENG',
            'description': 'Software Development and Engineering',
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Human Resources',
            'code': 'HR',
            'description': 'Human Resources and Talent Management',
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Sales & Marketing',
            'code': 'SALES',
            'description': 'Sales and Marketing Department',
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Finance',
            'code': 'FIN',
            'description': 'Finance and Accounts',
        },
        {
            'organization_id': organizations[1].id,
            'name': 'Operations',
            'code': 'OPS',
            'description': 'Operations and Delivery',
        },
    ]
    
    created_departments = []
    for dept_data in departments_data:
        dept = Department.query.filter_by(
            organization_id=dept_data['organization_id'],
            code=dept_data['code']
        ).first()
        
        if not dept:
            dept = Department(**dept_data)
            db.session.add(dept)
            print(f"   ✓ Created department: {dept.name} ({dept.code})")
        else:
            print(f"   ℹ Department already exists: {dept.name}")
        created_departments.append(dept)
    
    db.session.commit()
    return created_departments


def create_employees(users, departments, shifts):
    """Create employee records"""
    print("\n6. Creating Employees...")
    
    # Skip super admin (no organization)
    employees_data = [
        {
            'user_id': users[1].id,  # sparquer_admin
            'organization_id': users[1].organization_id,
            'department_id': departments[0].id,
            'employee_code': 'SPQ001',
            'full_name': 'Admin User',
            'gender': 'male',
            'date_of_birth': date(1985, 5, 15),
            'phone_number': '+91-9876543210',
            'joining_date': date(2020, 1, 1),
            'designation': 'VP Engineering',
            'employment_type': 'full_time',
            'shift_id': shifts[0].id,
        },
        {
            'user_id': users[2].id,  # john_manager
            'organization_id': users[2].organization_id,
            'department_id': departments[0].id,
            'employee_code': 'SPQ002',
            'full_name': 'John Manager',
            'gender': 'male',
            'date_of_birth': date(1988, 8, 20),
            'phone_number': '+91-9876543211',
            'joining_date': date(2021, 3, 15),
            'designation': 'Engineering Manager',
            'employment_type': 'full_time',
            'shift_id': shifts[0].id,
        },
        {
            'user_id': users[3].id,  # alice_emp
            'organization_id': users[3].organization_id,
            'department_id': departments[0].id,
            'employee_code': 'SPQ003',
            'full_name': 'Alice Smith',
            'gender': 'female',
            'date_of_birth': date(1995, 3, 10),
            'phone_number': '+91-9876543212',
            'joining_date': date(2022, 6, 1),
            'designation': 'Senior Software Engineer',
            'employment_type': 'full_time',
            'shift_id': shifts[0].id,
        },
        {
            'user_id': users[4].id,  # bob_emp
            'organization_id': users[4].organization_id,
            'department_id': departments[0].id,
            'employee_code': 'SPQ004',
            'full_name': 'Bob Johnson',
            'gender': 'male',
            'date_of_birth': date(1992, 11, 25),
            'phone_number': '+91-9876543213',
            'joining_date': date(2022, 8, 15),
            'designation': 'Software Engineer',
            'employment_type': 'full_time',
            'shift_id': shifts[0].id,
        },
    ]
    
    created_employees = []
    for emp_data in employees_data:
        emp = Employee.query.filter_by(user_id=emp_data['user_id']).first()
        if not emp:
            emp = Employee(**emp_data)
            db.session.add(emp)
            print(f"   ✓ Created employee: {emp.full_name} ({emp.employee_code})")
        else:
            print(f"   ℹ Employee already exists: {emp.full_name}")
        created_employees.append(emp)
    
    db.session.commit()
    
    # Update department manager
    departments[0].manager_id = created_employees[1].id  # John Manager
    db.session.commit()
    print(f"   ✓ Updated department manager for Engineering")
    
    return created_employees


def create_locations(organizations):
    """Create locations"""
    print("\n7. Creating Locations...")
    
    locations_data = [
        {
            'organization_id': organizations[0].id,
            'name': 'Main Entrance',
            'location_type': 'entrance',
            'building': 'Tower A',
            'floor': 'Ground',
            'description': 'Main building entrance',
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Office Floor 1',
            'location_type': 'office',
            'building': 'Tower A',
            'floor': '1',
            'description': 'Engineering department floor',
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Office Floor 2',
            'location_type': 'office',
            'building': 'Tower A',
            'floor': '2',
            'description': 'HR and Finance floor',
        },
        {
            'organization_id': organizations[0].id,
            'name': 'Cafeteria',
            'location_type': 'common_area',
            'building': 'Tower A',
            'floor': 'Ground',
            'description': 'Employee cafeteria',
        },
    ]
    
    created_locations = []
    for loc_data in locations_data:
        loc = Location(**loc_data)
        db.session.add(loc)
        print(f"   ✓ Created location: {loc.name}")
        created_locations.append(loc)
    
    db.session.commit()
    return created_locations


def create_cameras(organizations, locations):
    """Create camera configurations"""
    print("\n8. Creating Cameras...")
    
    cameras_data = [
        {
            'organization_id': organizations[0].id,
            'location_id': locations[0].id,
            'name': 'Main Entrance Camera',
            'camera_type': 'entry',
            'source_type': 'rtsp',
            'source_url': 'rtsp://192.168.1.100:554/stream1',
            'confidence_threshold': 0.85,
            'liveness_check_enabled': True,
            'status': 'active',
        },
        {
            'organization_id': organizations[0].id,
            'location_id': locations[1].id,
            'name': 'Floor 1 Entry Camera',
            'camera_type': 'monitoring',
            'source_type': 'rtsp',
            'source_url': 'rtsp://192.168.1.101:554/stream1',
            'confidence_threshold': 0.80,
            'liveness_check_enabled': True,
            'status': 'active',
        },
        {
            'organization_id': organizations[0].id,
            'location_id': locations[2].id,
            'name': 'Floor 2 Entry Camera',
            'camera_type': 'monitoring',
            'source_type': 'rtsp',
            'source_url': 'rtsp://192.168.1.102:554/stream1',
            'confidence_threshold': 0.80,
            'liveness_check_enabled': False,
            'status': 'active',
        },
    ]
    
    created_cameras = []
    for cam_data in cameras_data:
        cam = Camera(**cam_data)
        db.session.add(cam)
        print(f"   ✓ Created camera: {cam.name}")
        created_cameras.append(cam)
    
    db.session.commit()
    return created_cameras


def create_face_embeddings(employees):
    """Create sample face embeddings"""
    print("\n9. Creating Face Embeddings...")
    
    created_embeddings = []
    for emp in employees:
        # Create sample embedding (normally this would be from face recognition)
        embedding = FaceEmbedding(
            employee_id=emp.id,
            organization_id=emp.organization_id,
            embedding_vector=[0.1] * 128,  # Dummy 128-dim vector
            model_version='facenet_v1',
            quality_score=0.95,
            is_primary=True,
        )
        db.session.add(embedding)
        print(f"   ✓ Created face embedding for: {emp.full_name}")
        created_embeddings.append(embedding)
    
    db.session.commit()
    return created_embeddings


def create_attendance_records(employees, cameras):
    """Create attendance records for the past week"""
    print("\n10. Creating Attendance Records...")
    
    created_records = []
    today = date.today()
    
    for day_offset in range(7):  # Last 7 days
        record_date = today - timedelta(days=day_offset)
        
        # Skip weekends
        if record_date.weekday() >= 5:
            continue
        
        for emp in employees:
            # Random check-in time around 9 AM
            check_in = datetime.combine(record_date, time(9, 0)) + timedelta(minutes=day_offset * 5)
            check_out = check_in + timedelta(hours=9)  # 9 hour work day
            
            record = AttendanceRecord(
                employee_id=emp.id,
                organization_id=emp.organization_id,
                camera_id=cameras[0].id if cameras else None,
                date=record_date,
                check_in_time=check_in,
                check_out_time=check_out,
                status='present',
                work_hours=9.0,
                face_match_confidence=0.92,
                liveness_verified=True,
                review_status='approved',
            )
            db.session.add(record)
            created_records.append(record)
    
    db.session.commit()
    print(f"   ✓ Created {len(created_records)} attendance records")
    return created_records


def create_presence_events(employees, cameras, locations):
    """Create presence events"""
    print("\n11. Creating Presence Events...")
    
    created_events = []
    now = datetime.now()
    
    for i, emp in enumerate(employees[:2]):  # Just for first 2 employees
        # Entry event
        event = PresenceEvent(
            organization_id=emp.organization_id,
            employee_id=emp.id,
            camera_id=cameras[0].id,
            location_id=locations[0].id,
            event_type='entry',
            timestamp=now - timedelta(hours=2, minutes=i*10),
            confidence_score=0.93,
            liveness_verified=True,
            liveness_score=0.98,
            review_status='approved',
        )
        db.session.add(event)
        created_events.append(event)
    
    db.session.commit()
    print(f"   ✓ Created {len(created_events)} presence events")
    return created_events


def create_leave_requests(employees, users):
    """Create leave requests"""
    print("\n12. Creating Leave Requests...")
    
    leave_data = [
        {
            'employee_id': employees[2].id,  # Alice
            'organization_id': employees[2].organization_id,
            'leave_type': 'sick',
            'start_date': date.today() + timedelta(days=5),
            'end_date': date.today() + timedelta(days=6),
            'total_days': 2.0,
            'reason': 'Medical checkup',
            'status': 'pending',
        },
        {
            'employee_id': employees[3].id,  # Bob
            'organization_id': employees[3].organization_id,
            'leave_type': 'vacation',
            'start_date': date.today() + timedelta(days=10),
            'end_date': date.today() + timedelta(days=15),
            'total_days': 5.0,
            'reason': 'Family vacation',
            'status': 'approved',
            'approved_by': users[1].id,
            'approval_notes': 'Approved',
        },
    ]
    
    created_leaves = []
    for leave in leave_data:
        lr = LeaveRequest(**leave)
        db.session.add(lr)
        print(f"   ✓ Created leave request for employee ID: {leave['employee_id']}")
        created_leaves.append(lr)
    
    db.session.commit()
    return created_leaves


def create_visitors(organizations, locations):
    """Create visitor records"""
    print("\n13. Creating Visitors...")
    
    visitors_data = [
        {
            'organization_id': organizations[0].id,
            'visitor_name': 'Raj Kumar',
            'mobile_number': '+91-9988776655',
            'purpose_of_visit': 'Client Meeting',
            'allowed_floor': 'Floor 1',
            'check_in_time': datetime.now() - timedelta(hours=2),
            'is_checked_in': True,
            'current_floor': 'Floor 1',
        },
        {
            'organization_id': organizations[0].id,
            'visitor_name': 'Priya Sharma',
            'mobile_number': '+91-9988776656',
            'purpose_of_visit': 'Interview',
            'allowed_floor': 'Floor 2',
            'check_in_time': datetime.now() - timedelta(hours=1),
            'check_out_time': datetime.now() - timedelta(minutes=10),
            'is_checked_in': False,
            'current_floor': None,
        },
    ]
    
    created_visitors = []
    for vis_data in visitors_data:
        visitor = OrganizationVisitor(**vis_data)
        db.session.add(visitor)
        print(f"   ✓ Created visitor: {visitor.visitor_name}")
        created_visitors.append(visitor)
    
    db.session.commit()
    
    # Create visitor alert for first visitor
    if created_visitors:
        alert = VisitorAlert(
            visitor_id=created_visitors[0].id,
            organization_id=created_visitors[0].organization_id,
            alert_type='unauthorized_access',
            current_floor='Floor 2',
            allowed_floor='Floor 1',
            alert_time=datetime.now() - timedelta(minutes=30),
            acknowledged=False,
        )
        db.session.add(alert)
        db.session.commit()
        print(f"   ✓ Created visitor alert")
    
    return created_visitors


def create_audit_logs(users, organizations):
    """Create sample audit logs"""
    print("\n14. Creating Audit Logs...")
    
    audit_data = [
        {
            'user_id': users[1].id,
            'organization_id': organizations[0].id,
            'action': 'create',
            'entity_type': 'employee',
            'entity_id': str(uuid.uuid4()),
            'new_values': {'name': 'New Employee', 'status': 'active'},
        },
        {
            'user_id': users[1].id,
            'organization_id': organizations[0].id,
            'action': 'update',
            'entity_type': 'department',
            'entity_id': str(uuid.uuid4()),
            'old_values': {'name': 'Old Dept'},
            'new_values': {'name': 'Updated Dept'},
        },
    ]
    
    created_logs = []
    for log_data in audit_data:
        log = AuditLog(**log_data)
        db.session.add(log)
        created_logs.append(log)
    
    db.session.commit()
    print(f"   ✓ Created {len(created_logs)} audit log entries")
    return created_logs


def create_images(employees, users, organizations):
    """Create sample image records"""
    print("\n15. Creating Image Records...")
    
    created_images = []
    for emp in employees[:2]:  # Just for first 2 employees
        img = Image(
            entity_type='employee',
            entity_id=emp.id,
            organization_id=emp.organization_id,
            image_base64='base64_dummy_data_here',  # In real scenario, this would be actual base64
            image_type='profile',
            file_name=f'{emp.employee_code}_profile.jpg',
            file_size=102400,  # 100KB
            mime_type='image/jpeg',
            captured_by=users[1].id,
            primary=True,
        )
        db.session.add(img)
        print(f"   ✓ Created image for: {emp.full_name}")
        created_images.append(img)
    
    db.session.commit()
    return created_images


def main():
    """Main seeding function"""
    with app.app_context():
        try:
            print("\nStarting comprehensive database seeding...")
            print("This will populate ALL tables with sample data.\n")
            
            # 1. Roles
            roles = create_roles()
            
            # 2. Organizations
            organizations = create_organizations()
            
            # 3. Users
            users = create_users(roles, organizations)
            
            # 4. Shifts
            shifts = create_shifts(organizations)
            
            # 5. Departments
            departments = create_departments(organizations)
            
            # 6. Employees
            employees = create_employees(users, departments, shifts)
            
            # 7. Locations
            locations = create_locations(organizations)
            
            # 8. Cameras
            cameras = create_cameras(organizations, locations)
            
            # 9. Face Embeddings
            embeddings = create_face_embeddings(employees)
            
            # 10. Attendance Records
            attendance = create_attendance_records(employees, cameras)
            
            # 11. Presence Events
            events = create_presence_events(employees, cameras, locations)
            
            # 12. Leave Requests
            leaves = create_leave_requests(employees, users)
            
            # 13. Visitors
            visitors = create_visitors(organizations, locations)
            
            # 14. Audit Logs
            audit_logs = create_audit_logs(users, organizations)
            
            # 15. Images
            images = create_images(employees, users, organizations)
            
            print("\n" + "=" * 70)
            print("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
            print("=" * 70)
            
            print("\n📊 Summary:")
            print(f"   • Roles: {len(roles)}")
            print(f"   • Organizations: {len(organizations)}")
            print(f"   • Users: {len(users)}")
            print(f"   • Departments: {len(departments)}")
            print(f"   • Employees: {len(employees)}")
            print(f"   • Shifts: {len(shifts)}")
            print(f"   • Locations: {len(locations)}")
            print(f"   • Cameras: {len(cameras)}")
            print(f"   • Face Embeddings: {len(embeddings)}")
            print(f"   • Attendance Records: {len(attendance)}")
            print(f"   • Presence Events: {len(events)}")
            print(f"   • Leave Requests: {len(leaves)}")
            print(f"   • Visitors: {len(visitors)}")
            print(f"   • Audit Logs: {len(audit_logs)}")
            print(f"   • Images: {len(images)}")
            
            print("\n🔑 Sample Login Credentials:")
            print("   Super Admin:")
            print("      Email: superadmin@system.com")
            print("      Password: Super@123")
            print("\n   Org Admin (Sparquer):")
            print("      Email: admin@sparquer.com")
            print("      Password: Admin@123")
            print("\n   Manager:")
            print("      Email: manager@sparquer.com")
            print("      Password: Manager@123")
            print("\n   Employee:")
            print("      Email: employee1@sparquer.com")
            print("      Password: Employee@123")
            
            print("\n" + "=" * 70)
            
        except Exception as e:
            print(f"\n❌ Error during seeding: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return False
    
    return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)