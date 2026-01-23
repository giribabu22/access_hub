"""
Shift schemas for request/response validation.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
from . import TimestampMixin


class ShiftSchema(Schema, TimestampMixin):
    """Complete shift schema"""
    id = fields.String(dump_only=True)
    organization_id = fields.String(required=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=128))
    start_time = fields.Time(required=True)
    end_time = fields.Time(required=True)
    grace_period_minutes = fields.Integer(load_default=15, validate=validate.Range(min=0, max=120))
    working_days = fields.List(
        fields.Integer(validate=validate.Range(min=0, max=6)),
        load_default=[1, 2, 3, 4, 5]
    )
    is_active = fields.Boolean(load_default=True)


class ShiftCreateSchema(Schema):
    """Schema for creating a shift"""
    organization_id = fields.String(required=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=128))
    start_time = fields.Time(required=True)
    end_time = fields.Time(required=True)
    grace_period_minutes = fields.Integer(load_default=15, validate=validate.Range(min=0, max=120))
    working_days = fields.List(
        fields.Integer(validate=validate.Range(min=0, max=6)),
        load_default=[1, 2, 3, 4, 5]
    )


class ShiftUpdateSchema(Schema):
    """Schema for updating a shift"""
    name = fields.String(validate=validate.Length(min=1, max=128))
    start_time = fields.Time()
    end_time = fields.Time()
    grace_period_minutes = fields.Integer(validate=validate.Range(min=0, max=120))
    working_days = fields.List(fields.Integer(validate=validate.Range(min=0, max=6)))
    is_active = fields.Boolean()


class ShiftListSchema(Schema):
    """Schema for shift list with filters"""
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=1000))
    search = fields.String(load_default=None)
    organization_id = fields.String(load_default=None)
    is_active = fields.Boolean(load_default=None)
