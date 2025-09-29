'use client';

import { useState } from 'react';
import { useMetaMaskEthersSigner } from '../hooks/metamask/useMetaMaskEthersSigner';
import { ethers } from 'ethers';

// Contract address mới đã được deploy
const CONTRACT_ADDRESS = '0x90791c8472d9262395d72c76572c8d6728F0dfF2';

export default function ContractCodeTest() {
  const { ethersSigner, isConnected, chainId } = useMetaMaskEthersSigner();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!ethersSigner) {
      setTestResult('❌ No ethers signer available');
      return;
    }

    try {
      setLoading(true);
      setTestResult('Testing contract addresses...');
      
      let foundContract = false;
      let workingAddress = '';
      
      // Thử tất cả các address
      for (const address of CONTRACT_ADDRESSES) {
        try {
          console.log(`Testing address: ${address}`);
          const code = await ethersSigner.provider.getCode(address);
          console.log(`Code length for ${address}: ${code.length}`);
          
          if (code !== '0x') {
            // Contract tồn tại, thử test function
            const simpleABI = [
              {
                "inputs": [],
                "name": "pollCount",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
              }
            ];
            
            const contract = new ethers.Contract(address, simpleABI, ethersSigner);
            
            try {
              const pollCount = await contract.pollCount();
              setTestResult(`✅ Contract found at ${address}! Poll count: ${pollCount.toString()}`);
              foundContract = true;
              workingAddress = address;
              break;
            } catch (pollCountError) {
              // Thử với owner function
              const ownerABI = [
                {
                  "inputs": [],
                  "name": "owner",
                  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                  "stateMutability": "view",
                  "type": "function"
                }
              ];
              
              const ownerContract = new ethers.Contract(address, ownerABI, ethersSigner);
              
              try {
                const owner = await ownerContract.owner();
                setTestResult(`✅ Contract found at ${address}! Owner: ${owner}`);
                foundContract = true;
                workingAddress = address;
                break;
              } catch (ownerError) {
                console.log(`Contract at ${address} exists but no expected functions found`);
              }
            }
          }
        } catch (err) {
          console.log(`Error testing ${address}:`, err.message);
        }
      }
      
      if (!foundContract) {
        setTestResult(`❌ No working contract found at any address. Tried: ${CONTRACT_ADDRESSES.join(', ')}`);
      }
    } catch (err: any) {
      console.error('Contract code test error:', err);
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Contract Code Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Contract Address: <code className="bg-gray-100 px-2 py-1 rounded">{CONTRACT_ADDRESS}</code>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Connected: {isConnected ? '✅' : '❌'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Chain ID: {chainId}
          </p>
        </div>

        <button
          onClick={handleTest}
          disabled={loading || !isConnected}
          className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Testing Code...' : 'Test Contract Code'}
        </button>

        {testResult && (
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-medium">Test Result:</h4>
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Code Test Info:</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Checks if contract exists at address</li>
            <li>• Tests contract code length and content</li>
            <li>• Tries different ABI functions</li>
            <li>• Helps identify contract deployment issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
