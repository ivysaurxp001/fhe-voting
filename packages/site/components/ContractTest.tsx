'use client';

import { useState } from 'react';
import { usePrivateVoting } from '../hooks/usePrivateVoting';

const CONTRACT_ADDRESS = '0x90791c8472d9262395d72c76572c8d6728F0dfF2';

export default function ContractTest() {
  const { createPoll, loading, error } = usePrivateVoting(CONTRACT_ADDRESS);
  const [testResult, setTestResult] = useState<string>('');

  const handleTest = async () => {
    try {
      setTestResult('Testing contract connection...');
      
      // Test tạo poll đơn giản với gas limit cao hơn
      const now = Math.floor(Date.now() / 1000);
      const endTime = now + 3600; // 1 hour from now
      
      console.log('Testing with contract address:', CONTRACT_ADDRESS);
      console.log('Poll data:', {
        title: 'Test Poll',
        options: ['Option 1', 'Option 2'],
        start: now,
        end: endTime
      });
      
      const txHash = await createPoll(
        'Test Poll',
        ['Option 1', 'Option 2'],
        now,
        endTime
      );
      
      setTestResult(`✅ Success! Transaction hash: ${txHash}`);
    } catch (err: any) {
      console.error('Contract test error:', err);
      setTestResult(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Contract Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Contract Address: <code className="bg-gray-100 px-2 py-1 rounded">{CONTRACT_ADDRESS}</code>
          </p>
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Contract Connection'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h4 className="font-medium">Error:</h4>
            <p className="text-sm">{error}</p>
          </div>
        )}

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
