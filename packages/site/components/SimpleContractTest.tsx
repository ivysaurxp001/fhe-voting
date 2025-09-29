'use client';

import { useState } from 'react';
import { useMetaMaskEthersSigner } from '../hooks/metamask/useMetaMaskEthersSigner';
import { PrivateVotingABI } from '../abi/PrivateVotingABI';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x90791c8472d9262395d72c76572c8d6728F0dfF2';

export default function SimpleContractTest() {
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
      setTestResult('Testing contract connection...');
      
      // Tạo contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PrivateVotingABI, ethersSigner);
      
      console.log('Contract address:', CONTRACT_ADDRESS);
      console.log('Contract instance:', contract);
      
      // Test gọi function đơn giản - pollCount
      try {
        const pollCount = await contract.pollCount();
        console.log('Poll count:', pollCount.toString());
        setTestResult(`✅ Contract connected! Poll count: ${pollCount.toString()}`);
      } catch (pollCountError) {
        console.log('pollCount failed, trying other functions...');
        
        // Thử các function khác
        try {
          const owner = await contract.owner();
          console.log('Owner:', owner);
          setTestResult(`✅ Contract connected! Owner: ${owner}`);
        } catch (ownerError) {
          console.log('owner failed, trying getMeta...');
          
          try {
            const meta = await contract.getMeta(1);
            console.log('Meta for poll 1:', meta);
            setTestResult(`✅ Contract connected! Meta: ${JSON.stringify(meta)}`);
          } catch (metaError) {
            console.log('getMeta failed, contract might not have expected functions');
            setTestResult(`❌ Contract connected but no expected functions found. Error: ${metaError.message}`);
          }
        }
      }
    } catch (err: any) {
      console.error('Contract test error:', err);
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simple Contract Test</h2>
      
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
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Contract Connection'}
        </button>

        {testResult && (
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-medium">Test Result:</h4>
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Troubleshooting:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure Hardhat node is running</li>
            <li>• Connect MetaMask to localhost:8545</li>
            <li>• Check that contract is deployed</li>
            <li>• Try refreshing the page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
