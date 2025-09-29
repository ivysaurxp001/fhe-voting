@echo off
echo ========================================
echo Deploying new contract with updated ABI
echo ========================================

cd packages\fhevm-hardhat-template

echo.
echo Step 1: Cleaning previous build...
npx hardhat clean

echo.
echo Step 2: Compiling contract...
npx hardhat compile

echo.
echo Step 3: Deploying new contract...
npx hardhat run scripts/deploy.ts --network localhost

echo.
echo ========================================
echo DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Please copy the new contract address above and update it in:
echo - packages/site/abi/PrivateVotingAddresses.ts
echo - All frontend components that use hardcoded addresses
echo.
echo Then restart your Next.js dev server to load the new contract.
echo.
pause
