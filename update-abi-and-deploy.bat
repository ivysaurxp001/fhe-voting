@echo off
echo Cleaning and recompiling contract...

cd packages\fhevm-hardhat-template
npx hardhat clean
npx hardhat compile

echo.
echo Deploying new contract...
npx hardhat run scripts/deploy.ts --network localhost

echo.
echo Please copy the new contract address and update it in the frontend files.
echo Also copy the ABI from artifacts/contracts/PrivateVoting.sol/PrivateVoting.json
echo to packages/site/abi/PrivateVotingABI.ts

pause
