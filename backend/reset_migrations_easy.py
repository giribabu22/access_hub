#!/usr/bin/env python
"""
Easy Migration Reset Script
Cleans up all migration files and prepares for fresh schema generation
"""
import os
import shutil
from pathlib import Path

def reset_migrations():
    """Reset all migrations safely"""
    
    migrations_dir = Path(__file__).parent / "migrations" / "versions"
    
    print("🔄 Migration Reset Process")
    print("=" * 50)
    
    # List files to be deleted
    if migrations_dir.exists():
        migration_files = [f for f in migrations_dir.glob("*.py") if f.name != "__init__.py"]
        
        if migration_files:
            print(f"\n📋 Found {len(migration_files)} migration files:")
            for f in sorted(migration_files):
                print(f"   - {f.name}")
            
            # Delete migrations
            print("\n🗑️  Deleting migration files...")
            for f in migration_files:
                f.unlink()
                print(f"   ✓ Deleted {f.name}")
            
            # Clean pycache
            pycache = migrations_dir / "__pycache__"
            if pycache.exists():
                shutil.rmtree(pycache)
                print("   ✓ Cleaned __pycache__")
            
            print("\n✅ Migration files reset successfully!")
            print("\n📝 Next steps:")
            print("   1. Make sure your models are properly defined")
            print("   2. Run: flask db migrate -m 'Initial migration'")
            print("   3. Run: flask db upgrade")
            print("=" * 50)
        else:
            print("\n⚠️  No migration files found to delete")
    else:
        print(f"\n❌ Migrations directory not found: {migrations_dir}")

if __name__ == "__main__":
    reset_migrations()
