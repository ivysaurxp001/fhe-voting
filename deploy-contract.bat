@echo off
echo Deploying Private Voting Contract...
echo.

cd packages\fhevm-hardhat-template

echo Checking if Hardhat is installed...
npx hardhat --version
if %errorlevel% neq 0 (
    echo Error: Hardhat not found. Please install dependencies first.
    echo Run: npm install
    pause
    exit /b 1
)

echo.
echo Deploying contract to localhost...
echo This will deploy the PrivateVoting contract to your local Hardhat node.
echo.

npx hardhat deploy:private-voting --network localhost

if %errorlevel% equ 0 (
    echo.
    echo ✅ Contract deployed successfully!
    echo.
    echo The contract address should be displayed above.
    echo Copy this address and update it in your frontend if needed.
) else (
    echo.
    echo ❌ Contract deployment failed!
    echo Please check the error messages above.
)

echo.
pause
