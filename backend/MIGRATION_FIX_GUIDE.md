# Migration Fix Guide: Missing Employees Table

## Problem Summary
The `employees` table (and related tables) were missing from the database because migrations were never created for the new multi-tenant schema models.

## Root Cause
- ✅ Models defined in `app/models/` (Employee, Department, Shift, etc.)
- ✅ Models imported in stats routes
- ❌ **NO migrations created** for these tables
- Result: `psycopg2.errors.UndefinedTable: relation "employees" does not exist`

## Solution: Run New Migrations

### Created Migrations (in order):
1. **9_create_locations_table.py** - Locations for organizations
2. **10_create_shifts_table.py** - Shift schedules
3. **11_create_departments_table.py** - Departments
4. **12_create_employees_table.py** - **Employees table** (the main fix!)
5. **13_create_cameras_table.py** - Camera devices
6. **14_create_face_embeddings_table.py** - Face recognition data
7. **15_create_presence_events_table.py** - Attendance events
8. **16_create_attendance_records_table.py** - Daily attendance
9. **17_create_leave_requests_table.py** - Leave management
10. **18_create_audit_logs_table.py** - Audit trail

### Steps to Apply

#### 1. Verify Current Migration Status
```bash
cd vms_backend
flask db current
```

This should show:
```
8_create_organizations_table (head)
```

#### 2. Check Pending Migrations
```bash
flask db heads
flask db show <revision_id>
```

#### 3. Apply All New Migrations
```bash
flask db upgrade head
```

This will create all missing tables in the correct order.

#### 4. Verify Tables Were Created
Connect to your PostgreSQL database:
```bash
psql -h localhost -U your_user -d your_database
```

Then check:
```sql
\dt

-- Verify specific tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'employees', 'departments', 'shifts', 
    'locations', 'cameras', 'face_embeddings',
    'presence_events', 'attendance_records',
    'leave_requests', 'audit_logs'
);
```

You should see all 10 new tables listed.

#### 5. Test the Stats API
```bash
# Get a JWT token first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email", "password": "your_password"}'

# Test stats endpoint (should return 200 with zeros, not 500 error)
curl http://localhost:5000/api/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "organizations": {"total": 0, "active": 0},
  "employees": {"total": 0, "active": 0},
  "face_embeddings": {"total": 0, "primary": 0, "avg_quality": 0.0},
  "presence_events": {"total": 0, "unknown_faces": 0, "anomalies": 0, "pending_reviews": 0},
  "cameras": {"total": 0, "online": 0},
  "visitors": {"total": 0}
}
```

## Defensive Error Handling (Added)

The stats routes now have defensive error handling to prevent 500 errors if any table is missing:

```python
try:
    emp_total = db.session.query(func.count(Employee.id)).scalar() or 0
except ProgrammingError as e:
    print(f"[stats_overview] Employees table missing: {e}")
    emp_total = 0
    db.session.rollback()
```

Benefits:
- ✅ API returns 200 with zeros instead of 500 error
- ✅ Frontend dashboard doesn't break
- ✅ Logs still show the issue for debugging
- ✅ Graceful degradation during migrations

## Troubleshooting

### If migrations fail:

1. **Check migration chain**:
```bash
flask db history
```

2. **Check for conflicts**:
```bash
flask db heads
```
Should show only ONE head. If multiple heads exist:
```bash
flask db merge heads -m "merge migration heads"
flask db upgrade
```

3. **Manual table creation** (DEV ONLY):
```python
# In Python shell or script
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
```

⚠️ **WARNING**: `db.create_all()` should NEVER be used in production. Always use migrations.

### If table name mismatch:

Check your model's `__tablename__`:
```python
class Employee(db.Model):
    __tablename__ = "employees"  # Must match DB exactly
```

PostgreSQL is case-sensitive if quoted. Always use lowercase table names.

### Wrong database connection:

Check `.env` file:
```bash
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/vms_db
```

Verify you're connecting to the right database:
```bash
flask shell
>>> from app import db
>>> db.engine.url
```

## Next Steps

1. ✅ Run migrations: `flask db upgrade head`
2. ✅ Verify tables exist in database
3. ✅ Test stats API endpoint
4. ⚠️ Seed initial data (organizations, users, roles)
5. ⚠️ Create test employees for development
6. ⚠️ Test full dashboard functionality

## Production Checklist

Before deploying to production:
- [ ] All migrations tested in staging
- [ ] Database backup taken
- [ ] Rollback plan ready (`flask db downgrade`)
- [ ] Monitor logs during deployment
- [ ] Test critical endpoints after deployment
- [ ] Verify no 500 errors in production logs
- [ ] Check database connection pooling is working

## Related Files Modified

1. **Created Migrations**:
   - `migrations/versions/9_create_locations_table.py`
   - `migrations/versions/10_create_shifts_table.py`
   - `migrations/versions/11_create_departments_table.py`
   - `migrations/versions/12_create_employees_table.py` ← **Main fix**
   - `migrations/versions/13_create_cameras_table.py`
   - `migrations/versions/14_create_face_embeddings_table.py`
   - `migrations/versions/15_create_presence_events_table.py`
   - `migrations/versions/16_create_attendance_records_table.py`
   - `migrations/versions/17_create_leave_requests_table.py`
   - `migrations/versions/18_create_audit_logs_table.py`

2. **Updated Code**:
   - `app/stats/routes.py` - Added defensive error handling

## Summary

✅ **Issue**: `employees` table didn't exist  
✅ **Root Cause**: No migration for Employee model  
✅ **Fix**: Created 10 migrations for all new schema models  
✅ **Safeguard**: Added error handling to prevent 500 errors  
✅ **Next**: Run `flask db upgrade head` to apply migrations
