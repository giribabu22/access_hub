@echo off
echo ========================================
echo Migration Fix and Setup
echo ========================================
echo.

echo Step 1: Resetting alembic version...
..\.venv-1\Scripts\python.exe fix_migrations_complete.py
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to reset migrations
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 2: Creating new migration...
echo ========================================
..\.venv-1\Scripts\python.exe -m flask db migrate -m "Initial migration"
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to create migration
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 3: Applying migration...
echo ========================================
..\.venv-1\Scripts\python.exe -m flask db upgrade
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to apply migration
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 4: Verifying current migration...
echo ========================================
..\.venv-1\Scripts\python.exe -m flask db current

echo.
echo ========================================
echo SUCCESS! Migrations are now up to date
echo ========================================
echo.
pause
