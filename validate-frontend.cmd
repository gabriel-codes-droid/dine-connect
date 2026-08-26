@echo off
cd /d C:\Users\HP\OneDrive\Desktop\dineconnect
frontend\node_modules\.bin\tsc.cmd -b --pretty false > frontend\tsc-validation.log 2>&1
echo %ERRORLEVEL% > frontend\tsc-exit.txt
