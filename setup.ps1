# =============================================
# ============== CODEX SETUP =================
# =============================================
# C.H.A.O.S. Application Setup Script for Windows
# Cross-platform setup script for Windows environments

# Create virtual environment for Python components if needed
if (-not (Test-Path -Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -U pip setuptools wheel
} else {
    Write-Host "Virtual environment already exists, activating..."
    .\venv\Scripts\Activate.ps1
}

# Install backend dependencies
Write-Host "Installing Backend dependencies..."
Push-Location -Path ".\Backend"
npm install
Pop-Location

# Install frontend dependencies
Write-Host "Installing Frontend dependencies..."
Push-Location -Path ".\FrontEnd"
npm install
Pop-Location

# Setup database if it doesn't exist
Write-Host "Setting up database..."
Push-Location -Path ".\Backend"
npx prisma generate
npx prisma migrate dev --name init
Pop-Location

Write-Host "Setup complete! Run the following commands to start the application:"
Write-Host "Backend: cd Backend && npm run dev"
Write-Host "Frontend: cd FrontEnd && npm run dev"
