
import os
import sys

# Ensure backend root is in path
sys.path.append(os.getcwd())

from app import create_app
from app.extensions import db
from flask_migrate import migrate, upgrade, init

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        print("Starting manual migration...")
        
        # Check if migrations directory exists
        if not os.path.exists("migrations"):
            print("Initializing migrations directory...")
            init()
            
        print("Generating migration script...")
        try:
            migrate(message="add_lpr_tables")
        except Exception as e:
            print(f"Migration generation warning (might be empty): {e}")
            
        print("Applying upgrades...")
        upgrade()
        print("Done!")
