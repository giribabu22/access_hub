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
    
    # Nested fields
    employee = fields.Nested(EmployeeSchema, only=('id', 'full_name', 'employee_code', 'designation'), dump_only=True)
