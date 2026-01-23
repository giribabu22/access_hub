"""
Reset Alembic Version Table
This script clears the alembic_version table to allow fresh migrations
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2 import sql

# Load environment variables
load_dotenv()

def reset_alembic_version():
    """Clear the alembic_version table"""
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return False
    
    try:
        print("🔄 Connecting to database...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Create main schema if it doesn't exist
        print("🔧 Ensuring 'main' schema exists...")
        cursor.execute("CREATE SCHEMA IF NOT EXISTS main;")
        conn.commit()
        
        # Check if alembic_version table exists in main schema
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'main'
                AND table_name = 'alembic_version'
            );
        """)
        
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            print("🗑️  Clearing main.alembic_version table...")
            cursor.execute("DELETE FROM main.alembic_version;")
            conn.commit()
            print("✅ alembic_version table cleared successfully!")
        else:
            print("ℹ️  alembic_version table doesn't exist yet (this is normal for a fresh setup)")
        
        cursor.close()
        conn.close()
        
        print("\n📝 Next steps:")
        print("   1. Run: ..\.venv-1\Scripts\python.exe -m flask db migrate -m 'Initial migration'")
        print("   2. Run: ..\.venv-1\Scripts\python.exe -m flask db upgrade")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("🔄 Alembic Version Reset")
    print("=" * 50)
    reset_alembic_version()
    print("=" * 50)