@echo off
setlocal
title My Academia - Control Panel

:MENU
cls
echo ========================================================
echo          MY ACADEMIA - LOCAL CONTROL PANEL
echo ========================================================
echo.
echo   [1] Start All Services  (Backend, Gateway, AI, Web)
echo   [2] Stop All Services   (Close all ports & windows)
echo   [3] Restart All Services
echo   [4] Open App in Browser (http://localhost:8080)
echo   [5] Exit
echo.
echo ========================================================
set /p choice="Select an option (1-5): "

if "%choice%"=="1" (
    call "%~dp0start-all.bat"
    goto MENU
)
if "%choice%"=="2" (
    call "%~dp0stop-all.bat"
    goto MENU
)
if "%choice%"=="3" (
    call "%~dp0stop-all.bat"
    call "%~dp0start-all.bat"
    goto MENU
)
if "%choice%"=="4" (
    start "" "http://localhost:8080"
    goto MENU
)
if "%choice%"=="5" exit
goto MENU

