# Seed Scripts

This directory contains seed scripts to initialize the database with default data.

## Available Seed Scripts

### 1. `init_roles.py`
Initializes default roles and permissions:
- **super_admin**: Full system access across all organizations
- **org_admin**: Organization-level administrator
- **employee**: Regular employee with limited access

### 2. `init_super_admin.py`
Creates a default super admin user:
- **Email**: admin@sparquer.com
- **Username**: superadmin
- **Password**: Admin@123

### 3. `init_sparquer_org.py`
Creates the Sparquer organization with:
- Organization details
- 4 Departments (AI, Frontend, Backend, HR)
- 11 Employees with user accounts

**Employee Details:**
- All employees have default password: `Welcome@123`
- Prem is set as Org Admin with email: giribabunettlinx@gmail.com

### 4. `seed_all.py`
Master script that runs all seed scripts in the correct order.

## Usage

### Quick Start (Recommended)
Run all seeds at once:
```bash
cd vms_backend
python manage.py seed_all
```

### Individual Seed Commands
```bash
# Seed roles only
python manage.py seed_roles

# Seed super admin only
python manage.py seed_super_admin

# Seed Sparquer organization only
python manage.py seed_sparquer
```

### Create Custom Super Admin
```bash
python manage.py create_superadmin
# You will be prompted for email, username, and password
```

## Running Seeds Directly

You can also run seed scripts directly using Python:

```bash
cd vms_backend

# Run all seeds
python -m app.seeds.seed_all

# Run individual seeds
python -m app.seeds.init_roles
python -m app.seeds.init_super_admin
python -m app.seeds.init_sparquer_org
```

## Default Credentials

After running the seeds, you can login with:

### Super Admin
- **Email**: admin@sparquer.com
- **Password**: Admin@123
- **Access**: Full system access

### Org Admin (Prem)
- **Email**: giribabunettlinx@gmail.com
- **Password**: Welcome@123
- **Access**: Sparquer organization administration

### Employees
All employees can login with their email and default password:
- **Password**: Welcome@123
- **Emails**: 
  - saikrishna@sparquer.com
  - sankara@sparquer.com
  - dp@sparquer.com
  - shirlene@sparquer.com
  - manoj@sparquer.com
  - kajal@sparquer.com
  - navyasree@sparquer.com
  - nisha@sparquer.com
  - ramesh@sparquer.com
  - sujay@sparquer.com

## Department Assignments

| Department | Employees |
|------------|-----------|
| AI Team | Sai Krishna, Sankara Bharadwaj |
| Frontend | DP, Shirlene |
| Backend | Prem, Manoj |
| HR | Kajal Yadav, Navyasree Yadavalli, Nisha Yadav, Ramesh, Sujay Jacob |

## Important Notes

⚠️ **Security Warning**: All seed scripts use default passwords. Make sure to:
1. Change all passwords after first login in production
2. Update email addresses to real ones before deployment
3. Never commit real credentials to version control

## Customization

To add more employees or organizations, you can:
1. Copy `init_sparquer_org.py` and modify it for your needs
2. Update the employee data in the script
3. Run your custom seed script

## Troubleshooting

### Issue: "Role not found" error
**Solution**: Run `python manage.py seed_roles` first

### Issue: "User already exists" error
**Solution**: The seed has already been run. Seeds are idempotent and will skip existing records.

### Issue: Database connection error
**Solution**: Check your `.env` file and ensure `DATABASE_URL` is correctly configured

## Development Workflow

1. **First Time Setup**:
   ```bash
   # Create database tables
   python manage.py init_db
   
   # Seed all data
   python manage.py seed_all
   ```

2. **Reset Database** (⚠️ Deletes all data):
   ```bash
   python manage.py reset_db
   python manage.py seed_all
   ```

3. **Update Existing Seeds**:
   - Modify the seed files
   - Seeds are idempotent, so you can run them again
   - They will update existing records or create new ones
