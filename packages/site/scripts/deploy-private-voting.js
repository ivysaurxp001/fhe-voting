const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying PrivateVoting contract...');

  const PrivateVoting = await ethers.getContractFactory('PrivateVoting');
  const privateVoting = await PrivateVoting.deploy();

  await privateVoting.waitForDeployment();

  const address = await privateVoting.getAddress();
  console.log('PrivateVoting deployed to:', address);

  // Update the contract address in the demo component
  const fs = require('fs');
  const path = require('path');
  
  const demoPath = path.join(__dirname, '../components/PrivateVotingDemo.tsx');
  const addressesPath = path.join(__dirname, '../abi/PrivateVotingAddresses.ts');
  
  // Read current demo file
  let demoContent = fs.readFileSync(demoPath, 'utf8');
  
  // Replace the contract address
  demoContent = demoContent.replace(
    /const PRIVATE_VOTING_CONTRACT = '0x0000000000000000000000000000000000000000';/,
    `const PRIVATE_VOTING_CONTRACT = '${address}';`
  );
  
  // Write back to file
  fs.writeFileSync(demoPath, demoContent);
  
  // Update addresses file
  let addressesContent = fs.readFileSync(addressesPath, 'utf8');
  addressesContent = addressesContent.replace(
    /"hardhat": "0x0000000000000000000000000000000000000000",/,
    `"hardhat": "${address}",`
  );
  addressesContent = addressesContent.replace(
    /"localhost": "0x0000000000000000000000000000000000000000",/,
    `"localhost": "${address}",`
  );
  
  fs.writeFileSync(addressesPath, addressesContent);
  
  console.log('✅ Contract address updated in components!');
  console.log('You can now start the frontend with: npm run dev');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
