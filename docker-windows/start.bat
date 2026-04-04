@echo off
title PPTX Creator — Log
echo ============================================
echo    PPTX Creator — Log Window
echo ============================================
echo.
echo This window shows live container logs.
echo Use restart.bat to rebuild/restart.
echo Press Ctrl+C to stop watching logs.
echo.

:watchlogs
echo Waiting for containers...
docker-compose ps --services --filter "status=running" 2>nul | findstr /r "." >nul
if %errorlevel% neq 0 (
    echo Containers not running. Starting...
    docker-compose up -d --build
)

echo.
echo ============================================
echo Logs streaming — http://localhost:8090
echo ============================================
echo.

docker-compose logs -f

echo.
echo Log stream interrupted. Reconnecting in 3s...
timeout /t 3 /nobreak >nul
goto watchlogs
