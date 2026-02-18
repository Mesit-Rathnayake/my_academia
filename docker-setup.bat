@echo off
REM My Academia - Docker Setup Script for Windows
REM This script helps you quickly set up the application on Windows

echo ==================================
echo My Academia - Docker Setup
echo ==================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    echo Please install Docker Compose or update Docker Desktop
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo [OK] Docker Compose is installed
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARN] .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo [OK] .env file created
    echo.
    echo [WARN] Please edit .env file and set your configuration
    echo   - JWT_SECRET: Set a strong secret key
    echo   - REACT_APP_API_URL: Set your backend URL
    echo.
    pause
)

:menu
echo.
echo What would you like to do?
echo 1) Build and start all services
echo 2) Start services (without rebuilding)
echo 3) Stop all services
echo 4) View logs
echo 5) Clean up (remove containers and volumes)
echo 6) Check service status
echo 7) Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto build
if "%choice%"=="2" goto start
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto clean
if "%choice%"=="6" goto status
if "%choice%"=="7" goto end
echo Invalid choice
goto menu

:build
echo.
echo Building and starting services...
docker compose up -d --build
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    goto menu
)
echo.
echo [OK] Services started successfully!
echo.
echo Access the application at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   MongoDB:  localhost:27017
echo.
echo To view logs, run: docker compose logs -f
pause
goto menu

:start
echo.
echo Starting services...
docker compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    goto menu
)
echo.
echo [OK] Services started successfully!
pause
goto menu

:stop
echo.
echo Stopping services...
docker compose down
echo.
echo [OK] Services stopped
pause
goto menu

:logs
echo.
echo Showing logs (Ctrl+C to exit)...
docker compose logs -f
goto menu

:clean
echo.
echo [WARN] This will remove all containers, networks, and volumes
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    docker compose down -v
    echo.
    echo [OK] Cleanup completed
) else (
    echo Cleanup cancelled
)
pause
goto menu

:status
echo.
echo Service Status:
docker compose ps
echo.
echo Container Health:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
pause
goto menu

:end
echo.
echo Goodbye!
exit /b 0
