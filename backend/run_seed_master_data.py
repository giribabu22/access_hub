"""
Master Data Seeding Runner
Execute this script to populate the database with test data.
"""

from app.extensions import db
from app.seeds.seed_master_data import seed_all_master_data
from app import create_app


def main():
    """Run master data seeding"""
    app = create_app()
    
    with app.app_context():
        try:
            print("\n🔄 Ensuring database is ready...")
            
            # Run migrations first if needed
            # from flask_migrate import upgrade
            # upgrade()
            
            print("🌱 Starting master data seeding...\n")
            
            success = seed_all_master_data()
            
            if success:
                print("\n✨ All data seeded successfully!")
                return 0
            else:
                print("\n⚠️  Seeding completed with errors")
                return 1
                
        except Exception as e:
            print(f"\n❌ Fatal error: {str(e)}")
            import traceback
            traceback.print_exc()
            return 1


if __name__ == "__main__":
    exit(main())
