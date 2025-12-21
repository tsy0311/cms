# PowerShell script to install all dependencies for the CMS E-Commerce project
# Run this script from the root directory: .\install-dependencies.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing All Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install admin dependencies
Write-Host "Installing admin dependencies..." -ForegroundColor Yellow
Set-Location ../admin
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install admin dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Admin dependencies installed" -ForegroundColor Green
Write-Host ""

# Return to root
Set-Location ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Dependencies Installed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Create a .env file in the backend directory (optional)" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start all services" -ForegroundColor White
Write-Host ""

