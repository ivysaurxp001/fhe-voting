Write-Host "Recompiling and deploying updated contract..." -ForegroundColor Green
Write-Host ""

Set-Location packages\fhevm-hardhat-template

Write-Host "Cleaning previous build..." -ForegroundColor Yellow
npx hardhat clean

Write-Host "Compiling contract..." -ForegroundColor Yellow
npx hardhat compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Compilation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Deploying updated contract..." -ForegroundColor Green
npx hardhat deploy:private-voting --network localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Contract recompiled and deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The new contract address should be displayed above." -ForegroundColor Cyan
    Write-Host "Copy this address and update it in your frontend if needed." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
