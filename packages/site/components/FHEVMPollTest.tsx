"use client";

import { useState } from 'react';
import { useFhevm } from '@fhevm/react';
import { useMetaMaskEthersSigner } from '../hooks/metamask/useMetaMaskEthersSigner';
import { useMetaMask } from '../hooks/metamask/useMetaMaskProvider';
import { PrivateVotingABI } from '../abi/PrivateVotingABI';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x90791c8472d9262395d72c76572c8d6728F0dfF2';

export default function FHEVMPollTest() {
  const { ethersSigner, isConnected, chainId } = useMetaMaskEthersSigner();
  const { provider: metamaskProvider } = useMetaMask();
  const { instance, status, error } = useFhevm({
    provider: metamaskProvider,
    chainId,
    enabled: chainId === 31337,
    initialMockChains: { 31337: "http://localhost:8545" }
  });
  
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCreatePoll = async () => {
    if (!instance || !ethersSigner) {
      setTestResult('❌ FHEVM instance or ethersSigner not available');
      return;
    }

    setLoading(true);
    setTestResult('Testing createPoll with FHEVM...');

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PrivateVotingABI, ethersSigner);
      
      // Test parameters
      const now = Math.floor(Date.now() / 1000);
      const endTime = now + 3600; // 1 hour from now
      
      console.log('Creating poll with FHEVM instance...');
      console.log('FHEVM instance:', instance);
      console.log('Contract:', contract);
      
      // Lấy userAddress từ signer
      const userAddress = await ethersSigner.getAddress();
      console.log('User address:', userAddress);
      console.log('Contract address:', CONTRACT_ADDRESS);
      console.log('User address type:', typeof userAddress);
      console.log('Contract address type:', typeof CONTRACT_ADDRESS);
      
      // *** QUAN TRỌNG: contractAddress TRƯỚC, userAddress SAU ***
      // SDK đang đảo metadata, nên phải truyền ngược lại
      let encryptedInput;
      if (typeof instance.createEncryptedInput === 'function') {
        // SDK expect: createEncryptedInput(contractAddress, userAddress)
        // Nhưng SDK sẽ đảo thành: contractAddress = user, userAddress = contract
        // Nên phải truyền ngược: (contractAddress, userAddress) để được (user, contract)
        encryptedInput = instance.createEncryptedInput(CONTRACT_ADDRESS, userAddress);
        console.log('Using separate parameters method with correct order');
      } else {
        throw new Error('createEncryptedInput method not found');
      }
      
      // (debug) in metadata để chắc chắn không bị đảo
      console.log('Encrypted input created:', encryptedInput);
      console.log('Encrypted input contractAddress:', (encryptedInput as any).contractAddress);
      console.log('Encrypted input userAddress:', (encryptedInput as any).userAddress);
      
      // Thêm giá trị cần mã hóa: số 0 (cho externalEuint32)
      encryptedInput.add32(0);
      
      // Encrypt để lấy external + attestation
      const encPayload = await encryptedInput.encrypt();
      console.log('Encrypted payload keys:', Object.keys(encPayload));
      console.log('Encrypted payload:', encPayload);
      
      // Lấy external và attestation từ payload
      let encZero, proofZero;
      if (encPayload.handles && encPayload.inputProof) {
        // Sử dụng handles và inputProof
        // handles[0] là object, cần lấy .handle hoặc chính nó
        const h0 = encPayload.handles[0];
        encZero = ((h0 as any)?.handle ?? h0) as Uint8Array; // support cả 2 dạng
        proofZero = encPayload.inputProof as Uint8Array;
        console.log('Using handles[0] and inputProof');
        console.log('Handles array length:', encPayload.handles.length);
        console.log('First handle type:', typeof encPayload.handles[0]);
        console.log('First handle structure:', encPayload.handles[0]);
      } else if ((encPayload as any).external && (encPayload as any).attestation) {
        encZero = (encPayload as any).external;
        proofZero = (encPayload as any).attestation;
        console.log('Using external and attestation');
      } else if ((encPayload as any).ciphertext && (encPayload as any).proof) {
        encZero = (encPayload as any).ciphertext;
        proofZero = (encPayload as any).proof;
        console.log('Using ciphertext and proof');
      } else {
        console.error('Unexpected payload structure:', encPayload);
        throw new Error('Unexpected encrypted payload structure');
      }
      
      // Convert to hex strings for tuple encoding
      const encZeroHex = ethers.hexlify(encZero);      // '0x…'
      const proofZeroHex = ethers.hexlify(proofZero); // '0x…'
      
      // sanity log (nên thấy "Uint8Array(32)")
      console.log('encZero is Uint8Array?', encZero instanceof Uint8Array, encZero.length); // expect true, 32
      console.log('proofZero len', proofZero.length); // ~100
      console.log('encZeroHex:', encZeroHex);
      console.log('proofZeroHex:', proofZeroHex);
      
      // Check ABI input type
      const input4 = contract.interface.getFunction('createPoll')?.inputs[4];
      console.log('createPoll input[4]:', input4);
      
      const start64 = BigInt(now);
      const end64 = BigInt(endTime);
      
      let tx;
      if (input4?.baseType === 'tuple') {
        // đúng chuẩn externalEuint32
        console.log('Using tuple format for externalEuint32');
        tx = await contract.createPoll(
          'FHEVM Test Poll',
          ['Option 1', 'Option 2'],
          start64, end64,
          [encZeroHex],       // tuple(bytes) -> truyền MẢNG 1 phần tử
          proofZeroHex
        );
      } else {
        // fallback nếu ABI bạn đang load vẫn là bytes (tạm thời)
        console.log('Using bytes format (fallback)');
        tx = await contract.createPoll(
          'FHEVM Test Poll',
          ['Option 1', 'Option 2'],
          start64, end64,
          encZeroHex,         // bytes trực tiếp
          proofZeroHex
        );
      }
      
      console.log('Transaction sent:', tx.hash);
      setTestResult(`✅ Success! Transaction hash: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      setTestResult(`✅ Success! Block: ${receipt?.blockNumber}, Gas used: ${receipt?.gasUsed}`);
      
    } catch (err: any) {
      console.error('Error creating poll:', err);
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLoadPolls = async () => {
    if (!ethersSigner) {
      setTestResult('❌ EthersSigner not available');
      return;
    }

    setLoading(true);
    setTestResult('Loading polls...');

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PrivateVotingABI, ethersSigner);
      
      const pollCount = await contract.pollCount();
      setTestResult(`✅ Poll count: ${pollCount.toString()}`);
      
      if (pollCount > 0) {
        const [title, options, start, end, isSealed] = await contract.getMeta(1);
        setTestResult(`✅ Poll 1: ${title} (${options.length} options)`);
      }
      
    } catch (err: any) {
      console.error('Error loading polls:', err);
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">FHEVM Poll Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Contract Address: <code className="bg-gray-100 px-2 py-1 rounded">{CONTRACT_ADDRESS}</code>
          </p>
          <p className="text-sm text-gray-600">
            FHEVM Status: {status} {status === 'ready' ? '✅' : '❌'}
          </p>
          <p className="text-sm text-gray-600">
            FHEVM Instance: {instance ? 'Available ✅' : 'Not Available ❌'}
          </p>
          <p className="text-sm text-gray-600">
            Connected: {isConnected ? 'Yes ✅' : 'No ❌'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h4 className="font-medium">FHEVM Error:</h4>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={testLoadPolls}
            disabled={loading || !isConnected}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Load Polls'}
          </button>
          
          <button
            onClick={testCreatePoll}
            disabled={loading || !instance || !isConnected}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Create Poll'}
          </button>
        </div>

        {testResult && (
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-medium">Test Result:</h4>
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Note:</h4>
          <p className="text-sm text-yellow-700">
            This test uses the same FHEVM instance as the main app. If this works, 
            the issue might be in the usePrivateVoting hook configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
