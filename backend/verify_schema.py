#!/usr/bin/env python
import psycopg2
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load environment
load_dotenv()
db_url = os.getenv('DATABASE_URL')

if not db_url:
    print("ERROR: DATABASE_URL not set!")
    exit(1)

print(f"Connecting to: {db_url[:50]}...")

# Parse the URL
parsed = urlparse(db_url.replace('postgresql+psycopg2://', 'postgresql://'))

try:
    conn = psycopg2.connect(
        host=parsed.hostname,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path.lstrip('/'),
        port=parsed.port or 5432
    )
    print("✓ Connected successfully!\n")
    
    cur = conn.cursor()
    
    # Check main schema tables
    print('=' * 50)
    print('TABLES IN MAIN SCHEMA')
    print('=' * 50)
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'main'
        ORDER BY table_name
    """)
    main_tables = cur.fetchall()
    if main_tables:
        for row in main_tables:
            print(f'  ✓ {row[0]}')
        print(f"\nTotal: {len(main_tables)} tables\n")
    else:
        print('  ✗ No tables found!\n')
    
    # Check public schema tables
    print('=' * 50)
    print('TABLES IN PUBLIC SCHEMA')
    print('=' * 50)
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    public_tables = cur.fetchall()
    if public_tables:
        for row in public_tables:
            print(f'  ✓ {row[0]}')
        print(f"\nTotal: {len(public_tables)} tables\n")
    else:
        print('  ✗ No tables found!\n')
    
    # Check all schemas
    print('=' * 50)
    print('ALL SCHEMAS IN DATABASE')
    print('=' * 50)
    cur.execute("""
        SELECT schema_name 
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
        ORDER BY schema_name
    """)
    schemas = cur.fetchall()
    for row in schemas:
        print(f'  ✓ {row[0]}')
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"✗ Connection error: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
