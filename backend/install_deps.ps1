# Install marshmallow dependency
Write-Host "Installing marshmallow..." -ForegroundColor Green
pip install marshmallow==3.20.1

Write-Host "`nDependency installed successfully!" -ForegroundColor Green
Write-Host "You can now run: flask run --host 0.0.0.0 --port 5001" -ForegroundColor Cyan
