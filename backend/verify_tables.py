"""
Script to verify that all required tables exist in the database.
Run this after migrations to confirm everything is set up correctly.
"""
import sys
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file")
    sys.exit(1)

print("=" * 60)
print("VMS Database Table Verification")
print("=" * 60)
print(f"\nConnecting to: {DATABASE_URL.split('@')[-1]}")  # Hide credentials
print()

# Expected tables from migrations
EXPECTED_TABLES = [
    # Legacy tables
    "user_details",
    "visitor_details", 
    "visitor_images",
    "roles",
    "users",
    
    # New multi-tenant schema
    "organizations",
    "locations",
    "shifts",
    "departments",
    "employees",
    "cameras",
    "face_embeddings",
    "presence_events",
    "attendance_records",
    "leave_requests",
    "audit_logs",
]

try:
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Get inspector
    inspector = inspect(engine)
    
    # Get all tables in the public schema
    existing_tables = inspector.get_table_names(schema='public')
    
    print("📊 Table Status:\n")
    
    missing_tables = []
    for table in EXPECTED_TABLES:
        if table in existing_tables:
            print(f"  ✅ {table}")
        else:
            print(f"  ❌ {table} (MISSING)")
            missing_tables.append(table)
    
    print("\n" + "=" * 60)
    
    if missing_tables:
        print(f"\n⚠️  WARNING: {len(missing_tables)} table(s) missing!")
        print(f"\nMissing tables: {', '.join(missing_tables)}")
        print("\nPlease run migrations:")
        print("  flask db upgrade head")
        sys.exit(1)
    else:
        print("\n✅ SUCCESS: All required tables exist!")
        
        # Show table counts
        print("\n📈 Table Row Counts:\n")
        with engine.connect() as conn:
            for table in EXPECTED_TABLES:
                if table in existing_tables:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"  {table}: {count} rows")
        
        print("\n" + "=" * 60)
        print("✅ Database schema is ready!")
        print("\nNext steps:")
        print("  1. Seed initial data (roles, organizations)")
        print("  2. Create admin user")
        print("  3. Test API endpoints")
        
except Exception as e:
    print(f"\n❌ ERROR: Failed to connect to database")
    print(f"\nError details: {e}")
    print("\nPlease check:")
    print("  1. PostgreSQL is running")
    print("  2. DATABASE_URL in .env is correct")
    print("  3. Database exists and credentials are valid")
    sys.exit(1)
