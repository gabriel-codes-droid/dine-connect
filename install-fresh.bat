@echo off
REM Clean install script - removes node_modules and reinstalls everything

cd c:\Users\HP\Desktop\dineconnect

echo Removing old node_modules...
rmdir /s /q node_modules 2>nul
if exist package-lock.json del package-lock.json

echo.
echo Installing fresh dependencies...
call npm install

echo.
echo ✓ Installation complete!
echo.
echo Starting dev server...
echo.
call npm run dev
