from marshmallow import Schema, fields, validate
from .employee import EmployeeSchema

class AttendanceRecordSchema(Schema):
    """Schema for Attendance Record"""
    id = fields.String(dump_only=True)
    employee_id = fields.String(required=True)
    organization_id = fields.String(dump_only=True)
    camera_id = fields.String(allow_none=True)
    date = fields.Date(required=True)
    check_in_time = fields.DateTime(allow_none=True)
    check_out_time = fields.DateTime(allow_none=True)
    status = fields.String(validate=validate.OneOf(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday']))
    work_hours = fields.Float()
    location_check_in = fields.Raw(allow_none=True)
    location_check_out = fields.Raw(allow_none=True)
    device_info = fields.Raw(allow_none=True)
    face_match_confidence = fields.Float(allow_none=True)
    liveness_verified = fields.Boolean()
    review_status = fields.String()
    notes = fields.String(allow_none=True)
    approved_by = fields.String(allow_none=True)
    
    # Nested objects (dump_only)
    employee = fields.Nested('EmployeeSchema', only=('id', 'employee_code', 'full_name', 'designation'), dump_only=True)


class AttendanceCheckInSchema(Schema):
    """Schema for attendance check-in"""
    employee_id = fields.String(required=True)
    camera_id = fields.String(allow_none=True)
    location = fields.Dict(allow_none=True)
    device_info = fields.Dict(allow_none=True)
    face_match_confidence = fields.Float(allow_none=True)
    liveness_verified = fields.Boolean(load_default=False)


class AttendanceCheckOutSchema(Schema):
    """Schema for attendance check-out"""
    employee_id = fields.String(required=True)
    camera_id = fields.String(allow_none=True)
    location = fields.Dict(allow_none=True)
    device_info = fields.Dict(allow_none=True)


class AttendanceUpdateSchema(Schema):
    """Schema for updating attendance record"""
    check_in_time = fields.DateTime(allow_none=True)
    check_out_time = fields.DateTime(allow_none=True)
    status = fields.String(
        validate=validate.OneOf(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'])
    )
    notes = fields.String(allow_none=True)
    review_status = fields.String(
        validate=validate.OneOf(['auto_approved', 'pending', 'approved', 'rejected'])
    )


class AttendanceListSchema(Schema):
    """Schema for listing attendance records with filters"""
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=1000))
    search = fields.String(load_default=None)
    organization_id = fields.String(load_default=None)
    employee_id = fields.String(load_default=None)
    department_id = fields.String(load_default=None)
    start_date = fields.Date(load_default=None)
    end_date = fields.Date(load_default=None)
    status = fields.String(
        load_default=None,
        validate=validate.OneOf(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'])
    )
    review_status = fields.String(
        load_default=None,
        validate=validate.OneOf(['auto_approved', 'pending', 'approved', 'rejected'])
    )


class AttendanceApprovalSchema(Schema):
    """Schema for approving/rejecting attendance"""
    review_status = fields.String(
        required=True,
        validate=validate.OneOf(['approved', 'rejected'])
    )
    notes = fields.String(allow_none=True)


# Alias for backward compatibility or alternative naming usage
AttendanceSchema = AttendanceRecordSchema
