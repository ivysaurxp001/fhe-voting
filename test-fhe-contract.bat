@echo off
echo 🔧 Testing FHE Contract with correct library...
echo.

echo 📦 Installing @fhevm/solidity dependency...
cd packages/fhevm-hardhat-template
npm i @fhevm/solidity

echo.
echo 🧹 Cleaning Hardhat cache...
npx hardhat clean

echo.
echo 🔨 Compiling contract with FHE.sol...
npx hardhat compile

if %errorlevel% neq 0 (
    echo ❌ Compilation failed!
    echo.
    echo 📝 Check the error messages above
    echo Make sure @fhevm/solidity is installed correctly
    pause
    exit /b 1
)

echo.
echo ✅ Contract compilation successful!
echo.
echo 🚀 Now you can run:
echo   npm run hardhat-node
echo.
echo 📝 Changes made:
echo   - TFHE → FHE
echo   - Using externalEuint8 + attestation
echo   - Added FHE.allow() for access control
echo   - Using FHE.fromExternal() and FHE.isSenderAllowed()
echo.
pause
