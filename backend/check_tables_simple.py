import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from sqlalchemy import inspect, text

app = create_app()

with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names(schema='public')
    
    print("\n" + "=" * 60)
    print(f"Found {len(tables)} tables in database:")
    print("=" * 60)
    
    for table in sorted(tables):
        print(f"  • {table}")
    
    # Check migration version
    print("\n" + "=" * 60)
    print("Current migration version:")
    print("=" * 60)
    
    try:
        result = db.session.execute(text("SELECT version_num FROM alembic_version"))
        version = result.scalar()
        print(f"  {version}")
    except Exception as e:
        print(f"  Error: {e}")
    
    # Check if employees table exists
    if 'employees' in tables:
        print("\n✅ employees table EXISTS")
    else:
        print("\n❌ employees table MISSING")
