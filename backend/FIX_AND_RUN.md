# Quick Fix: Install Missing Dependency and Run Server

## The Issue
The Flask server failed to start because `marshmallow` package is not installed in your virtual environment.

## Solution

Run these commands in your PowerShell terminal (you should already be in `vms_backend` directory):

### Step 1: Install marshmallow
```powershell
pip install marshmallow==3.20.1
```

### Step 2: Run the Flask server
```powershell
flask run --host 0.0.0.0 --port 5001
```

## Complete Command Sequence

If you need to start fresh, run this complete sequence:

```powershell
# Navigate to vms_backend directory
cd C:\Users\preml\Desktop\office\vms\vms_backend

# Make sure virtual environment is activated (should show (.venv-1) in prompt)
# If not activated, run:
# ..\.venv-1\Scripts\Activate.ps1

# Install the missing dependency
pip install marshmallow==3.20.1

# Run the server
flask run --host 0.0.0.0 --port 5001
```

## Expected Output

After running the server, you should see:
```
 * Serving Flask app 'wsgi'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5001
 * Running on http://192.168.x.x:5001
```

## Access the APIs

Once the server is running:
- **Swagger Documentation:** http://localhost:5001/api/docs/
- **Health Check:** http://localhost:5001/api/health
- **API Base URL:** http://localhost:5001/api/v2/

## Troubleshooting

### If pip install fails:
```powershell
# Update pip first
python -m pip install --upgrade pip

# Then install marshmallow
pip install marshmallow==3.20.1
```

### If virtual environment is not activated:
```powershell
# Go to vms directory (parent of vms_backend)
cd C:\Users\preml\Desktop\office\vms

# Activate virtual environment
.\.venv-1\Scripts\Activate.ps1

# Go back to vms_backend
cd vms_backend

# Install and run
pip install marshmallow==3.20.1
flask run --host 0.0.0.0 --port 5001
```

### If you still get import errors:
```powershell
# Install all requirements
pip install -r requirements.txt

# Then run
flask run --host 0.0.0.0 --port 5001
```

---

**That's it!** Your CRUD APIs are ready to use once the server starts. 🚀
