"""
Attendance schemas for request/response validation.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
from . import TimestampMixin


class AttendanceRecordSchema(Schema, TimestampMixin):
    """Complete attendance record schema"""
    id = fields.String(dump_only=True)
    employee_id = fields.String(required=True)
    organization_id = fields.String(required=True)
    camera_id = fields.String(allow_none=True)
    date = fields.Date(required=True)
    check_in_time = fields.DateTime(allow_none=True)
    check_out_time = fields.DateTime(allow_none=True)
    status = fields.String(
        load_default='present',
        validate=validate.OneOf(['present', 'absent', 'half_day', 'on_leave', 'holiday'])
    )
    work_hours = fields.Float(dump_only=True)
    location_check_in = fields.Dict(allow_none=True)
    location_check_out = fields.Dict(allow_none=True)
    device_info = fields.Dict(allow_none=True)
    face_match_confidence = fields.Float(allow_none=True)
    liveness_verified = fields.Boolean(load_default=False)
    review_status = fields.String(
        load_default='auto_approved',
        validate=validate.OneOf(['auto_approved', 'pending', 'approved', 'rejected'])
    )
    notes = fields.String(allow_none=True)
    approved_by = fields.String(allow_none=True)
    
    # Nested employee (dump_only)
    employee = fields.Dict(dump_only=True)


class AttendanceCheckInSchema(Schema):
    """Schema for check-in"""
    employee_id = fields.String(required=True)
    camera_id = fields.String(allow_none=True)
    location = fields.Dict(allow_none=True)
    device_info = fields.Dict(allow_none=True)
    face_match_confidence = fields.Float(allow_none=True)
    liveness_verified = fields.Boolean(load_default=False)


class AttendanceCheckOutSchema(Schema):
    """Schema for check-out"""
    employee_id = fields.String(required=True)
    camera_id = fields.String(allow_none=True)
    location = fields.Dict(allow_none=True)
    device_info = fields.Dict(allow_none=True)


class AttendanceUpdateSchema(Schema):
    """Schema for updating attendance record"""
    check_in_time = fields.DateTime()
    check_out_time = fields.DateTime()
    status = fields.String(
        validate=validate.OneOf(['present', 'absent', 'half_day', 'on_leave', 'holiday'])
    )
    notes = fields.String(allow_none=True)
    review_status = fields.String(
        validate=validate.OneOf(['auto_approved', 'pending', 'approved', 'rejected'])
    )


class AttendanceListSchema(Schema):
    """Schema for attendance list with filters"""
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
        validate=validate.OneOf(['present', 'absent', 'half_day', 'on_leave', 'holiday'])
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
