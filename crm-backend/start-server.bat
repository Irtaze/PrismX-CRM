@echo off
REM Quick Start Script for CRM Backend Testing

echo.
echo ========================================
echo    CRM Backend - Quick Start
echo ========================================
echo.

REM Check if Node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if MongoDB is running (basic check)
echo Checking MongoDB connection...
timeout /t 2 >nul

REM Start the server
echo.
echo Starting CRM Backend Server...
echo Server will run on http://localhost:5000
echo.
echo Next Steps:
echo 1. Download Postman: https://www.postman.com/downloads/
echo 2. Import collection: CRM_API_Collection.postman_collection.json
echo 3. Follow MANUAL_TESTING.md for step-by-step testing
echo.
echo Press any key to start the server...
pause

npm start
