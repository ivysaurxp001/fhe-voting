"use client";

import { useState } from 'react';
import { useFhevm } from '@fhevm/react';
import { useMetaMaskEthersSigner } from '../hooks/metamask/useMetaMaskEthersSigner';
import { useMetaMask } from '../hooks/metamask/useMetaMaskProvider';

export default function SimpleFHEVMTest() {
  const { ethersSigner, isConnected, chainId } = useMetaMaskEthersSigner();
  const { provider: metamaskProvider } = useMetaMask();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Sử dụng useFhevm hook với MetaMask provider trực tiếp
  const { instance, status, error } = useFhevm({
    provider: metamaskProvider,
    chainId,
    enabled: chainId === 31337,
    initialMockChains: { 31337: "http://localhost:8545" }
  });

  const testEncrypt = async () => {
    if (!instance) {
      setTestResult('❌ FHEVM instance not available');
      return;
    }

    setLoading(true);
    setTestResult('Testing encryption...');

    try {
      // Debug FHEVM instance
      console.log('FHEVM instance:', instance);
      console.log('FHEVM instance type:', typeof instance);
      console.log('FHEVM instance constructor:', instance?.constructor?.name);
      console.log('FHEVM instance methods:', Object.getOwnPropertyNames(instance));
      console.log('FHEVM instance prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
      
      // Kiểm tra tất cả methods có thể có
      const allMethods = [
        ...Object.getOwnPropertyNames(instance),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
      ];
      console.log('All available methods:', allMethods);
      
      // Tìm methods có chứa "encrypt"
      const encryptMethods = allMethods.filter(method => 
        method.toLowerCase().includes('encrypt') || 
        method.toLowerCase().includes('enc')
      );
      console.log('Encrypt-related methods:', encryptMethods);
      
      if (encryptMethods.length === 0) {
        setTestResult(`❌ No encrypt methods found. Available methods: ${allMethods.slice(0, 10).join(', ')}...`);
        return;
      }
      
      // Sử dụng createEncryptedInput method
      console.log('Using createEncryptedInput method');
      const result = await instance.createEncryptedInput(0);
      
      console.log('Encrypt result:', result);
      setTestResult(`✅ Encryption successful! Result: ${JSON.stringify(result)}`);
    } catch (err: any) {
      console.error('Encryption error:', err);
      setTestResult(`❌ Encryption failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simple FHEVM Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Chain ID: {chainId} {chainId === 31337 ? '✅' : '❌'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Connected: {isConnected ? 'Yes ✅' : 'No ❌'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            FHEVM Status: {status} {status === 'ready' ? '✅' : '❌'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            FHEVM Instance: {instance ? 'Available ✅' : 'Not Available ❌'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Provider: {ethersSigner?.provider ? 'Available ✅' : 'Not Available ❌'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h4 className="font-medium">FHEVM Error:</h4>
            <p className="text-sm">{error.message}</p>
            <p className="text-sm">Stack: {error.stack}</p>
          </div>
        )}

        <button
          onClick={testEncrypt}
          disabled={loading || !instance || !isConnected}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Encryption'}
        </button>

        {testResult && (
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-medium">Test Result:</h4>
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Debug Info:</h4>
          <p className="text-sm text-blue-700">
            Ethers Provider type: {typeof ethersSigner?.provider}
          </p>
          <p className="text-sm text-blue-700">
            MetaMask Provider type: {typeof metamaskProvider}
          </p>
          <p className="text-sm text-blue-700">
            MetaMask Provider methods: {metamaskProvider ? Object.getOwnPropertyNames(metamaskProvider).join(', ') : 'N/A'}
          </p>
          <p className="text-sm text-blue-700">
            MetaMask Provider has request: {metamaskProvider && 'request' in metamaskProvider ? 'Yes ✅' : 'No ❌'}
          </p>
        </div>
      </div>
    </div>
  );
}
