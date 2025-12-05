@echo off
echo ========================================
echo Restarting BrightWords Backend Server
echo ========================================
echo.
echo Stopping any existing server instances...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq BrightWords Backend*" 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting Backend Server...
cd /d "%~dp0dsatm\backend"
start "BrightWords Backend" cmd /k "node server.js"
echo.
echo ========================================
echo Backend server is starting...
echo Check the new window for server status
echo ========================================
timeout /t 3 /nobreak >nul


