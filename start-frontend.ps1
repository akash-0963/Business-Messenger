# Start Frontend Server
Write-Host "Starting WhatsApp Broadcast Portal - Frontend" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "frontend"

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "Dependencies not installed. Installing..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting frontend development server..." -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser" -ForegroundColor Green
Write-Host ""
npm run dev
