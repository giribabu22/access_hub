"""
Business logic for Attendance management.
"""

from sqlalchemy import or_, and_
from ..extensions import db
from ..models import AttendanceRecord, Employee
from ..utils.exceptions import NotFoundError, ConflictError, BadRequestError
from datetime import datetime, date, timedelta


class AttendanceService:
    """Service class for attendance operations"""
    
    @staticmethod
    def check_in(data, current_user):
        """Check-in an employee"""
        employee_id = data['employee_id']
        employee = Employee.query.filter_by(id=employee_id, deleted_at=None).first()
        
        if not employee:
            raise NotFoundError('Employee')
        
        # Check if already checked in today
        today = date.today()
        existing = AttendanceRecord.query.filter_by(
            employee_id=employee_id,
            date=today
        ).first()
        
        if existing and existing.check_in_time:
            raise ConflictError('Employee already checked in today')
        
        # Create or update attendance record
        if existing:
            attendance = existing
            attendance.check_in_time = datetime.utcnow()
        else:
            attendance = AttendanceRecord(
                employee_id=employee_id,
                organization_id=employee.organization_id,
                date=today,
                check_in_time=datetime.utcnow(),
                status='present'
            )
            db.session.add(attendance)
        
        # Update optional fields
        if data.get('camera_id'):
            attendance.camera_id = data['camera_id']
        if data.get('location'):
            attendance.location_check_in = data['location']
        if data.get('device_info'):
            attendance.device_info = data['device_info']
        if data.get('face_match_confidence'):
            attendance.face_match_confidence = data['face_match_confidence']
        if data.get('liveness_verified'):
            attendance.liveness_verified = data['liveness_verified']
        
        db.session.commit()
        
        return attendance
    
    @staticmethod
    def check_out(data, current_user):
        """Check-out an employee"""
        employee_id = data['employee_id']
        employee = Employee.query.filter_by(id=employee_id, deleted_at=None).first()
        
        if not employee:
            raise NotFoundError('Employee')
        
        # Find today's attendance record
        today = date.today()
        attendance = AttendanceRecord.query.filter_by(
            employee_id=employee_id,
            date=today
        ).first()
        
        if not attendance:
            raise BadRequestError('No check-in record found for today')
        
        if not attendance.check_in_time:
            raise BadRequestError('Employee has not checked in today')
        
        if attendance.check_out_time:
            raise ConflictError('Employee already checked out today')
        
        # Update check-out time
        attendance.check_out_time = datetime.utcnow()
        
        # Calculate work hours
        time_diff = attendance.check_out_time - attendance.check_in_time
        attendance.work_hours = round(time_diff.total_seconds() / 3600, 2)
        
        # Update optional fields
        if data.get('camera_id'):
            attendance.camera_id = data['camera_id']
        if data.get('location'):
            attendance.location_check_out = data['location']
        if data.get('device_info') and not attendance.device_info:
            attendance.device_info = data['device_info']
        
        db.session.commit()
        
        return attendance
    
    @staticmethod
    def get_attendance(attendance_id):
        """Get attendance record by ID"""
        attendance = AttendanceRecord.query.filter_by(id=attendance_id).first()
        
        if not attendance:
            raise NotFoundError('Attendance record')
        
        return attendance
    
    @staticmethod
    def list_attendance(filters, organization_id=None):
        """List attendance records with filters and pagination"""
        query = AttendanceRecord.query
        
        # Apply tenant isolation
        if organization_id:
            query = query.filter_by(organization_id=organization_id)
        
        # Apply filters
        if filters.get('organization_id'):
            query = query.filter_by(organization_id=filters['organization_id'])
        
        if filters.get('employee_id'):
            query = query.filter_by(employee_id=filters['employee_id'])
        
        if filters.get('department_id'):
            # Join with Employee to filter by department
            query = query.join(Employee).filter(Employee.department_id == filters['department_id'])
        
        if filters.get('start_date'):
            query = query.filter(AttendanceRecord.date >= filters['start_date'])
        
        if filters.get('end_date'):
            query = query.filter(AttendanceRecord.date <= filters['end_date'])
        
        if filters.get('status'):
            query = query.filter_by(status=filters['status'])
        
        if filters.get('review_status'):
            query = query.filter_by(review_status=filters['review_status'])
        
        if filters.get('search'):
            # Search by employee name or code
            search = f"%{filters['search']}%"
            query = query.join(Employee).filter(
                or_(
                    Employee.full_name.ilike(search),
                    Employee.employee_code.ilike(search)
                )
            )
        
        # Order by date desc
        query = query.order_by(AttendanceRecord.date.desc())
        
        return query
    
    @staticmethod
    def update_attendance(attendance_id, data):
        """Update an attendance record"""
        attendance = AttendanceService.get_attendance(attendance_id)
        
        # Update fields
        for key, value in data.items():
            setattr(attendance, key, value)
        
        # Recalculate work hours if check-in or check-out time changed
        if attendance.check_in_time and attendance.check_out_time:
            time_diff = attendance.check_out_time - attendance.check_in_time
            attendance.work_hours = round(time_diff.total_seconds() / 3600, 2)
        
        attendance.updated_at = datetime.utcnow()
        db.session.commit()
        
        return attendance
    
    @staticmethod
    def delete_attendance(attendance_id):
        """Delete an attendance record"""
        attendance = AttendanceService.get_attendance(attendance_id)
        
        # Hard delete (attendance records don't have soft delete)
        db.session.delete(attendance)
        db.session.commit()
        
        return True
    
    @staticmethod
    def approve_attendance(attendance_id, data, current_user):
        """Approve or reject an attendance record"""
        attendance = AttendanceService.get_attendance(attendance_id)
        
        attendance.review_status = data['review_status']
        
        if data.get('notes'):
            attendance.notes = data['notes']
        
        attendance.approved_by = current_user.get('id')
        attendance.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return attendance
