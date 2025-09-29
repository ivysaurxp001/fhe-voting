@echo off
echo ========================================
echo  DEPLOY CONTRACT AND UPDATE FRONTEND
echo ========================================

echo.
echo [1/6] Cleaning previous build...
cd packages\fhevm-hardhat-template
call npx hardhat clean
if %errorlevel% neq 0 (
    echo ERROR: Failed to clean
    pause
    exit /b 1
)

echo.
echo [2/6] Compiling contract...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile
    pause
    exit /b 1
)

echo.
echo [3/6] Deploying contract...
call npx hardhat deploy:private-voting --network localhost
if %errorlevel% neq 0 (
    echo ERROR: Failed to deploy
    pause
    exit /b 1
)

echo.
echo [4/6] Extracting contract address...
echo Contract address: 0x90791c8472d9262395d72c76572c8d6728F0dfF2
set CONTRACT_ADDRESS=0x90791c8472d9262395d72c76572c8d6728F0dfF2

echo.
echo [5/6] Updating frontend contract addresses...
cd ..\site

rem Update PrivateVotingAddresses.ts
echo export const PrivateVotingAddresses = { > abi\PrivateVotingAddresses.ts
echo   "hardhat": "%CONTRACT_ADDRESS%", >> abi\PrivateVotingAddresses.ts
echo   "localhost": "%CONTRACT_ADDRESS%", >> abi\PrivateVotingAddresses.ts
echo   "sepolia": "0x0000000000000000000000000000000000000000", >> abi\PrivateVotingAddresses.ts
echo } as const; >> abi\PrivateVotingAddresses.ts

rem Update all component files manually
echo Updating FHEVMPollTest.tsx...
findstr /v "0x[a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9]" components\FHEVMPollTest.tsx > temp.txt
echo const CONTRACT_ADDRESS = '%CONTRACT_ADDRESS%'; > components\FHEVMPollTest.tsx
type temp.txt >> components\FHEVMPollTest.tsx
del temp.txt

echo Updating PrivateVotingDemo.tsx...
findstr /v "0x[a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9]" components\PrivateVotingDemo.tsx > temp.txt
echo const PRIVATE_VOTING_CONTRACT = '%CONTRACT_ADDRESS%'; > components\PrivateVotingDemo.tsx
type temp.txt >> components\PrivateVotingDemo.tsx
del temp.txt

echo Updating ContractTest.tsx...
findstr /v "0x[a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9]" components\ContractTest.tsx > temp.txt
echo const CONTRACT_ADDRESS = '%CONTRACT_ADDRESS%'; > components\ContractTest.tsx
type temp.txt >> components\ContractTest.tsx
del temp.txt

echo.
echo [6/6] Generating ABI...
cd ..\fhevm-hardhat-template
call npx hardhat compile --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to regenerate ABI
    pause
    exit /b 1
)

echo.
echo ========================================
echo  DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Contract Address: %CONTRACT_ADDRESS%
echo.
echo Next steps:
echo 1. Refresh your frontend page
echo 2. Test contract connection
echo 3. Try creating a poll
echo.
pause
