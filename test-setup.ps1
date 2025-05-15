# =============================================
# ============ CODEX TEST SETUP ==============
# =============================================
# ##### C.H.A.O.S TEST ENVIRONMENT SCRIPT ####
# ##### SECURE EXECUTION & DEPLOYMENT  ######
# #########################################

# Activate Python virtual environment
if (Test-Path -Path "venv") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -U pip setuptools wheel
}

# Check for PostgreSQL
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne "Running") {
        Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service $pgService
    } else {
        Write-Host "PostgreSQL is already running" -ForegroundColor Green
    }
} else {
    Write-Host "PostgreSQL service not found. Please ensure PostgreSQL is installed." -ForegroundColor Red
    Write-Host "You can download it from: https://www.postgresql.org/download/windows/" -ForegroundColor Red
    Write-Host "Continuing anyway, but database operations might fail." -ForegroundColor Yellow
}

# Setup database
Write-Host "Setting up database for testing..." -ForegroundColor Cyan
Push-Location -Path ".\Backend"

# Check if we need to install dependencies
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Reset database and run migrations
Write-Host "Resetting database and running migrations..." -ForegroundColor Cyan
npx prisma migrate reset --force

# Seed the database with test data
Write-Host "Seeding database with test data..." -ForegroundColor Cyan
npm run seed

Pop-Location

# Setup frontend
Push-Location -Path ".\FrontEnd"

# Check if we need to install dependencies
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Pop-Location

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "     C.H.A.O.S. Test Setup Complete  " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Test accounts available:" -ForegroundColor Cyan
Write-Host "- Admin: admin / password123" -ForegroundColor White
Write-Host "- Alice: alice / password123" -ForegroundColor White
Write-Host "- Bob: bob / password123" -ForegroundColor White
Write-Host "- Carol: carol / password123" -ForegroundColor White
Write-Host "- Dave: dave / password123" -ForegroundColor White
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. Run the backend: cd Backend && npm run dev" -ForegroundColor White
Write-Host "2. Run the frontend: cd FrontEnd && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use the run.ps1 script to start both services: ./run.ps1" -ForegroundColor White
Write-Host ""
