# PowerShell script to start Private Voting System
Write-Host "🗳️ Starting Private Voting System..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏗️ Starting Hardhat Node..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run hardhat-node" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for Hardhat Node to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🚀 Deploying PrivateVoting contract..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run deploy:private-voting" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for contract deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🌐 Starting frontend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Private Voting System is starting!" -ForegroundColor Green
Write-Host "🌐 Frontend will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 IMPORTANT: Copy the contract address from Terminal 2 and update it in:" -ForegroundColor Yellow
Write-Host "   packages/site/components/PrivateVotingDemo.tsx (line 8)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
