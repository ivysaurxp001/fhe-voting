Write-Host "Deploying Private Voting Contract..." -ForegroundColor Green
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
Write-Host "Deploying contract to localhost..." -ForegroundColor Green
Write-Host "This will deploy the PrivateVoting contract to your local Hardhat node." -ForegroundColor Cyan
Write-Host ""

try {
    npx hardhat deploy:private-voting --network localhost
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The contract address should be displayed above." -ForegroundColor Cyan
        Write-Host "Copy this address and update it in your frontend if needed." -ForegroundColor Yellow
    } else {
        throw "Deployment failed"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
