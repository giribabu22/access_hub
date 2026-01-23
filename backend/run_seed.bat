@echo off
echo ========================================
echo Database Seeding Script
echo ========================================
echo.
echo This will populate all database tables with sample data.
echo.
pause

.venv\Scripts\python.exe seed_all_tables.py

echo.
echo ========================================
pause
