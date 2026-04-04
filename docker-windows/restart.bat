@echo off
echo ============================================
echo    PPTX Creator — Restarting
echo ============================================
echo.

docker-compose down
echo.
echo Rebuilding...
docker-compose up -d --build

echo.
echo ============================================
echo Restart complete.
echo Logs will resume in the start.bat window.
echo ============================================
timeout /t 3 /nobreak >nul
