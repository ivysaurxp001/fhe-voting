#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY CONTRACT AND UPDATE FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/6] Cleaning previous build..." -ForegroundColor Yellow
Set-Location packages/fhevm-hardhat-template
npx hardhat clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to clean" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/6] Compiling contract..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to compile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/6] Deploying contract..." -ForegroundColor Yellow
$deployOutput = npx hardhat deploy:private-voting --network localhost 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy" -ForegroundColor Red
    Write-Host $deployOutput
    exit 1
}

Write-Host $deployOutput

Write-Host ""
Write-Host "[4/6] Extracting contract address..." -ForegroundColor Yellow
$contractAddress = ""
if ($deployOutput -match "PrivateVoting deployed to: (0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
    Write-Host "Contract address: $contractAddress" -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not extract contract address from deploy output" -ForegroundColor Red
    Write-Host "Deploy output: $deployOutput"
    exit 1
}

Write-Host ""
Write-Host "[5/6] Updating frontend contract addresses..." -ForegroundColor Yellow
Set-Location ../site

# Update PrivateVotingAddresses.ts
$addressesContent = @"
export const PrivateVotingAddresses = {
  "hardhat": "$contractAddress",
  "localhost": "$contractAddress",
  "sepolia": "0x0000000000000000000000000000000000000000",
} as const;
"@
$addressesContent | Out-File -FilePath "abi/PrivateVotingAddresses.ts" -Encoding UTF8

# Update all component files
$files = @(
    "components/FHEVMPollTest.tsx",
    "components/PrivateVotingDemo.tsx", 
    "components/ContractTest.tsx",
    "components/ContractABITest.tsx",
    "components/ContractCodeTest.tsx",
    "components/SimpleContractTest.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace '0x[a-fA-F0-9]{40}', $contractAddress
        $content | Out-File -FilePath $file -Encoding UTF8
        Write-Host "Updated $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[6/6] Generating ABI..." -ForegroundColor Yellow
Set-Location ../fhevm-hardhat-template
npx hardhat compile --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to regenerate ABI" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Contract Address: $contractAddress" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Refresh your frontend page" -ForegroundColor White
Write-Host "2. Test contract connection" -ForegroundColor White
Write-Host "3. Try creating a poll" -ForegroundColor White
Write-Host ""
