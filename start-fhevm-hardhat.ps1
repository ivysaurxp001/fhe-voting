Write-Host "Starting FHEVM Hardhat Node..." -ForegroundColor Green
Write-Host ""

Set-Location packages\fhevm-hardhat-template

Write-Host "Checking if Hardhat is installed..." -ForegroundColor Yellow
try {
    npx hardhat --version
    if ($LASTEXITCODE -ne 0) {
        throw "Hardhat not found"
    }
} catch {
    Write-Host "Error: Hardhat not found. Please install dependencies first." -ForegroundColor Red
    Write-Host "Run: npm install" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting Hardhat node with FHEVM support..." -ForegroundColor Green
Write-Host "This will start a local blockchain on http://localhost:8545" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the node" -ForegroundColor Yellow
Write-Host ""

npx hardhat node

Read-Host "Press Enter to exit"
