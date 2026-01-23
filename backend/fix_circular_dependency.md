# Circular Dependency Fix

## Problem
The generated migration has circular foreign key dependencies:
- `departments.manager_id` -> `employees.id`
- `employees.department_id` -> `departments.id`

Alembic tries to create `departments` first, but it references `employees` which hasn't been created yet.

## Solution Options

### Option 1: Use ALTER (Recommended)
Modify the models to use `use_alter=True` for the circular FK.

### Option 2: Manual Migration Edit
Remove the `manager_id` FK from initial departments creation and add it later.

### Option 3: Make manager_id nullable without FK
Remove the FK constraint entirely for `manager_id` (it's already nullable).

## Quick Fix
We'll use Option 3 - remove the FK constraint for manager_id since it's optional anyway.

### Steps:
1. Delete current migration
2. Update Department model to remove FK constraint for manager_id  
3. Regenerate migration
4. Apply migration

Or manually edit the generated migration file.
