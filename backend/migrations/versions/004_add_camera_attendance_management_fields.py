"""Add camera attendance management fields

Revision ID: 004_add_camera_attendance_management_fields
Revises: 5f3e2a1b8c9d
Create Date: 2025-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_camera_attendance_management_fields'
down_revision = '5f3e2a1b8c9d'  # Latest migration revision
branch_labels = None
depends_on = None


def upgrade():
    """Add attendance management fields to cameras table"""
    
    # Add new columns to cameras table
    op.add_column('cameras', sa.Column('attendance_enabled', sa.Boolean(), default=True, nullable=True))
    op.add_column('cameras', sa.Column('visitor_tracking_enabled', sa.Boolean(), default=False, nullable=True))
    op.add_column('cameras', sa.Column('people_logs_enabled', sa.Boolean(), default=True, nullable=True))
    op.add_column('cameras', sa.Column('management_type', sa.String(20), default='ATTENDANCE', nullable=True))
    op.add_column('cameras', sa.Column('auto_check_out_hours', sa.Integer(), default=12, nullable=True))
    op.add_column('cameras', sa.Column('require_manual_approval', sa.Boolean(), default=False, nullable=True))
    op.add_column('cameras', sa.Column('notification_enabled', sa.Boolean(), default=True, nullable=True))
    
    # Update existing records with default values
    op.execute("UPDATE cameras SET attendance_enabled = TRUE WHERE attendance_enabled IS NULL")
    op.execute("UPDATE cameras SET visitor_tracking_enabled = FALSE WHERE visitor_tracking_enabled IS NULL")
    op.execute("UPDATE cameras SET people_logs_enabled = TRUE WHERE people_logs_enabled IS NULL")
    op.execute("UPDATE cameras SET management_type = 'ATTENDANCE' WHERE management_type IS NULL")
    op.execute("UPDATE cameras SET auto_check_out_hours = 12 WHERE auto_check_out_hours IS NULL")
    op.execute("UPDATE cameras SET require_manual_approval = FALSE WHERE require_manual_approval IS NULL")
    op.execute("UPDATE cameras SET notification_enabled = TRUE WHERE notification_enabled IS NULL")
    
    # Make columns non-nullable after setting defaults
    op.alter_column('cameras', 'attendance_enabled', nullable=False)
    op.alter_column('cameras', 'visitor_tracking_enabled', nullable=False)
    op.alter_column('cameras', 'people_logs_enabled', nullable=False)
    op.alter_column('cameras', 'management_type', nullable=False)
    op.alter_column('cameras', 'auto_check_out_hours', nullable=False)
    op.alter_column('cameras', 'require_manual_approval', nullable=False)
    op.alter_column('cameras', 'notification_enabled', nullable=False)


def downgrade():
    """Remove attendance management fields from cameras table"""
    
    op.drop_column('cameras', 'notification_enabled')
    op.drop_column('cameras', 'require_manual_approval')
    op.drop_column('cameras', 'auto_check_out_hours')
    op.drop_column('cameras', 'management_type')
    op.drop_column('cameras', 'people_logs_enabled')
    op.drop_column('cameras', 'visitor_tracking_enabled')
    op.drop_column('cameras', 'attendance_enabled')