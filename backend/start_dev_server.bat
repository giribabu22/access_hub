@echo off
echo ========================================
echo Starting VMS Backend Development Server
echo ========================================
echo.

cd /d "%~dp0"

echo Setting environment variables...
set FLASK_APP=wsgi:app
set FLASK_DEBUG=1
set FLASK_ENV=development

echo.
echo Starting Flask server on http://0.0.0.0:5001
echo Press Ctrl+C to stop the server
echo ========================================
echo.

.venv\Scripts\python.exe -m flask run --host=0.0.0.0 --port=5001
