@echo off
REM Clean installation and run script for DineConnect

cd /d c:\Users\HP\Desktop\dineconnect

echo.
echo ========================================
echo DineConnect - Clean Install & Run
echo ========================================
echo.

echo Removing old node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ Removed node_modules
)

echo Removing old package-lock.json...
if exist package-lock.json (
    del /q package-lock.json
    echo ✓ Removed package-lock.json
)

echo.
echo Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ✗ npm install failed!
    pause
    exit /b 1
)
echo ✓ npm install complete

echo.
echo Checking for required packages...
if not exist node_modules\react (
    echo ✗ react not found!
    pause
    exit /b 1
)
echo ✓ react installed

if not exist node_modules\react-router-dom (
    echo ✗ react-router-dom not found!
    pause
    exit /b 1
)
echo ✓ react-router-dom installed

echo.
echo ========================================
echo Starting dev server...
echo ========================================
echo.
call npm run dev

pause
