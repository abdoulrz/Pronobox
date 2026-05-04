@echo off
echo Starting PronosBox...
echo.
echo [1/2] Opening Frontend (Vite) in a new window...
start cmd /k "npm run dev"
echo.
echo [2/2] Starting Backend (Express)...
echo To stop, close the terminal windows.
node src/server.js
pause
