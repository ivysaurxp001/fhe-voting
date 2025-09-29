'use client';

import { useState } from 'react';
import { useMetaMaskEthersSigner } from '../hooks/metamask/useMetaMaskEthersSigner';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x90791c8472d9262395d72c76572c8d6728F0dfF2';

export default function ContractABITest() {
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
      setTestResult('Testing contract ABI...');
      
      // Test với ABI đơn giản trước
      const simpleABI = [
        {
          "inputs": [],
          "name": "pollCount",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, ethersSigner);
      
      console.log('Testing with simple ABI...');
      
      // Test gọi function đơn giản - pollCount
      try {
        const pollCount = await contract.pollCount();
        console.log('Poll count:', pollCount.toString());
        setTestResult(`✅ Contract ABI works! Poll count: ${pollCount.toString()}`);
      } catch (pollCountError) {
        console.log('pollCount failed, trying to get contract code...');
        
        // Thử lấy contract code để xem contract có gì
        try {
          const code = await ethersSigner.provider.getCode(CONTRACT_ADDRESS);
          console.log('Contract code length:', code.length);
          console.log('Contract code (first 100 chars):', code.substring(0, 100));
          
          if (code === '0x') {
            setTestResult(`❌ No contract at address ${CONTRACT_ADDRESS}`);
          } else {
            setTestResult(`✅ Contract exists but pollCount() function not found. Code length: ${code.length}`);
          }
        } catch (codeError) {
          console.log('getCode failed:', codeError);
          setTestResult(`❌ Cannot get contract code: ${codeError.message}`);
        }
      }
    } catch (err: any) {
      console.error('Contract ABI test error:', err);
      setTestResult(`❌ ABI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Contract ABI Test</h2>
      
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
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing ABI...' : 'Test Contract ABI'}
        </button>

        {testResult && (
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-medium">Test Result:</h4>
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">ABI Test Info:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Tests if contract has pollCount() function</li>
            <li>• Uses simple ABI to avoid complex function issues</li>
            <li>• Helps identify ABI mismatch problems</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
