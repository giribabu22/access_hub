import psycopg2
import uuid
from datetime import datetime
import bcrypt

try:
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        database="alms",
        user="postgres",
        password="pg1234"
    )
    
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE username = 'prem'")
    existing = cursor.fetchone()
    
    if existing:
        print(f"User 'prem' already exists with ID: {existing[0]}")
    else:
        # Generate password hash using bcrypt
        password = "Admin@123"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Generate UUID
        user_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Insert user
        cursor.execute("""
            INSERT INTO users (id, username, email, password_hash, role_id, is_active, organization_id, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            'prem',
            'prem@sparquer.com',
            password_hash,
            '7',  # super_admin role (same as superadmin)
            True,
            None,
            now,
            now
        ))
        
        conn.commit()
        
        print(f"✓ User 'prem' created successfully!")
        print(f"  ID: {user_id}")
        print(f"  Username: prem")
        print(f"  Email: prem@sparquer.com")
        print(f"  Role ID: 7 (super_admin)")
        print(f"  Password: Admin@123")
        print(f"  Is Active: True")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
