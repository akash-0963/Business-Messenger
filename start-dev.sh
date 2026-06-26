#!/bin/bash

# Start both frontend and backend in development mode
# Requires: Node.js, npm, MongoDB running locally (or MongoDB Atlas connection in .env)

echo "🚀 WhatsApp Marketing Broadcast - Development Mode"
echo "=================================================="

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
  echo "❌ Error: backend/.env not found"
  echo "Please copy backend/.env.example to backend/.env and fill in your credentials"
  exit 1
fi

# Check if frontend .env exists
if [ ! -f "frontend/.env" ]; then
  echo "❌ Error: frontend/.env not found"
  echo "Please copy frontend/.env.example to frontend/.env"
  exit 1
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
  echo "❌ Backend npm install failed"
  exit 1
fi

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
  echo "❌ Frontend npm install failed"
  exit 1
fi

cd ..

echo ""
echo "✅ All dependencies installed"
echo ""
echo "🎯 Starting services..."
echo "=================================================="
echo "📡 Backend will start on: http://localhost:3000"
echo "🖥️  Frontend will start on: http://localhost:5173"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
