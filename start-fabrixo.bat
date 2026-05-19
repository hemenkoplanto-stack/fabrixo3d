@echo off
title Fabrixo3D - One Click Start

echo.
echo ============================================
echo   Fabrixo3D - One Click Start
echo ============================================
echo.

node -v >nul 2>&1
IF ERRORLEVEL 1 (
    echo Node.js er ikke installert.
    pause
    exit /b
)

IF NOT EXIST package.json (
    echo package.json ble ikke funnet.
    pause
    exit /b
)

IF NOT EXIST node_modules (
    echo Installerer dependencies...
    call npm install
)

IF NOT EXIST .env (
    echo.
    echo Lag en .env fil med:
    echo STRIPE_SECRET_KEY=din_key
    echo SITE_URL=http://localhost:3000
    echo.
    pause
)

echo Starter server...
start http://localhost:3000
call npm start

pause