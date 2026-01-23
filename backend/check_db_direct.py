import sqlite3

conn = sqlite3.connect('dev.sqlite3')
cursor = conn.cursor()

cursor.execute('''
    SELECT username, email, is_active, role_id, password_hash 
    FROM users 
    WHERE username IN ('superadmin', 'prem')
''')

rows = cursor.fetchall()

print("\n=== Users in Database ===\n")
for row in rows:
    username, email, is_active, role_id, pw_hash = row
    print(f"Username: {username}")
    print(f"  Email: {email}")
    print(f"  Is Active: {is_active}")
    print(f"  Role ID: {role_id}")
    print(f"  Password Hash: {pw_hash[:80] if pw_hash else 'None'}...")
    print(f"  Hash Length: {len(pw_hash) if pw_hash else 0}")
    print()

conn.close()
