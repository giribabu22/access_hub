@echo off
echo ========================================
echo Testing VMS Backend Server
echo ========================================
echo.

echo 1. Testing Health Endpoint...
echo.
curl http://localhost:5000/api/health
echo.
echo.

echo 2. Testing Login (assuming user exists)...
echo.
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"prem@test.com\",\"password\":\"Test@1234\"}"
echo.
echo.

echo 3. Testing Stats Endpoint (without auth - should fail with 401)...
echo.
curl http://localhost:5000/api/stats/overview
echo.
echo.

echo ========================================
echo Test Complete!
echo ========================================
pause
