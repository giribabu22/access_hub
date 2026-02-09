"""
Organizations API routes (v2).
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ...utils.helpers import (
    success_response,
    error_response,
    paginate,
    validate_request,
    validate_query,
    get_current_user
)
from ...utils.exceptions import NotFoundError, ForbiddenError
from ...schemas.organization import (
    OrganizationSchema,
    OrganizationCreateSchema,
    OrganizationUpdateSchema,
    OrganizationListSchema
)
from ...services.organization_service import OrganizationService
from ...middlewares.rbac_middleware import require_permission

bp = Blueprint('organizations_api', __name__, url_prefix='/api/v2/organizations')


@bp.route('', methods=['POST'])
@jwt_required()
@require_permission('organizations:create')
@validate_request(OrganizationCreateSchema)
def create_organization():
    """
    Create a new organization
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - code
          properties:
            name:
              type: string
              example: "Acme Corporation"
            code:
              type: string
              example: "ACME001"
            address:
              type: string
              example: "123 Main St, City, Country"
            contact_email:
              type: string
              example: "contact@acme.com"
            contact_phone:
              type: string
              example: "+1234567890"
            organization_type:
              type: string
              enum: [school, office, apartment, home, hospital, retail, warehouse, factory, hotel, restaurant, gym, other]
              example: "office"
            timezone:
              type: string
              example: "Asia/Kolkata"
            working_hours:
              type: object
              example: {"start": "09:00", "end": "18:00", "days": [1,2,3,4,5]}
    responses:
      201:
        description: Organization created successfully
        schema:
          $ref: '#/definitions/Success'
      400:
        $ref: '#/responses/BadRequestError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
      409:
        description: Organization with this code/name already exists
    """
    data = request.validated_data
    organization = OrganizationService.create_organization(data)
    
    schema = OrganizationSchema()
    return success_response(
        data=schema.dump(organization),
        message='Organization created successfully',
        status_code=201
    )


@bp.route('', methods=['GET'])
@jwt_required()
@require_permission('organizations:read')
@validate_query(OrganizationListSchema)
def list_organizations():
    """
    List all organizations with pagination and filters
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
        description: Page number
      - name: per_page
        in: query
        type: integer
        default: 20
        description: Items per page
      - name: search
        in: query
        type: string
        description: Search by name or code
      - name: organization_type
        in: query
        type: string
        enum: [school, office, apartment, home, hospital, retail, warehouse, factory, hotel, restaurant, gym, other]
        description: Filter by organization type
      - name: is_active
        in: query
        type: boolean
        description: Filter by active status
    responses:
      200:
        description: List of organizations
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Success"
            data:
              type: object
              properties:
                items:
                  type: array
                  items:
                    type: object
                pagination:
                  type: object
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    filters = request.validated_query
    page = filters.pop('page', 1)
    per_page = filters.pop('per_page', 20)
    
    query = OrganizationService.list_organizations(filters)
    result = paginate(query, page, per_page, OrganizationSchema)
    
    return success_response(data=result)


@bp.route('/<string:org_id>', methods=['GET'])
@jwt_required()
@require_permission('organizations:read')
def get_organization(org_id):
    """
    Get organization by ID
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
    responses:
      200:
        description: Organization details
        schema:
          $ref: '#/definitions/Success'
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    # Return organization details along with relation counts
    stats = OrganizationService.get_organization_stats(org_id)
    return success_response(data=stats)


@bp.route('/<string:org_id>', methods=['PUT'])
@jwt_required()
@require_permission('organizations:update')
@validate_request(OrganizationUpdateSchema)
def update_organization(org_id):
    """
    Update an organization
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
      - in: body
        name: body
        schema:
          type: object
          properties:
            name:
              type: string
            address:
              type: string
            contact_email:
              type: string
            contact_phone:
              type: string
            organization_type:
              type: string
              enum: [school, office, apartment, home, hospital, retail, warehouse, factory, hotel, restaurant, gym, other]
            timezone:
              type: string
            working_hours:
              type: object
            settings:
              type: object
            is_active:
              type: boolean
    responses:
      200:
        description: Organization updated successfully
        schema:
          $ref: '#/definitions/Success'
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    data = request.validated_data
    organization = OrganizationService.update_organization(org_id, data)
    
    schema = OrganizationSchema()
    return success_response(
        data=schema.dump(organization),
        message='Organization updated successfully'
    )


@bp.route('/<string:org_id>', methods=['DELETE'])
@jwt_required()
@require_permission('organizations:delete')
def delete_organization(org_id):
    """
    Delete an organization (soft delete)
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
      - name: hard_delete
        in: query
        type: boolean
        default: false
        description: Perform hard delete instead of soft delete
    responses:
      200:
        description: Organization deleted successfully
        schema:
          $ref: '#/definitions/Success'
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    hard_delete = request.args.get('hard_delete', 'false').lower() == 'true'
    OrganizationService.delete_organization(org_id, soft_delete=not hard_delete)
    
    return success_response(message='Organization deleted successfully')


@bp.route('/<string:org_id>/stats', methods=['GET'])
@jwt_required()
@require_permission('organizations:read')
def get_organization_stats(org_id):
    """
    Get organization statistics
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
    responses:
      200:
        description: Organization statistics
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
              properties:
                organization:
                  type: object
                departments_count:
                  type: integer
                employees_count:
                  type: integer
                locations_count:
                  type: integer
                cameras_count:
                  type: integer
                shifts_count:
                  type: integer
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    stats = OrganizationService.get_organization_stats(org_id)
    return success_response(data=stats)


@bp.route('/<string:org_id>/employees/attendance-summary', methods=['GET'])
@jwt_required()
@require_permission('employees:read')
def get_employees_attendance_summary(org_id):
    """
    Get attendance summary for all employees in an organization
    ---
    tags:
      - Organizations
      - Employees
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
      - name: per_page
        in: query
        type: integer
        default: 50
        description: Number of records per page
      - name: page
        in: query
        type: integer
        default: 1
        description: Page number
      - name: month
        in: query
        type: string
        format: date
        description: Filter by month (YYYY-MM format)
    responses:
      200:
        description: Attendance summary for employees
        schema:
          type: object
          properties:
            success:
              type: boolean
            data:
              type: object
              properties:
                items:
                  type: array
                  items:
                    type: object
                    properties:
                      employee_id:
                        type: string
                      full_name:
                        type: string
                      employee_code:
                        type: string
                      department:
                        type: string
                      present_days:
                        type: integer
                      absent_days:
                        type: integer
                      leave_count:
                        type: integer
                      avg_hours_per_day:
                        type: number
                      attendance_percentage:
                        type: number
                pagination:
                  type: object
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    from ...services.attendance_service import AttendanceService
    from datetime import datetime, timedelta
    from ...models import Employee, AttendanceRecord, Department
    from sqlalchemy import func
    from ...extensions import db
    
    try:
        per_page = request.args.get('per_page', 50, type=int)
        page = request.args.get('page', 1, type=int)
        month = request.args.get('month')  # YYYY-MM format
        
        # Calculate date range
        if month:
            try:
                month_date = datetime.strptime(month, '%Y-%m')
                start_date = month_date.date()
                # Get last day of month
                if month_date.month == 12:
                    end_date = datetime(month_date.year + 1, 1, 1).date() - timedelta(days=1)
                else:
                    end_date = datetime(month_date.year, month_date.month + 1, 1).date() - timedelta(days=1)
            except ValueError:
                start_date = datetime.utcnow().date().replace(day=1)
                end_date = datetime.utcnow().date()
        else:
            # Default to current month
            today = datetime.utcnow().date()
            start_date = today.replace(day=1)
            end_date = today
        
        # Get all active employees in organization
        employees_query = db.session.query(Employee).filter(
            Employee.organization_id == org_id,
            Employee.is_active.is_(True),
            Employee.deleted_at.is_(None)
        )
        
        total = employees_query.count()
        employees = employees_query.offset((page - 1) * per_page).limit(per_page).all()
        
        # Build attendance data for each employee
        items = []
        for emp in employees:
            # Get attendance records for date range
            attendance_recs = db.session.query(AttendanceRecord).filter(
                AttendanceRecord.employee_id == emp.id,
                AttendanceRecord.date >= start_date,
                AttendanceRecord.date <= end_date
            ).all()
            
            present_days = len(attendance_recs)
            total_days = (end_date - start_date).days + 1
            absent_days = max(0, total_days - present_days)
            
            # Calculate average hours
            avg_hours = 0.0
            if attendance_recs:
                hours_list = [float(r.work_hours or 0) for r in attendance_recs]
                avg_hours = sum(hours_list) / len(hours_list)
            
            attendance_pct = round((present_days / total_days * 100), 1) if total_days > 0 else 0
            
            # Get department name
            department = ''
            if emp.department_id:
                dept = db.session.query(Department).filter_by(id=emp.department_id).first()
                department = dept.name if dept else ''
            
            items.append({
                'employee_id': emp.id,
                'full_name': emp.full_name,
                'employee_code': emp.employee_code,
                'department': department,
                'present_days': present_days,
                'absent_days': absent_days,
                'leave_count': 0,  # TODO: Calculate from leave requests
                'avg_hours_per_day': round(avg_hours, 1),
                'attendance_percentage': attendance_pct
            })
        
        pagination = {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page
        }
        
        return success_response(
            data={
                'items': items,
                'pagination': pagination,
                'month': start_date.strftime('%Y-%m')
            },
            message='Attendance summary retrieved successfully'
        )
    
    except Exception as e:
        import traceback
        print(f"[get_employees_attendance_summary] Error: {e}")
        print(f"[get_employees_attendance_summary] Traceback: {traceback.format_exc()}")
        return error_response(f'Failed to retrieve attendance summary: {str(e)}', 500)


@bp.route('/<string:org_id>/employees/top-performers', methods=['GET'])
@jwt_required()
@require_permission('employees:read')
def get_top_performers(org_id):
    """
    Get top performers - employees with perfect attendance and minimal leaves
    ---
    tags:
      - Organizations
      - Employees
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
      - name: month
        in: query
        type: string
        format: date
        description: Filter by month (YYYY-MM format)
      - name: limit
        in: query
        type: integer
        default: 10
        description: Number of top performers to return
    responses:
      200:
        description: Top performers list
    """
    from datetime import datetime, timedelta
    from ...models import Employee, AttendanceRecord, LeaveRequest, Department
    from ...extensions import db
    
    try:
        month = request.args.get('month')
        limit = request.args.get('limit', 10, type=int)
        
        # Calculate date range
        if month:
            try:
                month_date = datetime.strptime(month, '%Y-%m')
                start_date = month_date.date()
                # Get last day of month
                if month_date.month == 12:
                    end_date = datetime(month_date.year + 1, 1, 1).date() - timedelta(days=1)
                else:
                    end_date = datetime(month_date.year, month_date.month + 1, 1).date() - timedelta(days=1)
            except ValueError:
                start_date = datetime.utcnow().date().replace(day=1)
                end_date = datetime.utcnow().date()
        else:
            # Default to current month
            today = datetime.utcnow().date()
            start_date = today.replace(day=1)
            end_date = today
        
        # Get all active employees in organization
        employees = db.session.query(Employee).filter(
            Employee.organization_id == org_id,
            Employee.is_active.is_(True),
            Employee.deleted_at.is_(None)
        ).all()
        
        punctual_employees = []
        low_leave_employees = []
        
        for emp in employees:
            # Get attendance records for date range
            attendance_recs = db.session.query(AttendanceRecord).filter(
                AttendanceRecord.employee_id == emp.id,
                AttendanceRecord.date >= start_date,
                AttendanceRecord.date <= end_date
            ).all()
            
            # Count late arrivals (check-in after 9:15 AM)
            late_count = 0
            present_days = 0
            for rec in attendance_recs:
                if rec.check_in_time:
                    present_days += 1
                    check_in = rec.check_in_time
                    # Check if late (after 9:15 AM)
                    if check_in.hour > 9 or (check_in.hour == 9 and check_in.minute > 15):
                        late_count += 1
            
            # Get leave requests
            leave_reqs = db.session.query(LeaveRequest).filter(
                LeaveRequest.employee_id == emp.id,
                LeaveRequest.organization_id == org_id,
                LeaveRequest.status == 'approved',
                LeaveRequest.start_date <= end_date,
                LeaveRequest.end_date >= start_date
            ).all()
            
            # Calculate leave days in this period
            total_leave_days = 0.0
            leave_types_count = {}
            for leave_req in leave_reqs:
                # Calculate overlap with month
                overlap_start = max(leave_req.start_date, start_date)
                overlap_end = min(leave_req.end_date, end_date)
                if overlap_start <= overlap_end:
                    days = (overlap_end - overlap_start).days + 1
                    total_leave_days += leave_req.total_days if leave_req.total_days else days
                    leave_types_count[leave_req.leave_type] = leave_types_count.get(leave_req.leave_type, 0) + (leave_req.total_days if leave_req.total_days else days)
            
            total_days = (end_date - start_date).days + 1
            attendance_pct = round((present_days / total_days * 100), 1) if total_days > 0 else 0
            
            # Get department name
            department = ''
            if emp.department_id:
                dept = db.session.query(Department).filter_by(id=emp.department_id).first()
                department = dept.name if dept else ''
            
            # Get user email
            email = ''
            if emp.user:
                email = emp.user.email or ''
            
            employee_data = {
                'employee_id': emp.id,
                'full_name': emp.full_name,
                'employee_code': emp.employee_code,
                'department': department,
                'email': email,
                'joining_date': emp.joining_date.isoformat() if emp.joining_date else None,
            }
            
            # Punctual employees: Present entire month with 0 or minimal late arrivals
            if present_days >= (total_days - 1) and late_count == 0:  # Allow 1 day absence
                punctual_employees.append({
                    **employee_data,
                    'present_days': present_days,
                    'late_arrivals': late_count,
                    'attendance_percentage': attendance_pct,
                    'score': present_days - late_count  # Score for sorting
                })
            
            # Low leave employees: Took minimal leave
            if total_leave_days <= 2:  # 2 days or less
                low_leave_employees.append({
                    **employee_data,
                    'leave_days': total_leave_days,
                    'leave_types': leave_types_count,
                    'score': -total_leave_days  # Negative for ascending sort
                })
        
        # Sort and limit
        punctual_employees = sorted(punctual_employees, key=lambda x: x['score'], reverse=True)[:limit]
        low_leave_employees = sorted(low_leave_employees, key=lambda x: x['score'], reverse=True)[:limit]
        
        # Remove score field from response
        for emp in punctual_employees:
            del emp['score']
        for emp in low_leave_employees:
            del emp['score']
        
        return success_response(
            data={
                'punctual_employees': punctual_employees,
                'low_leave_employees': low_leave_employees,
                'month': start_date.strftime('%Y-%m'),
                'total_employees': len(employees)
            },
            message='Top performers retrieved successfully'
        )
    
    except Exception as e:
        import traceback
        print(f"[get_top_performers] Error: {e}")
        print(f"[get_top_performers] Traceback: {traceback.format_exc()}")
        return error_response(f'Failed to retrieve top performers: {str(e)}', 500)