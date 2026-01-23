"""
Manager-specific API Routes
"""

from flask import Blueprint, request, jsonify, current_app, g
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
import traceback

from app.models.user import User
from app.models.employee import Employee
from app.models.department import Department
from app.models.organization import Organization
from app.models.attendance import AttendanceRecord
from app.models.leave_request import LeaveRequest
from app.models.camera import Camera
from app.models.location import Location
from app.utils.decorators import manager_required, team_access_required, tenant_required
from flask_jwt_extended import jwt_required

bp = Blueprint('manager', __name__)

@bp.route('/api/manager/team/members', methods=['GET'])
@jwt_required()
@tenant_required
@manager_required
def get_team_members():
    """
    Get team members under the manager's supervision
    """
    try:
        manager_id = g.current_user.id
        organization_id = g.organization_id
        manager_department_id = g.jwt_claims.get('department_id')
        
        # Get employees in the manager's organization and department
        employees_query = Employee.query.filter_by(
            organization_id=organization_id,
            is_active=True
        ).join(User).filter(User.is_active == True)
        
        # If manager has department context, filter by department
        if manager_department_id:
            employees_query = employees_query.filter(Employee.department_id == manager_department_id)
        
        employees = employees_query.all()
        
        team_members = []
        for employee in employees:
            # Skip the manager themselves
            if employee.user_id == manager_id:
                continue
                
            team_members.append({
                'id': employee.id,
                'user_id': employee.user_id,
                'employee_id': employee.employee_id,
                'name': f"{employee.user.first_name} {employee.user.last_name}",
                'email': employee.user.email,
                'role': employee.user.role.name if employee.user.role else None,
                'position': employee.position,
                'phone': employee.phone,
                'hire_date': employee.hire_date.isoformat() if employee.hire_date else None,
                'status': 'active' if employee.is_active else 'inactive',
                'profile_image': employee.profile_image_url
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'team_members': team_members,
                'total_count': len(team_members)
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching team members: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch team members'
        }), 500

@bp.route('/api/manager/team/stats', methods=['GET'])
@jwt_required()
@tenant_required
@manager_required
def get_team_stats():
    """
    Get team statistics for the manager's dashboard
    """
    try:
        organization_id = g.organization_id
        manager_department_id = g.jwt_claims.get('department_id')
        
        # Get current date range
        today = datetime.utcnow().date()
        start_of_month = today.replace(day=1)
        
        # Count total team members in organization
        team_query = Employee.query.filter_by(
            organization_id=organization_id,
            is_active=True
        ).join(User).filter(User.is_active == True)
        
        # If manager has department context, filter by department
        if manager_department_id:
            team_query = team_query.filter(Employee.department_id == manager_department_id)
        
        total_members = team_query.count()
        
        # Get attendance stats for this month
        attendance_query = AttendanceRecord.query.join(Employee).filter(
            Employee.organization_id == organization_id,
            AttendanceRecord.check_in_time >= start_of_month
        )
        
        # If manager has department context, filter by department
        if manager_department_id:
            attendance_query = attendance_query.filter(Employee.department_id == manager_department_id)
            
        attendance_records = attendance_query.all()
        
        present_today = len([a for a in attendance_records if a.check_in_time.date() == today])
        
        # Get pending leave requests
        leaves_query = LeaveRequest.query.join(Employee).filter(
            Employee.organization_id == organization_id,
            LeaveRequest.status == 'pending'
        )
        
        # If manager has department context, filter by department
        if manager_department_id:
            leaves_query = leaves_query.filter(Employee.department_id == manager_department_id)
            
        pending_leaves = leaves_query.count()
        
        # Calculate average attendance
        working_days = (today - start_of_month).days + 1
        expected_attendance = total_members * working_days
        actual_attendance = len(attendance_records)
        attendance_percentage = (actual_attendance / expected_attendance * 100) if expected_attendance > 0 else 0
        
        return jsonify({
            'status': 'success',
            'data': {
                'total_members': total_members,
                'present_today': present_today,
                'pending_leaves': pending_leaves,
                'attendance_percentage': round(attendance_percentage, 1)
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching team stats: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch team statistics'
        }), 500

@bp.route('/api/manager/leaves/pending', methods=['GET'])
@jwt_required()
@tenant_required
@manager_required
def get_pending_leave_requests():
    """
    Get pending leave requests for approval
    """
    try:
        organization_id = g.organization_id
        manager_department_id = g.jwt_claims.get('department_id')
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        status_filter = request.args.get('status', 'pending')
        
        # Build query with organization filtering
        leaves_query = LeaveRequest.query.join(Employee).filter(
            Employee.organization_id == organization_id
        )
        
        # If manager has department context, filter by department
        if manager_department_id:
            leaves_query = leaves_query.filter(Employee.department_id == manager_department_id)
        
        if status_filter != 'all':
            leaves_query = leaves_query.filter(LeaveRequest.status == status_filter)
        
        leaves = leaves_query.order_by(LeaveRequest.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        leave_requests = []
        for leave in leaves.items:
            leave_requests.append({
                'id': leave.id,
                'employee_name': f"{leave.employee.user.first_name} {leave.employee.user.last_name}",
                'employee_id': leave.employee.employee_id,
                'leave_type': leave.leave_type,
                'start_date': leave.start_date.isoformat(),
                'end_date': leave.end_date.isoformat(),
                'total_days': leave.total_days,
                'reason': leave.reason,
                'status': leave.status,
                'created_at': leave.created_at.isoformat(),
                'approval_notes': leave.approval_notes
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'leave_requests': leave_requests,
                'pagination': {
                    'page': leaves.page,
                    'pages': leaves.pages,
                    'per_page': leaves.per_page,
                    'total': leaves.total,
                    'has_next': leaves.has_next,
                    'has_prev': leaves.has_prev
                }
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching leave requests: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch leave requests'
        }), 500

@bp.route('/api/manager/leaves/<int:leave_id>/approve', methods=['POST'])
@jwt_required()
@tenant_required
@manager_required
def approve_leave_request(leave_id):
    """
    Approve a leave request
    """
    try:
        organization_id = g.organization_id
        manager_department_id = g.jwt_claims.get('department_id')
        
        # Get leave request and verify it belongs to manager's organization
        leave_query = LeaveRequest.query.join(Employee).filter(
            LeaveRequest.id == leave_id,
            Employee.organization_id == organization_id
        )
        
        # If manager has department context, also filter by department
        if manager_department_id:
            leave_query = leave_query.filter(Employee.department_id == manager_department_id)
            
        leave = leave_query.first()
        
        if not leave:
            return jsonify({
                'status': 'error',
                'message': 'Leave request not found or access denied'
            }), 404
        
        if leave.status != 'pending':
            return jsonify({
                'status': 'error',
                'message': 'Leave request is not pending approval'
            }), 400
        
        # Get manager comments if provided
        data = request.get_json() or {}
        manager_comments = data.get('comments', '')
        
        # Approve the leave
        leave.status = 'approved'
        leave.approved_by = g.current_user.id
        leave.approval_notes = manager_comments
        
        from app import db
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Leave request approved successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error approving leave request: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to approve leave request'
        }), 500

@bp.route('/api/manager/leaves/<int:leave_id>/reject', methods=['POST'])
@jwt_required()
@tenant_required
@manager_required
def reject_leave_request(leave_id):
    """
    Reject a leave request
    """
    try:
        organization_id = g.organization_id
        manager_department_id = g.jwt_claims.get('department_id')
        
        # Get leave request and verify it belongs to manager's organization
        leave_query = LeaveRequest.query.join(Employee).filter(
            LeaveRequest.id == leave_id,
            Employee.organization_id == organization_id
        )
        
        # If manager has department context, also filter by department
        if manager_department_id:
            leave_query = leave_query.filter(Employee.department_id == manager_department_id)
            
        leave = leave_query.first()
        
        if not leave:
            return jsonify({
                'status': 'error',
                'message': 'Leave request not found or access denied'
            }), 404
        
        if leave.status != 'pending':
            return jsonify({
                'status': 'error',
                'message': 'Leave request is not pending approval'
            }), 400
        
        # Get manager comments (required for rejection)
        data = request.get_json() or {}
        manager_comments = data.get('comments', '')
        
        if not manager_comments:
            return jsonify({
                'status': 'error',
                'message': 'Comments are required for rejecting leave requests'
            }), 400
        
        # Reject the leave
        leave.status = 'rejected'
        leave.approved_by = g.current_user.id
        leave.approval_notes = manager_comments
        
        from app import db
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Leave request rejected successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error rejecting leave request: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to reject leave request'
        }), 500

@bp.route('/api/manager/reports/attendance', methods=['GET'])
@jwt_required()
@tenant_required
@manager_required
def get_attendance_report():
    """
    Get attendance report for team members
    """
    try:
        organization_id = g.organization_id
        manager_department_id = g.jwt_claims.get('department_id')
        
        # Get date range parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = datetime.utcnow().date().replace(day=1)  # Start of current month
        
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = datetime.utcnow().date()
        
        # Get team employees with organization filtering
        employees_query = Employee.query.filter_by(
            organization_id=organization_id,
            is_active=True
        ).join(User).filter(User.is_active == True)
        
        # If manager has department context, filter by department
        if manager_department_id:
            employees_query = employees_query.filter(Employee.department_id == manager_department_id)
            
        employees = employees_query.all()
        
        # Get attendance records with organization filtering
        attendance_query = AttendanceRecord.query.join(Employee).filter(
            Employee.organization_id == organization_id,
            AttendanceRecord.check_in_time >= start_date,
            AttendanceRecord.check_in_time <= end_date
        )
        
        # If manager has department context, filter by department
        if manager_department_id:
            attendance_query = attendance_query.filter(Employee.department_id == manager_department_id)
            
        attendance_records = attendance_query.all()
        
        # Process attendance data
        employee_stats = {}
        for employee in employees:
            employee_stats[employee.id] = {
                'employee_id': employee.employee_id,
                'name': f"{employee.user.first_name} {employee.user.last_name}",
                'present_days': 0,
                'total_working_days': (end_date - start_date).days + 1,
                'attendance_percentage': 0
            }
        
        for record in attendance_records:
            if record.employee_id in employee_stats:
                employee_stats[record.employee_id]['present_days'] += 1
        
        # Calculate percentages
        for emp_id, stats in employee_stats.items():
            if stats['total_working_days'] > 0:
                stats['attendance_percentage'] = round(
                    (stats['present_days'] / stats['total_working_days']) * 100, 2
                )
        
        report_data = {
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_employees': len(employees),
                'total_attendance_records': len(attendance_records),
                'average_attendance': round(
                    sum(stats['attendance_percentage'] for stats in employee_stats.values()) / len(employee_stats)
                    if employee_stats else 0, 2
                )
            },
            'employee_stats': list(employee_stats.values())
        }
        
        return jsonify({
            'status': 'success',
            'data': report_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error generating attendance report: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to generate attendance report'
        }), 500

@bp.route('/api/manager/reports/leaves', methods=['GET'])
@jwt_required()
@tenant_required
@manager_required
def get_leaves_report():
    """
    Get leaves report for team members
    """
    try:
        organization_id = g.organization_id
        manager_department_id = g.jwt_claims.get('department_id')
        
        # Get date range parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = datetime.utcnow().date().replace(day=1)  # Start of current month
        
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = datetime.utcnow().date()
        
        # Get leave records with organization filtering
        leaves_query = LeaveRequest.query.join(Employee).filter(
            Employee.organization_id == organization_id,
            LeaveRequest.created_at >= start_date,
            LeaveRequest.created_at <= end_date
        )
        
        # If manager has department context, filter by department
        if manager_department_id:
            leaves_query = leaves_query.filter(Employee.department_id == manager_department_id)
            
        leaves = leaves_query.all()
        
        # Process leave data
        leave_stats = {
            'pending': 0,
            'approved': 0,
            'rejected': 0,
            'total_days': 0
        }
        
        leave_types = {}
        
        for leave in leaves:
            leave_stats[leave.status] += 1
            if leave.status == 'approved':
                leave_stats['total_days'] += leave.total_days
            
            if leave.leave_type in leave_types:
                leave_types[leave.leave_type]['count'] += 1
                if leave.status == 'approved':
                    leave_types[leave.leave_type]['days'] += leave.total_days
            else:
                leave_types[leave.leave_type] = {
                    'count': 1,
                    'days': leave.total_days if leave.status == 'approved' else 0
                }
        
        report_data = {
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': leave_stats,
            'leave_types': leave_types
        }
        
        return jsonify({
            'status': 'success',
            'data': report_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error generating leaves report: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to generate leaves report'
        }), 500


@bp.route('/api/manager/cameras', methods=['GET'])
@jwt_required()
@tenant_required
@manager_required
def get_manager_cameras():
    """
    Get cameras for the manager's organization
    """
    try:
        organization_id = g.organization_id
        
        # Get cameras for the organization
        cameras = Camera.query.filter_by(
            organization_id=organization_id,
            is_active=True
        ).all()
        
        cameras_data = []
        for camera in cameras:
            cameras_data.append({
                'id': camera.id,
                'name': camera.name,
                'location': camera.location.name if camera.location else 'Unknown',
                'location_id': camera.location_id,
                'camera_type': camera.camera_type,
                'status': 'active' if camera.is_active else 'inactive',
                'rtsp_url': camera.rtsp_url if hasattr(camera, 'rtsp_url') else None,
                'ip_address': camera.ip_address if hasattr(camera, 'ip_address') else None,
                'created_at': camera.created_at.isoformat() if camera.created_at else None
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'cameras': cameras_data,
                'total_count': len(cameras_data)
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching cameras: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch cameras'
        }), 500


@bp.route('/api/manager/locations', methods=['GET'])
@jwt_required()
@tenant_required
@manager_required
def get_manager_locations():
    """
    Get locations for the manager's organization
    """
    try:
        organization_id = g.organization_id
        
        # Get locations for the organization
        locations = Location.query.filter_by(
            organization_id=organization_id,
            is_active=True
        ).all()
        
        locations_data = []
        for location in locations:
            # Count cameras at this location
            camera_count = Camera.query.filter_by(
                location_id=location.id,
                is_active=True
            ).count()
            
            locations_data.append({
                'id': location.id,
                'name': location.name,
                'description': location.description,
                'floor_number': getattr(location, 'floor_number', None),
                'building': getattr(location, 'building', None),
                'camera_count': camera_count,
                'status': 'active' if location.is_active else 'inactive',
                'created_at': location.created_at.isoformat() if location.created_at else None
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'locations': locations_data,
                'total_count': len(locations_data)
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching locations: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch locations'
        }), 500