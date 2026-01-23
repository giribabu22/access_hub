"""
Complete Migration Fix Script
This script will:
1. Clear the alembic_version table
2. Verify the main schema exists
3. Provide next steps for creating fresh migrations
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

def main():
    print("=" * 60)
    print("🔧 Complete Migration Reset & Fix")
    print("=" * 60)
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        print("   Please check your .env file")
        return False
    
    # Convert SQLAlchemy URL to psycopg2 URL if needed
    if 'postgresql+psycopg2://' in database_url:
        database_url = database_url.replace('postgresql+psycopg2://', 'postgresql://')
        print("   ℹ️  Converted SQLAlchemy URL to psycopg2 format")
    
    try:
        print("\n1️⃣  Connecting to database...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        print("   ✅ Connected successfully")
        
        print("\n2️⃣  Ensuring 'main' schema exists...")
        cursor.execute("CREATE SCHEMA IF NOT EXISTS main;")
        conn.commit()
        print("   ✅ Schema 'main' is ready")
        
        print("\n3️⃣  Checking for alembic_version table...")
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'main'
                AND table_name = 'alembic_version'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            print("   ℹ️  Found alembic_version table in main schema")
            
            # Show current version
            cursor.execute("SELECT version_num FROM main.alembic_version;")
            versions = cursor.fetchall()
            if versions:
                print(f"   📌 Current version(s): {[v[0] for v in versions]}")
            
            print("   🗑️  Clearing alembic_version table...")
            cursor.execute("DELETE FROM main.alembic_version;")
            conn.commit()
            print("   ✅ alembic_version table cleared")
        else:
            print("   ℹ️  alembic_version table doesn't exist yet")
            print("   📝 This is normal for a fresh setup")
        
        # Check for existing tables
        print("\n4️⃣  Checking for existing tables...")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        if tables:
            print(f"   📊 Found {len(tables)} existing table(s):")
            for table in tables:
                print(f"      - {table[0]}")
        else:
            print("   ℹ️  No tables found in public schema")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Migration reset complete!")
        print("=" * 60)
        print("\n📝 Next Steps:")
        print("   1. Create new migration:")
        print(r"      ..\..venv-1\Scripts\python.exe -m flask db migrate -m 'Initial migration'")
        print("\n   2. Review the generated migration file in migrations/versions/")
        print("\n   3. Apply the migration:")
        print(r"      ..\..venv-1\Scripts\python.exe -m flask db upgrade")
        print("\n   4. Verify with:")
        print(r"      ..\..venv-1\Scripts\python.exe -m flask db current")
        print("=" * 60)
        
        return True
        
    except psycopg2.Error as e:
        print(f"\n❌ Database Error: {e}")
        print(f"   Error Code: {e.pgcode}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)