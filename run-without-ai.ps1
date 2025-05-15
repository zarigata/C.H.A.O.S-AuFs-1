# =============================================
# ========== CODEX STARTUP SCRIPT ============
# =============================================
# ########## C.H.A.O.S STARTER v1.0 ##########
# #### MINIMAL CONFIGURATION FOR TESTING #####
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

# Kill existing Node.js processes if they exist
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force
    Start-Sleep -Seconds 2
}

# Start PostgreSQL if it's not running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne "Running") {
        Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service $pgService
        Start-Sleep -Seconds 2
    } else {
        Write-Host "PostgreSQL is already running" -ForegroundColor Green
    }
}

# Start backend in a new window
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '.\Backend'; npm run dev"
Start-Sleep -Seconds 5

# Start frontend in a new window
Write-Host "Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '.\FrontEnd'; npm run dev"

Write-Host ""
Write-Host "C.H.A.O.S. is now running!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "- admin / password123" -ForegroundColor White
Write-Host "- alice / password123" -ForegroundColor White
Write-Host "- bob / password123" -ForegroundColor White
Write-Host "- carol / password123" -ForegroundColor White
Write-Host "- dave / password123" -ForegroundColor White
