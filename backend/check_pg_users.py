import psycopg2

try:
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        database="alms",
        user="postgres",
        password="pg1234"
    )
    
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, username, email, is_active, role_id, 
               LEFT(password_hash, 80) as pw_start,
               LENGTH(password_hash) as pw_len
        FROM users 
        WHERE username IN ('superadmin', 'prem')
        ORDER BY username
    """)
    
    rows = cursor.fetchall()
    
    print("\n=== Users in PostgreSQL Database ===\n")
    for row in rows:
        user_id, username, email, is_active, role_id, pw_start, pw_len = row
        print(f"Username: {username}")
        print(f"  ID: {user_id}")
        print(f"  Email: {email}")
        print(f"  Is Active: {is_active}")
        print(f"  Role ID: {role_id}")
        print(f"  Password Hash Start: {pw_start}...")
        print(f"  Password Hash Length: {pw_len}")
        print()
    
    # Also check their roles
    cursor.execute("""
        SELECT u.username, r.id as role_id, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.username IN ('superadmin', 'prem')
        ORDER BY u.username
    """)
    
    rows = cursor.fetchall()
    print("=== Role Information ===\n")
    for row in rows:
        username, role_id, role_name = row
        print(f"{username}: role_id={role_id}, role_name={role_name}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error connecting to database: {e}")
