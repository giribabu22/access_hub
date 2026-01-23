import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# Parse connection string
from urllib.parse import urlparse
parsed = urlparse(db_url)
conn = psycopg2.connect(
    host=parsed.hostname,
    user=parsed.username,
    password=parsed.password,
    database=parsed.path[1:],
    port=parsed.port or 5432
)

cur = conn.cursor()

# Check main schema tables
print('=== Tables in MAIN schema ===')
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'main'
    ORDER BY table_name
""")
tables = cur.fetchall()
if tables:
    for (table,) in tables:
        print(f'  - {table}')
else:
    print('  No tables found!')

# Check public schema tables
print('\n=== Tables in PUBLIC schema ===')
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
""")
tables = cur.fetchall()
if tables:
    for (table,) in tables:
        print(f'  - {table}')
else:
    print('  No tables found!')

# Check all schemas
print('\n=== All Schemas ===')
cur.execute("""
    SELECT schema_name 
    FROM information_schema.schemata
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
    ORDER BY schema_name
""")
schemas = cur.fetchall()
for (schema,) in schemas:
    print(f'  - {schema}')

cur.close()
conn.close()
