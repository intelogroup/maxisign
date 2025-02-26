@echo off
echo ===================================
echo Building MaxiSign for Production
echo ===================================

echo Cleaning previous build...
if exist "build" rd /s /q "build"

echo Installing dependencies...
call npm install

echo Building application...
call npm run build

echo Build complete! Files are in the 'build' directory.
echo ===================================
echo To deploy, copy the contents of the 'build' directory to your web server.
echo ===================================
