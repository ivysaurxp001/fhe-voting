#!/bin/bash

echo "🚀 Setting up Private Voting System..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the site directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building the project..."
npm run build

echo "🏗️ Deploying PrivateVoting contract..."
cd ../fhevm-hardhat-template
npx hardhat run scripts/deploy-private-voting.js --network localhost

echo "🌐 Starting frontend..."
cd ../site
npm run dev

echo "✅ Private Voting System is ready!"
echo "🌐 Open http://localhost:3000 to use the voting system"
