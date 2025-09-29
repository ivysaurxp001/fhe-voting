@echo off
echo 🧹 Cleaning Hardhat cache...
cd packages/fhevm-hardhat-template
npx hardhat clean

echo.
echo 📦 Installing dependencies...
npm install

echo.
echo 🔨 Compiling contract...
npx hardhat compile

echo.
echo ✅ Contract compilation completed!
echo.
echo 🚀 Now you can run:
echo   npm run hardhat-node
echo.
pause
