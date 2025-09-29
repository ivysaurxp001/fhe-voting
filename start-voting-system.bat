@echo off
echo 🗳️ Starting Private Voting System...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🏗️ Starting Hardhat Node...
start "Hardhat Node" cmd /k "cd packages/fhevm-hardhat-template && npx hardhat node"

echo.
echo ⏳ Waiting for Hardhat Node to start...
timeout /t 10 /nobreak > nul

echo.
echo 🚀 Deploying PrivateVoting contract...
cd packages/fhevm-hardhat-template
call npx hardhat run tasks/PrivateVoting.ts --network localhost
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy contract
    pause
    exit /b 1
)

echo.
echo ✅ Contract deployed successfully!
echo.
echo 📝 IMPORTANT: Copy the contract address and update it in:
echo    - packages/site/components/PrivateVotingDemo.tsx (line 8)
echo    - packages/site/abi/PrivateVotingAddresses.ts
echo.
echo 🌐 Starting frontend...
cd ../site
start "Frontend" cmd /k "npm run dev"

echo.
echo 🎉 Private Voting System is starting!
echo 🌐 Frontend will be available at http://localhost:3000
echo.
pause
