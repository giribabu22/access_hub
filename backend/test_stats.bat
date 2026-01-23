@echo off
echo Testing Stats Overview API
echo ================================

REM First get a token
echo.
echo Step 1: Login to get token
echo --------------------------
curl -X POST http://localhost:5001/api/v2/auth/login -H "Content-Type: application/json" -d "{\"username\":\"prem\",\"password\":\"Admin@123\"}" > token_response.json 2>&1

echo.
echo Token response saved to token_response.json
echo.

REM Extract token manually (you'll need to copy it)
echo Please copy the access_token from token_response.json and run:
echo curl -X GET http://localhost:5001/api/stats/overview -H "Authorization: Bearer YOUR_TOKEN_HERE"
