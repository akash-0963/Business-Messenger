@echo off
REM Start both frontend and backend in development mode
REM Windows batch script

echo.
echo 🚀 WA Messenger - Development Mode
echo ==================================================
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
  echo ❌ Error: backend\.env not found
  echo Please copy backend\.env.example to backend\.env and fill in your credentials
  pause
  exit /b 1
)

REM Check if frontend .env exists
if not exist "frontend\.env" (
  echo ❌ Error: frontend\.env not found
  echo Please copy frontend\.env.example to frontend\.env
  pause
  exit /b 1
)

echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
  echo ❌ Backend npm install failed
  pause
  exit /b 1
)

echo.
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
  echo ❌ Frontend npm install failed
  pause
  exit /b 1
)

cd ..

echo.
echo ✅ All dependencies installed
echo.
echo 🎯 Starting services...
echo ==================================================
echo 📡 Backend will start on: http://localhost:3000
echo 🖥️  Frontend will start on: http://localhost:5173
echo ==================================================
echo.
echo Two new terminals will open. Press Ctrl+C in each to stop.
echo.

REM Start backend in new terminal
cd backend
start "WhatsApp Backend" cmd /k "npm run dev"

REM Start frontend in new terminal
cd ..\frontend
start "WhatsApp Frontend" cmd /k "npm run dev"

cd ..

echo Services started in separate terminals!
echo Close this window when done.
pause
