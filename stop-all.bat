@echo off
title My Academia - Stopping Stack
echo ========================================================
echo   Stopping All My Academia Services...
echo ========================================================
echo.

REM Close the 4 terminal windows by title if open
taskkill /FI "WINDOWTITLE eq MyAcademia - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq MyAcademia - API Gateway*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq MyAcademia - AI Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq MyAcademia - Frontend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend Server (8294)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq API Gateway (8080)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AI Service (9142)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Web (4721)*" /T /F >nul 2>&1

REM Also free ports 8294, 8080, 9142, and 4721 if any background process is still listening
for %%P in (8294 8080 9142 4721) do (
    for /f "tokens=5" %%A in ('netstat -aon ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        echo Stopping process on port %%P (PID: %%A)...
        taskkill /F /PID %%A /T >nul 2>&1
    )
)

echo.
echo All My Academia services have been stopped cleanly!
echo ========================================================
timeout /t 3

