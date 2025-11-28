# WhatsApp Broadcast Portal - Setup Script
# Run this script to set up the project

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "WhatsApp Broadcast Portal Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is available
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ PostgreSQL not found in PATH. Make sure PostgreSQL is installed." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path "..\frontend"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Set-Location -Path ".."

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Environment Configuration" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Create backend .env if it doesn't exist
Write-Host ""
if (!(Test-Path "backend\.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✓ Created backend\.env - Please edit with your credentials" -ForegroundColor Green
} else {
    Write-Host "✓ backend\.env already exists" -ForegroundColor Green
}

# Create frontend .env if it doesn't exist
if (!(Test-Path "frontend\.env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "✓ Created frontend\.env" -ForegroundColor Green
} else {
    Write-Host "✓ frontend\.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure environment variables:" -ForegroundColor White
Write-Host "   - Edit backend\.env with WhatsApp API credentials" -ForegroundColor Gray
Write-Host "   - Update DATABASE_URL with your PostgreSQL credentials" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create PostgreSQL database:" -ForegroundColor White
Write-Host "   psql -U postgres -c 'CREATE DATABASE whatsapp_portal;'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run Prisma migrations:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npx prisma generate" -ForegroundColor Gray
Write-Host "   npx prisma migrate dev --name init" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the application:" -ForegroundColor White
Write-Host "   Terminal 1: cd backend; npm run dev" -ForegroundColor Gray
Write-Host "   Terminal 2: cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open browser:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see README.md or QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
