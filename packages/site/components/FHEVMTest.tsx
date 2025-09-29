'use client';

import { useFhevm } from '@fhevm/react';
import { useMetaMaskEthersSigner } from '../hooks/metamask/useMetaMaskEthersSigner';

export default function FHEVMTest() {
  const { ethersSigner, isConnected, provider, chainId } = useMetaMaskEthersSigner();
  const { instance, status, error } = useFhevm({
    provider,
    chainId,
    enabled: chainId === 31337, // Only enable for localhost
    initialMockChains: { 31337: "http://localhost:8545" }
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">FHEVM Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-800">FHEVM Status:</h3>
          <p className={`text-sm ${status === 'ready' ? 'text-green-600' : 'text-red-600'}`}>
            {status} {status === 'ready' ? '✅' : '❌'}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800">MetaMask Connection:</h3>
          <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected ✅' : 'Not Connected ❌'}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800">Ethers Signer:</h3>
          <p className={`text-sm ${ethersSigner ? 'text-green-600' : 'text-red-600'}`}>
            {ethersSigner ? 'Available ✅' : 'Not Available ❌'}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800">Chain ID:</h3>
          <p className={`text-sm ${chainId === 31337 ? 'text-green-600' : 'text-red-600'}`}>
            {chainId} {chainId === 31337 ? '✅ (Localhost)' : '❌ (Wrong Network)'}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-800">FHEVM Instance:</h3>
          <p className={`text-sm ${instance ? 'text-green-600' : 'text-red-600'}`}>
            {instance ? 'Available ✅' : 'Not Available ❌'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h4 className="font-medium">Error:</h4>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Troubleshooting:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure Hardhat node is running on port 8545</li>
            <li>• Connect MetaMask to localhost:8545 (Chain ID: 31337)</li>
            <li>• Switch from Sepolia to Localhost network</li>
            <li>• Check browser console for errors</li>
            <li>• Try refreshing the page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
