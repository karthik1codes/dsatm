@echo off
echo Starting BrightWords Subscription API Backend Server...
echo.
cd /d "%~dp0dsatm\backend"
echo Changed to directory: %CD%
echo.
node server.js
pause


