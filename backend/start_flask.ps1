cd c:\Users\preml\Desktop\office\vms\backend
$env:FLASK_APP = "wsgi:app"
$env:FLASK_DEBUG = "1"
& ".venv\Scripts\python.exe" -m flask run --host 0.0.0.0 --port 5001
