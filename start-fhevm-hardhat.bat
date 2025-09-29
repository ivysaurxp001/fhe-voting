@echo off
echo Starting FHEVM Hardhat Node...
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
echo Starting Hardhat node with FHEVM support...
echo This will start a local blockchain on http://localhost:8545
echo.
echo Press Ctrl+C to stop the node
echo.

npx hardhat node

pause
