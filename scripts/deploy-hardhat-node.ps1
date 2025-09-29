# PowerShell script to deploy Hardhat node on Windows
param(
    [int]$Port = 8545,
    [string]$Host = "127.0.0.1",
    [int]$TimeoutSeconds = 60
)

$ErrorActionPreference = "Stop"

# Set working directory to the contracts package
$ContractsDir = Join-Path $PSScriptRoot "..\packages\fhevm-hardhat-template"
Set-Location $ContractsDir

$HardhatNodeUrl = "http://${Host}:${Port}"

# Function to check if Hardhat node is running
function Test-HardhatNode {
    try {
        $body = @{
            jsonrpc = "2.0"
            method = "eth_chainId"
            params = @()
            id = 1
        } | ConvertTo-Json -Depth 3

        $response = Invoke-RestMethod -Uri $HardhatNodeUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
        return $true
    }
    catch {
        return $false
    }
}

# Check if Hardhat node is already running
if (Test-HardhatNode) {
    Write-Host "Hardhat Node is already running!" -ForegroundColor Green
    Write-Host "Deploying contracts..." -ForegroundColor Yellow
    npx hardhat deploy --network localhost
    exit 0
}

Write-Host "Starting Hardhat Node in background..." -ForegroundColor Yellow

# Start Hardhat node in background
$process = Start-Process -FilePath "npx" -ArgumentList "hardhat", "node" -PassThru -WindowStyle Hidden

Write-Host "Hardhat Node started with PID: $($process.Id). Waiting for it to be ready..." -ForegroundColor Yellow

# Wait for Hardhat node to be ready
$attempts = 0
while ($attempts -lt $TimeoutSeconds) {
    if (Test-HardhatNode) {
        Write-Host "Hardhat Node is ready!" -ForegroundColor Green
        break
    }
    Write-Host "Waiting for Hardhat Node... (Attempt $($attempts + 1)/$TimeoutSeconds)" -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    $attempts++
}

if ($attempts -eq $TimeoutSeconds) {
    Write-Host "Error: Hardhat Node did not start within $TimeoutSeconds seconds." -ForegroundColor Red
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Deploy contracts
Write-Host "Deploying contracts..." -ForegroundColor Yellow
try {
    npx hardhat deploy --network localhost
    $deployExitCode = $LASTEXITCODE
}
catch {
    Write-Host "Deploy failed: $_" -ForegroundColor Red
    $deployExitCode = 1
}

# Stop Hardhat node
Write-Host "Stopping Hardhat Node (PID: $($process.Id))..." -ForegroundColor Yellow
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue

# Wait a bit for cleanup
Start-Sleep -Seconds 2

exit $deployExitCode
