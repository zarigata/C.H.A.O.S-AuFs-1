# =============================================
# ============== CODEX RUNTIME ===============
# =============================================
# C.H.A.O.S. Application Run Script for Windows
# Starts both backend and frontend services

# Activate Python virtual environment
if (Test-Path -Path "venv") {
    Write-Host "Activating virtual environment..."
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Virtual environment not found, please run setup.ps1 first"
    exit 1
}

# Start PostgreSQL if it's not running and we're using a local database
$envContent = Get-Content -Path ".\Backend\.env" -ErrorAction SilentlyContinue
$usingLocalDB = $envContent -match "localhost"

if ($usingLocalDB) {
    Write-Host "Checking PostgreSQL status..."
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    
    if ($pgService -and $pgService.Status -ne "Running") {
        Write-Host "Starting PostgreSQL service..."
        Start-Service $pgService
    }
}

# Start backend and frontend in separate windows
Write-Host "Starting C.H.A.O.S. application..."

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '.\Backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '.\FrontEnd'; npm run dev"

Write-Host "C.H.A.O.S. is now running!"
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the services"
