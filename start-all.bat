@echo off
title My Academia - Starting Stack
echo ========================================================
echo   Starting My Academia Local Stack...
echo ========================================================
echo.

echo [1/5] Preparing database and seeding initial data...
cd /d "%~dp0backend"
call npx prisma db push --skip-generate >nul 2>&1
call node seed.js

echo [2/5] Starting Backend Server (Port 8294)...
start "MyAcademia - Backend (8294)" cmd /k "cd /d "%~dp0backend" && npm start"

echo [3/5] Starting API Gateway (Port 8080)...
start "MyAcademia - API Gateway (8080)" cmd /k "cd /d "%~dp0api-gateway" && node server.js"

echo [4/5] Starting AI Service (Port 9142)...
start "MyAcademia - AI Service (9142)" cmd /k "cd /d "%~dp0ai-service" && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 9142"

echo [5/5] Starting Frontend Web (Port 4721)...
start "MyAcademia - Frontend (4721)" cmd /k "cd /d "%~dp0frontend" && set BROWSER=none&& npm start"

echo.
echo Waiting 5 seconds for services to warm up before opening browser...
timeout /t 5 /nobreak >nul
start "" "http://localhost:8080"

echo ========================================================
echo   All 4 services are running!
echo   - Main App (via Gateway): http://localhost:8080
echo   - Direct Frontend:        http://localhost:4721
echo   - Login Credentials:      EG/2022/5440  /  Mesith1234@#
echo   - To stop everything:     Double-click stop-all.bat
echo ========================================================
pause
