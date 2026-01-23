#!/usr/bin/env python
"""
Quick setup script for VMS development environment.
This script initializes roles, creates test users, and sets up sample data.
"""

import sys
import os
import subprocess

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_script(script_name, description):
    """Run a Python script and handle errors"""
    print(f"\n🚀 {description}...")
    print("-" * 50)
    
    try:
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=False, 
                              text=True, 
                              cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.returncode == 0:
            print(f"✅ {description} - SUCCESS")
            return True
        else:
            print(f"❌ {description} - FAILED")
            return False
    except Exception as e:
        print(f"❌ Error running {script_name}: {str(e)}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print("🎯 VMS QUICK SETUP SCRIPT")
    print("=" * 60)
    print("This script will:")
    print("1. Initialize roles and permissions")
    print("2. Create test manager user")
    print("3. Create test employee user")  
    print("4. Generate sample attendance and leave data")
    print("=" * 60)
    
    input("Press Enter to continue...")
    
    scripts = [
        ("seed_roles.py", "Initialize roles and permissions"),
        ("create_test_manager.py", "Create test manager user"),
        ("create_test_employee.py", "Create test employee user"),
        ("create_sample_data.py", "Generate sample attendance and leave data")
    ]
    
    success_count = 0
    total_scripts = len(scripts)
    
    for script_name, description in scripts:
        if run_script(script_name, description):
            success_count += 1
        else:
            print(f"\n⚠️  Warning: {script_name} failed. You may need to run it manually.")
    
    print("\n" + "=" * 60)
    print("📊 SETUP SUMMARY")
    print("=" * 60)
    print(f"✅ Successful: {success_count}/{total_scripts}")
    print(f"❌ Failed: {total_scripts - success_count}/{total_scripts}")
    
    if success_count == total_scripts:
        print("\n🎉 ALL SETUP STEPS COMPLETED SUCCESSFULLY!")
        print("\n🚀 You can now:")
        print("  • Start the backend server: py wsgi.py")
        print("  • Start the frontend: npm run start")
        print("  • Login with test accounts:")
        print("    - Manager: john.manager@sparquer.com / password123")
        print("    - Employee: john.employee@sparquer.com / password123")
    else:
        print("\n⚠️  Some setup steps failed. Check the errors above.")
        print("You may need to run failed scripts manually.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()