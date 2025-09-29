@echo off
echo Compiling and deploying updated contract...
echo.

cd packages\fhevm-hardhat-template

echo Compiling contract...
npx hardhat compile

if %errorlevel% neq 0 (
    echo Error: Compilation failed
    pause
    exit /b 1
)

echo.
echo Deploying updated contract...
npx hardhat deploy:private-voting --network localhost

if %errorlevel% equ 0 (
    echo.
    echo ✅ Contract compiled and deployed successfully!
    echo.
    echo The new contract address should be displayed above.
    echo Copy this address and update it in your frontend if needed.
) else (
    echo.
    echo ❌ Contract deployment failed!
    echo Please check the error messages above.
)

echo.
pause
