# Organization API Fix

## Issues Fixed

### 1. Unknown Field Error: `code`
**Problem:** The `code` field was not allowed in the `OrganizationUpdateSchema`, causing validation errors when trying to update organization codes.

**Solution:** Added the `code` field to `OrganizationUpdateSchema` with proper validation (min 2, max 50 characters).

### 2. Limited Organization Types
**Problem:** The `organization_type` field only accepted 4 values: `school`, `office`, `apartment`, `home`.

**Solution:** Expanded organization types to include:
- school
- office
- apartment
- home
- hospital
- retail
- warehouse
- factory
- hotel
- restaurant
- gym
- other

## Files Modified

1. **app/schemas/organization.py**
   - Updated `OrganizationSchema` to include all new organization types
   - Updated `OrganizationCreateSchema` to include all new organization types
   - Updated `OrganizationUpdateSchema` to:
     - Include `code` field (previously missing)
     - Include all new organization types
   - Updated `OrganizationListSchema` to include all new organization types for filtering

2. **app/api/organizations/routes.py**
   - Updated Swagger/OpenAPI documentation to reflect new organization types
   - Updated enum values in all relevant endpoints

3. **app/models/organization.py**
   - Updated comment to reflect all available organization types

## API Usage

### Update Organization
```bash
PUT /api/v2/organizations/{org_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "HOSP001",
  "organization_type": "hospital",
  "name": "City Hospital",
  "address": "123 Medical St"
}
```

### Create Organization
```bash
POST /api/v2/organizations
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Downtown Retail Store",
  "code": "RETAIL001",
  "organization_type": "retail",
  "address": "456 Shopping Ave"
}
```

### List Organizations with Filter
```bash
GET /api/v2/organizations?organization_type=hospital&page=1&per_page=20
Authorization: Bearer <token>
```

## Testing

All changes have been validated with test script `test_organization_schema.py`:
- ✓ Code field now accepted in update schema
- ✓ All new organization types validated successfully
- ✓ Invalid organization types properly rejected
- ✓ Backward compatibility maintained with original types

## Migration Note

No database migration is required as:
1. The `code` field already exists in the database schema
2. The `organization_type` column uses VARCHAR(50) which supports all new values
3. These are validation-level changes only
