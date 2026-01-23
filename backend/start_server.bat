@echo off
REM Start Flask Development Server

echo ========================================
echo Starting VMS Backend Server
echo ========================================
echo.

cd /d "%~dp0"

set FLASK_APP=wsgi.py
set FLASK_ENV=development

echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

flask run --host 0.0.0.0 --port 5000 --debug
