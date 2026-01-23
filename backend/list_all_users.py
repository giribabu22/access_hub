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
        SELECT COUNT(*) FROM users
    """)
    
    count = cursor.fetchone()[0]
    print(f"\n=== Total users in database: {count} ===\n")
    
    cursor.execute("""
        SELECT id, username, email, is_active, role_id
        FROM users 
        ORDER BY created_at DESC
        LIMIT 20
    """)
    
    rows = cursor.fetchall()
    
    print("Recent users:")
    for row in rows:
        user_id, username, email, is_active, role_id = row
        print(f"  - {username:20} email={email:30} is_active={is_active} role_id={role_id}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
