@echo off
cd /d c:\Users\preml\Desktop\office\vms\backend
set FLASK_APP=wsgi:app
set FLASK_DEBUG=1
.venv\Scripts\python.exe -m flask run --host 0.0.0.0 --port 5001
