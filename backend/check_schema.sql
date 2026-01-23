-- Check tables in main schema
SELECT 'MAIN SCHEMA' as schema_name, table_name 
FROM information_schema.tables 
WHERE table_schema = 'main'
ORDER BY table_name;

-- Check tables in public schema  
SELECT 'PUBLIC SCHEMA' as schema_name, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- List all schemas
SELECT schema_name 
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
ORDER BY schema_name;
