@echo off
cd /d c:\Users\HP\Desktop\dineconnect

echo ====================================
echo Removing old node_modules and lock file...
echo ====================================
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json

echo.
echo ====================================
echo Running npm install (this may take a minute)...
echo ====================================
call npm install

echo.
echo ====================================
echo Checking if lucide-react was installed...
echo ====================================
if exist node_modules\lucide-react (
    echo ✓ lucide-react is installed!
) else (
    echo ✗ lucide-react is MISSING
    exit /b 1
)

echo.
echo ====================================
echo Starting dev server...
echo ====================================
call npm run dev
