@echo off
echo ========================================
echo Starting VMS Backend Server
echo ========================================
echo.
echo Server will start at: http://localhost:5001
echo Swagger Documentation: http://localhost:5001/api/docs/
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

flask run --host 0.0.0.0 --port 5001
