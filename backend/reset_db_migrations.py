#!/usr/bin/env python
"""
Reset Database Migration History
Clears the alembic_version table to start fresh
"""
import os
from app import create_app, db
from sqlalchemy import text

def reset_db_migrations():
    """Reset migration history in the database"""
    
    app = create_app()
    
    print("🔄 Database Migration History Reset")
    print("=" * 50)
    
    with app.app_context():
        try:
            # Drop the alembic_version table if it exists
            print("\n🗑️  Clearing migration history...")
            db.session.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
            db.session.commit()
            print("   ✓ Cleared alembic_version table")
            
            print("\n✅ Database migration history reset successfully!")
            print("\n📝 Next steps:")
            print("   1. Run: flask db migrate -m 'Initial migration'")
            print("   2. Run: flask db upgrade")
            print("=" * 50)
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            db.session.rollback()

if __name__ == "__main__":
    reset_db_migrations()
