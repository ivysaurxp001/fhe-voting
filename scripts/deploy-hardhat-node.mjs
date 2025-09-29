#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HARDHAT_NODE_PORT = 8545;
const HARDHAT_NODE_HOST = '127.0.0.1';
const HARDHAT_NODE_URL = `http://${HARDHAT_NODE_HOST}:${HARDHAT_NODE_PORT}`;
const TIMEOUT_SECONDS = 60;
const CHECK_INTERVAL_SECONDS = 1000;

// Function to check if Hardhat node is running
async function isHardhatNodeRunning() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1
    });

    const options = {
      hostname: HARDHAT_NODE_HOST,
      port: HARDHAT_NODE_PORT,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Function to start Hardhat node
function startHardhatNode() {
  const contractsDir = join(__dirname, '..', 'packages', 'fhevm-hardhat-template');
  
  console.log('--- Starting Hardhat Node in background ---');
  
  // Try different ways to run hardhat
  let hardhatProcess;
  
  try {
    // First try with npx
    hardhatProcess = spawn('npx', ['hardhat', 'node'], {
      cwd: contractsDir,
      stdio: 'ignore',
      detached: true,
      shell: true
    });
  } catch (error) {
    console.log('npx not found, trying with node directly...');
    try {
      // Try with node directly
      hardhatProcess = spawn('node', ['node_modules/.bin/hardhat', 'node'], {
        cwd: contractsDir,
        stdio: 'ignore',
        detached: true,
        shell: true
      });
    } catch (error2) {
      console.log('Direct node execution failed, trying with npm run...');
      // Last resort: use npm run
      hardhatProcess = spawn('npm', ['run', 'hardhat:node'], {
        cwd: contractsDir,
        stdio: 'ignore',
        detached: true,
        shell: true
      });
    }
  }

  hardhatProcess.unref();
  return hardhatProcess;
}

// Function to wait for Hardhat node to be ready
async function waitForHardhatNode() {
  console.log('Waiting for Hardhat Node to be ready...');
  
  let attempts = 0;
  while (attempts < TIMEOUT_SECONDS) {
    if (await isHardhatNodeRunning()) {
      console.log('Hardhat Node is ready!');
      return true;
    }
    
    console.log(`Waiting for Hardhat Node... (Attempt ${attempts + 1}/${TIMEOUT_SECONDS})`);
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_SECONDS));
    attempts++;
  }
  
  return false;
}

// Function to deploy contracts
async function deployContracts() {
  const contractsDir = join(__dirname, '..', 'packages', 'fhevm-hardhat-template');
  
  console.log('--- Deploying contracts ---');
  
  return new Promise((resolve) => {
    const deployProcess = spawn('npx', ['hardhat', 'deploy', '--network', 'localhost'], {
      cwd: contractsDir,
      stdio: 'inherit'
    });

    deployProcess.on('close', (code) => {
      resolve(code);
    });
  });
}

// Function to kill Hardhat node
function killHardhatNode(pid) {
  if (pid && pid > 0) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`Killed Hardhat Node (PID: ${pid})`);
    } catch (error) {
      console.log(`Could not kill process ${pid}: ${error.message}`);
    }
  }
}

// Main function
async function main() {
  try {
    // Check if Hardhat node is already running
    if (await isHardhatNodeRunning()) {
      console.log('Hardhat Node is already running!');
      const exitCode = await deployContracts();
      process.exit(exitCode);
    }

    // Start Hardhat node
    const hardhatProcess = startHardhatNode();
    console.log(`Hardhat Node started with PID: ${hardhatProcess.pid}`);

    // Wait for it to be ready
    const isReady = await waitForHardhatNode();
    
    if (!isReady) {
      console.log('Error: Hardhat Node did not start within the timeout period.');
      killHardhatNode(hardhatProcess.pid);
      process.exit(1);
    }

    // Deploy contracts
    const exitCode = await deployContracts();

    // Kill Hardhat node
    killHardhatNode(hardhatProcess.pid);

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    process.exit(exitCode);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
