@echo off
echo ========================================
echo  UPDATE CONTRACT ADDRESS MANUALLY
echo ========================================

set CONTRACT_ADDRESS=0x90791c8472d9262395d72c76572c8d6728F0dfF2

echo.
echo Updating contract address to: %CONTRACT_ADDRESS%

echo.
echo [1/4] Updating PrivateVotingAddresses.ts...
cd packages\site
echo export const PrivateVotingAddresses = { > abi\PrivateVotingAddresses.ts
echo   "hardhat": "%CONTRACT_ADDRESS%", >> abi\PrivateVotingAddresses.ts
echo   "localhost": "%CONTRACT_ADDRESS%", >> abi\PrivateVotingAddresses.ts
echo   "sepolia": "0x0000000000000000000000000000000000000000", >> abi\PrivateVotingAddresses.ts
echo } as const; >> abi\PrivateVotingAddresses.ts

echo.
echo [2/4] Updating FHEVMPollTest.tsx...
echo const CONTRACT_ADDRESS = '%CONTRACT_ADDRESS%'; > components\FHEVMPollTest_new.tsx
type components\FHEVMPollTest.tsx | findstr /v "const CONTRACT_ADDRESS" >> components\FHEVMPollTest_new.tsx
move components\FHEVMPollTest_new.tsx components\FHEVMPollTest.tsx

echo.
echo [3/4] Updating PrivateVotingDemo.tsx...
echo const PRIVATE_VOTING_CONTRACT = '%CONTRACT_ADDRESS%'; > components\PrivateVotingDemo_new.tsx
type components\PrivateVotingDemo.tsx | findstr /v "const PRIVATE_VOTING_CONTRACT" >> components\PrivateVotingDemo_new.tsx
move components\PrivateVotingDemo_new.tsx components\PrivateVotingDemo.tsx

echo.
echo [4/4] Updating ContractTest.tsx...
echo const CONTRACT_ADDRESS = '%CONTRACT_ADDRESS%'; > components\ContractTest_new.tsx
type components\ContractTest.tsx | findstr /v "const CONTRACT_ADDRESS" >> components\ContractTest_new.tsx
move components\ContractTest_new.tsx components\ContractTest.tsx

echo.
echo ========================================
echo  UPDATE COMPLETED SUCCESSFULLY!
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
