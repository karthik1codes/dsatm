@echo off
echo ========================================
echo Starting BrightWords Full Stack Application
echo ========================================
echo.
echo This will start:
echo   - Backend Server (Port 3000)
echo   - Frontend Server (Port 8000)
echo.
echo Press Ctrl+C in each window to stop the servers
echo ========================================
echo.

REM Start backend server in a new window
echo Starting Backend Server...
start "BrightWords Backend" cmd /k "cd /d %~dp0backend && node server.js"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend server in a new window
echo Starting Frontend Server...
start "BrightWords Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo Both servers are starting in separate windows
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8000
echo ========================================
echo.
pause

