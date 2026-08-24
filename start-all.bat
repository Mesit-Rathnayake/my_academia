@echo off
echo ==========================================
echo   Starting My Academia Local Stack...
echo ==========================================

start "Backend Server (8294)" cmd /k "cd /d %~dp0backend && npm start"
start "API Gateway (8080)" cmd /k "cd /d %~dp0api-gateway && node server.js"
start "AI Service (9142)" cmd /k "cd /d %~dp0ai-service && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 9142"
start "Frontend Web (4721)" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo All 4 services are starting in separate windows!
echo - Web Dashboard: http://localhost:4721
echo - API Gateway:   http://localhost:8080
echo ==========================================
