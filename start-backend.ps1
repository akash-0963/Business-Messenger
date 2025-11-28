# Start Backend Server
Write-Host "Starting WhatsApp Broadcast Portal - Backend" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "backend"

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create backend\.env with your configuration" -ForegroundColor Yellow
    Write-Host "You can copy from .env.example" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Dependencies not installed. Installing..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting backend server on port 5000..." -ForegroundColor Green
Write-Host ""
npm run dev
