"""
Check current database state and fix migration issues.
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
print("Database State & Migration Check")
print("=" * 60)

try:
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # Get all tables
    existing_tables = inspector.get_table_names(schema='public')
    
    print(f"\n✅ Connected to: {DATABASE_URL.split('@')[-1]}")
    print(f"\n📊 Existing tables ({len(existing_tables)}):\n")
    
    for table in sorted(existing_tables):
        print(f"  • {table}")
    
    # Check which of our expected tables exist
    new_schema_tables = [
        "locations", "shifts", "departments", "employees",
        "cameras", "face_embeddings", "presence_events",
        "attendance_records", "leave_requests", "audit_logs"
    ]
    
    print("\n" + "=" * 60)
    print("New Schema Tables Status:")
    print("=" * 60 + "\n")
    
    existing_new = []
    missing_new = []
    
    for table in new_schema_tables:
        if table in existing_tables:
            print(f"  ✅ {table}")
            existing_new.append(table)
        else:
            print(f"  ❌ {table}")
            missing_new.append(table)
    
    print("\n" + "=" * 60)
    
    if existing_new:
        print(f"\n⚠️  WARNING: {len(existing_new)} tables already exist!")
        print("These tables were likely created manually with db.create_all()\n")
        print("Recommended solution:")
        print("  1. Drop these tables manually, OR")
        print("  2. Mark migrations as applied using flask db stamp\n")
    
    if missing_new:
        print(f"\n✅ {len(missing_new)} tables need to be created")
        print("Run: flask db upgrade head\n")
    
    # Check alembic version
    print("=" * 60)
    print("Migration Version Check:")
    print("=" * 60 + "\n")
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version_num FROM alembic_version"))
        current_version = result.scalar()
        print(f"Current migration version: {current_version}\n")
    
    # Suggest fix
    if existing_new and not missing_new:
        print("=" * 60)
        print("RECOMMENDED FIX:")
        print("=" * 60)
        print("\nAll tables exist but migrations weren't tracked.")
        print("To fix, stamp the database to the latest migration:\n")
        print("  cd vms_backend")
        print("  flask db stamp head\n")
        print("This tells Flask-Migrate that all migrations are applied.")
    elif existing_new and missing_new:
        print("=" * 60)
        print("RECOMMENDED FIX:")
        print("=" * 60)
        print("\nSome tables exist, some don't. Mixed state detected.")
        print("\nOption 1 - Drop manually created tables and re-run migrations:")
        print("  (Recommended if no production data)\n")
        for table in existing_new:
            print(f"  DROP TABLE IF EXISTS {table} CASCADE;")
        print("\n  Then run: flask db upgrade head\n")
        print("\nOption 2 - Stamp to skip existing tables:")
        print("  (If you want to keep existing tables)")
        print("  This may cause issues with foreign keys.\n")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    sys.exit(1)
