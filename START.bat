@echo off
title PG Rent Manager - Starting...
color 0A

echo ============================================
echo    PG Rent Manager - Starting All Services
echo ============================================
echo.

echo [1/2] Starting Backend (NestJS API on port 4000)...
start "PG Rent Manager - Backend" cmd /k "cd /d C:\Users\gobin\OneDrive\Desktop\pgrent\backend && npx nest start --watch"

timeout /t 5 /nobreak > nul

echo [2/2] Starting Frontend (Next.js on port 3000)...
start "PG Rent Manager - Frontend" cmd /k "cd /d C:\Users\gobin\OneDrive\Desktop\pgrent\frontend && npm run dev"

timeout /t 8 /nobreak > nul

echo.
echo ============================================
echo  Both servers are starting!
echo  Open your browser at: http://localhost:3000
echo ============================================
echo.

start "" "http://localhost:3000"

pause
