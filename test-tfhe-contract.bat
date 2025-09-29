@echo off
echo 🔧 Testing TFHE Contract...
echo.

echo 🧹 Cleaning Hardhat cache...
cd packages/fhevm-hardhat-template
npx hardhat clean

echo.
echo 📦 Installing dependencies...
npm install

echo.
echo 🔨 Compiling contract with TFHE...
npx hardhat compile

if %errorlevel% neq 0 (
    echo ❌ Compilation failed!
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
echo   - FHE → TFHE
echo   - Added proof parameter to vote()
echo   - Updated getEncryptedTallies to return euint32[]
echo.
pause
