#!/usr/bin/env python
"""
Create sample attendance and leave data for testing employee/manager functionality.
"""

import sys
import os
from datetime import datetime, timedelta, date
import random

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import Leave
import uuid

def create_sample_data():
    """Create sample attendance and leave data"""
    
    app = create_app()
    
    with app.app_context():
        try:
            print("🚀 Creating sample attendance and leave data...")
            
            # Get test employees
            employees = Employee.query.filter_by(is_active=True).all()
            
            if not employees:
                print("❌ No employees found. Please create test employees first.")
                return False
            
            print(f"👥 Found {len(employees)} employees")
            
            # Create attendance records for the last 30 days
            end_date = date.today()
            start_date = end_date - timedelta(days=30)
            
            attendance_count = 0
            leave_count = 0
            
            for employee in employees:
                print(f"📊 Creating data for employee: {employee.employee_id}")
                
                current_date = start_date
                while current_date <= end_date:
                    # Skip weekends for most employees (90% chance)
                    if current_date.weekday() < 5 or random.random() < 0.1:
                        # 85% chance of being present
                        if random.random() < 0.85:
                            # Create attendance record
                            check_in_time = datetime.combine(
                                current_date,
                                datetime.min.time().replace(
                                    hour=random.randint(8, 9),
                                    minute=random.randint(0, 59)
                                )
                            )
                            
                            # Check out 8-9 hours later
                            work_hours = random.uniform(7.5, 9.5)
                            check_out_time = check_in_time + timedelta(hours=work_hours)
                            
                            # Check if attendance already exists
                            existing = Attendance.query.filter(
                                Attendance.employee_id == employee.id,
                                db.func.date(Attendance.check_in_time) == current_date
                            ).first()
                            
                            if not existing:
                                attendance = Attendance(
                                    id=str(uuid.uuid4()),
                                    employee_id=employee.id,
                                    check_in_time=check_in_time,
                                    check_out_time=check_out_time,
                                    created_at=datetime.utcnow()
                                )
                                db.session.add(attendance)
                                attendance_count += 1
                    
                    current_date += timedelta(days=1)
                
                # Create some leave requests
                leave_types = ['Annual Leave', 'Sick Leave', 'Personal Leave']
                statuses = ['approved', 'pending', 'rejected']
                
                # Create 2-4 leave requests for each employee
                for _ in range(random.randint(2, 4)):
                    leave_start = start_date + timedelta(days=random.randint(0, 20))
                    leave_duration = random.randint(1, 5)
                    leave_end = leave_start + timedelta(days=leave_duration - 1)
                    
                    # Don't create leave for future dates beyond a week
                    if leave_start > date.today() + timedelta(days=7):
                        continue
                    
                    # Check if leave already exists for this period
                    existing_leave = Leave.query.filter(
                        Leave.employee_id == employee.id,
                        Leave.start_date <= leave_end,
                        Leave.end_date >= leave_start
                    ).first()
                    
                    if not existing_leave:
                        leave = Leave(
                            id=str(uuid.uuid4()),
                            employee_id=employee.id,
                            leave_type=random.choice(leave_types),
                            start_date=leave_start,
                            end_date=leave_end,
                            days_requested=leave_duration,
                            reason=f"Sample {random.choice(leave_types).lower()} request for testing",
                            status=random.choice(statuses),
                            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                        )
                        
                        # Add manager comments for approved/rejected leaves
                        if leave.status == 'approved':
                            leave.manager_comments = "Approved - Enjoy your time off"
                            leave.approved_at = datetime.utcnow() - timedelta(days=random.randint(1, 10))
                        elif leave.status == 'rejected':
                            leave.manager_comments = "Unable to approve due to project deadlines"
                            leave.approved_at = datetime.utcnow() - timedelta(days=random.randint(1, 10))
                        
                        db.session.add(leave)
                        leave_count += 1
            
            db.session.commit()
            
            print("\n" + "="*60)
            print("✅ SAMPLE DATA CREATED SUCCESSFULLY!")
            print("="*60)
            print(f"📊 Created {attendance_count} attendance records")
            print(f"📅 Created {leave_count} leave requests")
            print(f"👥 For {len(employees)} employees")
            print(f"📆 Date range: {start_date} to {end_date}")
            print("="*60)
            print("🚀 You can now test the employee and manager dashboards!")
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating sample data: {str(e)}")
            db.session.rollback()
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    success = create_sample_data()
    if success:
        print("✅ Script completed successfully")
        sys.exit(0)
    else:
        print("❌ Script failed")
        sys.exit(1)