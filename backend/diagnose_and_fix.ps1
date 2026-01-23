# VMS Backend - Diagnose and Fix Issues
# Run this script to diagnose and fix common startup issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VMS Backend - Diagnostic Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment is activated
if ($env:VIRTUAL_ENV) {
    Write-Host "✓ Virtual environment is activated: $env:VIRTUAL_ENV" -ForegroundColor Green
}
else {
    Write-Host "⚠ Virtual environment NOT activated" -ForegroundColor Yellow
    Write-Host "  Please activate it first:" -ForegroundColor Yellow
    Write-Host "  ..\.venv-1\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host ""
}

Write-Host "Step 1: Testing Python import..." -ForegroundColor Cyan
python -c "from app import create_app; print('✓ Import successful')" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Import failed. Checking dependencies..." -ForegroundColor Red
    Write-Host ""
    
    Write-Host "Installing missing dependencies..." -ForegroundColor Yellow
    pip install marshmallow==3.20.1
    Write-Host ""
}

Write-Host "Step 2: Running diagnostic script..." -ForegroundColor Cyan
python test_startup.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting Flask server..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    # Start Flask server
    flask run --host 0.0.0.0 --port 5001
}
else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ Issues detected. Please review errors above." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "1. Install dependencies: pip install -r requirements.txt" -ForegroundColor White
    Write-Host "2. Run migrations: flask db upgrade" -ForegroundColor White
    Write-Host "3. Check .env file exists and has correct values" -ForegroundColor White
    Write-Host ""
}
