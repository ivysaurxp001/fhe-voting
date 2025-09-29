#!/bin/bash

echo "========================================"
echo "  DEPLOY CONTRACT AND UPDATE FRONTEND"
echo "========================================"

echo ""
echo "[1/6] Cleaning previous build..."
cd packages/fhevm-hardhat-template
npx hardhat clean
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to clean"
    exit 1
fi

echo ""
echo "[2/6] Compiling contract..."
npx hardhat compile
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to compile"
    exit 1
fi

echo ""
echo "[3/6] Deploying contract..."
DEPLOY_OUTPUT=$(npx hardhat deploy:private-voting --network localhost 2>&1)
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to deploy"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "$DEPLOY_OUTPUT"

echo ""
echo "[4/6] Extracting contract address..."
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "PrivateVoting deployed to:" | sed 's/.*PrivateVoting deployed to: //')
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "ERROR: Could not extract contract address from deploy output"
    echo "Deploy output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "Contract address: $CONTRACT_ADDRESS"

echo ""
echo "[5/6] Updating frontend contract addresses..."
cd ../site

# Update PrivateVotingAddresses.ts
cat > abi/PrivateVotingAddresses.ts << EOF
export const PrivateVotingAddresses = {
  "hardhat": "$CONTRACT_ADDRESS",
  "localhost": "$CONTRACT_ADDRESS",
  "sepolia": "0x0000000000000000000000000000000000000000",
} as const;
EOF

# Update all component files
FILES=(
    "components/FHEVMPollTest.tsx"
    "components/PrivateVotingDemo.tsx"
    "components/ContractTest.tsx"
    "components/ContractABITest.tsx"
    "components/ContractCodeTest.tsx"
    "components/SimpleContractTest.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        sed -i "s/0x[a-fA-F0-9]\{40\}/$CONTRACT_ADDRESS/g" "$file"
        echo "Updated $file"
    fi
done

echo ""
echo "[6/6] Generating ABI..."
cd ../fhevm-hardhat-template
npx hardhat compile --force
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to regenerate ABI"
    exit 1
fi

echo ""
echo "========================================"
echo "  DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Refresh your frontend page"
echo "2. Test contract connection"
echo "3. Try creating a poll"
echo ""
