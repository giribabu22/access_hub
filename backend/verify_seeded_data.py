"""
Verify Seeded Data Script
This script checks all tables and displays row counts
"""
import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
load_dotenv()

from app import create_app
from app.extensions import db
from sqlalchemy import text

print("=" * 70)
print("DATABASE VERIFICATION REPORT")
print("=" * 70)

app = create_app()

def get_table_counts():
    """Get row counts for all tables"""
    with app.app_context():
        tables = [
            'roles',
            'organizations',
            'users',
            'departments',
            'employees',
            'shifts',
            'locations',
            'cameras',
            'face_embeddings',
            'attendance_records',
            'presence_events',
            'leave_requests',
            'visitors',
            'visitor_alerts',
            'visitor_movement_logs',
            'audit_logs',
            'images',
            'user_details',
            'visitor_details',
            'visitor_images',
        ]
        
        print("\n📊 Table Row Counts:\n")
        print(f"{'Table Name':<30} {'Row Count':>10}")
        print("-" * 42)
        
        total_rows = 0
        for table in tables:
            try:
                result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                total_rows += count
                
                status = "✓" if count > 0 else "○"
                print(f"{status} {table:<28} {count:>10,}")
            except Exception as e:
                print(f"✗ {table:<28} {'ERROR':>10}")
        
        print("-" * 42)
        print(f"{'TOTAL':<30} {total_rows:>10,}")
        
        # Get some sample data
        print("\n" + "=" * 70)
        print("📋 Sample Data Preview")
        print("=" * 70)
        
        # Organizations
        print("\n1. Organizations:")
        result = db.session.execute(text("""
            SELECT name, code, subscription_tier 
            FROM organizations 
            LIMIT 5
        """))
        for row in result:
            print(f"   • {row[0]} ({row[1]}) - {row[2]}")
        
        # Users
        print("\n2. Users:")
        result = db.session.execute(text("""
            SELECT u.username, u.email, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LIMIT 5
        """))
        for row in result:
            print(f"   • {row[0]:<20} {row[1]:<30} [{row[2]}]")
        
        # Employees
        print("\n3. Employees:")
        result = db.session.execute(text("""
            SELECT e.employee_code, e.full_name, d.name as department
            FROM employees e
            JOIN departments d ON e.department_id = d.id
            LIMIT 5
        """))
        for row in result:
            print(f"   • {row[0]:<10} {row[1]:<25} ({row[2]})")
        
        # Recent Attendance
        print("\n4. Recent Attendance (Last 5):")
        result = db.session.execute(text("""
            SELECT e.employee_code, e.full_name, a.date, a.status
            FROM attendance_records a
            JOIN employees e ON a.employee_id = e.id
            ORDER BY a.date DESC
            LIMIT 5
        """))
        for row in result:
            print(f"   • {row[1]:<25} {row[2]} - {row[3]}")
        
        # Departments with employee count
        print("\n5. Departments with Employee Count:")
        result = db.session.execute(text("""
            SELECT d.name, d.code, COUNT(e.id) as emp_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            GROUP BY d.id, d.name, d.code
            ORDER BY emp_count DESC
        """))
        for row in result:
            print(f"   • {row[0]:<30} ({row[1]:<10}) - {row[2]} employees")
        
        print("\n" + "=" * 70)
        print("✅ Verification Complete!")
        print("=" * 70)


if __name__ == '__main__':
    try:
        get_table_counts()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
