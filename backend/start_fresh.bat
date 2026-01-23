@echo off
echo Starting VMS Backend Server...
echo.
echo Port: 5001
echo CORS: Enabled for all origins (development mode)
echo.

cd /d "%~dp0"
call ..\.venv-1\Scripts\activate.bat
flask run --host 0.0.0.0 --port 5001
