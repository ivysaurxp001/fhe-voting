import { useState, useEffect, useCallback } from 'react';
import { useFhevm } from '@fhevm/react';
import { useMetaMaskEthersSigner } from './metamask/useMetaMaskEthersSigner';
import { useMetaMask } from './metamask/useMetaMaskProvider';
import { PrivateVotingABI } from '../abi/PrivateVotingABI';
import { ethers } from 'ethers';

export interface Poll {
  id: number;
  title: string;
  options: string[];
  start: number;
  end: number;
  isSealed: boolean;
}

export interface PollResult {
  option: string;
  votes: number;
}

export const usePrivateVoting = (contractAddress: string) => {
  const { ethersSigner, chainId } = useMetaMaskEthersSigner();
  const { provider: metamaskProvider } = useMetaMask();
  const { instance } = useFhevm({
    provider: metamaskProvider,
    chainId,
    enabled: chainId === 31337, // Only enable for localhost
    initialMockChains: { 31337: "http://localhost:8545" }
  });
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the imported ABI
  const contractABI = PrivateVotingABI;

  const getContract = useCallback(() => {
    if (!ethersSigner) return null;
    return new ethers.Contract(contractAddress, contractABI, ethersSigner);
  }, [ethersSigner, contractAddress]);

  const createPoll = useCallback(async (
    title: string,
    options: string[],
    start: number,
    end: number
  ) => {
    if (!instance || !ethersSigner) {
      throw new Error('FHEVM instance or ethersSigner not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      // Lấy userAddress từ signer
      const userAddress = await ethersSigner.getAddress();
      console.log('User address:', userAddress);
      console.log('Contract address:', contractAddress);
      console.log('User address type:', typeof userAddress);
      console.log('Contract address type:', typeof contractAddress);
      
      // *** QUAN TRỌNG: contractAddress TRƯỚC, userAddress SAU ***
      // SDK đang đảo metadata, nên phải truyền ngược lại
      let encryptedInput;
      if (typeof instance.createEncryptedInput === 'function') {
        // SDK expect: createEncryptedInput(contractAddress, userAddress)
        // Nhưng SDK sẽ đảo thành: contractAddress = user, userAddress = contract
        // Nên phải truyền ngược: (contractAddress, userAddress) để được (user, contract)
        encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
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
      
      const start64 = BigInt(Math.floor(start));
      const end64 = BigInt(Math.floor(end));
      
      let tx;
      if (input4?.baseType === 'tuple') {
        // đúng chuẩn externalEuint32
        console.log('Using tuple format for externalEuint32');
        tx = await contract.createPoll(
          title, options, start64, end64,
          [encZeroHex],       // tuple(bytes) -> truyền MẢNG 1 phần tử
          proofZeroHex
        );
      } else {
        // fallback nếu ABI bạn đang load vẫn là bytes (tạm thời)
        console.log('Using bytes format (fallback) - contract still using old ABI');
        tx = await contract.createPoll(
          title, options, start64, end64,
          encZeroHex,         // bytes trực tiếp
          proofZeroHex
        );
      }
      await tx.wait();
      
      // Refresh polls after creation
      await loadPolls();
      
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instance, ethersSigner, getContract]);

  const vote = useCallback(async (pollId: number, choiceIndex: number) => {
    if (!instance || !ethersSigner) {
      throw new Error('FHEVM instance or ethersSigner not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const userAddress = await ethersSigner.getAddress();
      const contractAddr = contractAddress;

      // *** QUAN TRỌNG: contractAddress TRƯỚC, userAddress SAU ***
      const encInput = instance.createEncryptedInput(contractAddr, userAddress);
      encInput.add8(choiceIndex);

      const encPayload = await encInput.encrypt();
      if (!encPayload?.handles?.length || !encPayload?.inputProof) {
        throw new Error('Unexpected encrypted payload structure (need handles[] + inputProof)');
      }

      // Lấy bytes thuần từ handles[0]
      const h0 = encPayload.handles[0];
      const encryptedChoice = ((h0 as any)?.handle ?? h0) as Uint8Array; // externalEuint8
      const attestation = encPayload.inputProof as Uint8Array; // bytes
      
      // Convert to hex strings for tuple encoding
      const choiceHex = ethers.hexlify(encryptedChoice);
      const attHex = ethers.hexlify(attestation);
      
      // sanity log
      console.log('encryptedChoice is Uint8Array?', encryptedChoice instanceof Uint8Array, encryptedChoice.length);
      console.log('attestation len', attestation.length);
      console.log('choiceHex:', choiceHex);
      console.log('attHex:', attHex);

      // Check ABI input type for vote
      const voteInput2 = contract.interface.getFunction('vote')?.inputs[1];
      console.log('vote input[1]:', voteInput2);
      
      const tx = await contract.vote(
        pollId,
        voteInput2?.baseType === 'tuple' ? [choiceHex] : choiceHex,
        attHex
      );
      await tx.wait();

      // Refresh polls after voting
      await loadPolls();

      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instance, ethersSigner, getContract, contractAddress]);

  const sealPoll = useCallback(async (pollId: number) => {
    if (!ethersSigner) {
      throw new Error('Signer not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const tx = await contract.seal(pollId);
      await tx.wait();
      
      // Refresh polls after sealing
      await loadPolls();
      
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ethersSigner, getContract]);

  const loadPolls = useCallback(async () => {
    if (!ethersSigner) return;

    setLoading(true);
    setError(null);

    try {
      const contract = getContract();
      if (!contract) return;

      const pollCount = await contract.pollCount();
      const pollsData: Poll[] = [];

      for (let i = 1; i <= pollCount; i++) {
        try {
          const [title, options, start, end, isSealed] = await contract.getMeta(i);
          pollsData.push({
            id: i,
            title,
            options,
            start: Number(start),
            end: Number(end),
            isSealed
          });
        } catch (err) {
          console.warn(`Failed to load poll ${i}:`, err);
        }
      }

      setPolls(pollsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ethersSigner, getContract]);

  const getPollResults = useCallback(async (pollId: number): Promise<PollResult[]> => {
    if (!instance || !ethersSigner) {
      throw new Error('FHEVM instance or ethersSigner not available');
    }

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      // Get encrypted tallies
      const encryptedTallies = await contract.getEncryptedTallies(pollId);
      
      // Get poll metadata for option names
      const [title, options] = await contract.getMeta(pollId);
      
      // Decrypt each tally
      const results: PollResult[] = [];
      for (let i = 0; i < encryptedTallies.length; i++) {
        try {
          // Decrypt the encrypted tally using FHEVM
          const decryptedVotes = await (instance as any).decrypt32(encryptedTallies[i]);
          results.push({
            option: options[i],
            votes: Number(decryptedVotes)
          });
        } catch (err) {
          console.warn(`Failed to decrypt tally for option ${i}:`, err);
          results.push({
            option: options[i],
            votes: 0
          });
        }
      }

      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [instance, ethersSigner, getContract]);

  const hasVoted = useCallback(async (pollId: number, userAddress?: string): Promise<boolean> => {
    if (!ethersSigner) return false;

    try {
      const contract = getContract();
      if (!contract) return false;

      const address = userAddress || await ethersSigner.getAddress();
      return await contract.hasVoted(pollId, address);
    } catch (err: any) {
      console.warn('Failed to check vote status:', err);
      return false;
    }
  }, [ethersSigner, getContract]);

  // Load polls on mount
  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  return {
    polls,
    loading,
    error,
    createPoll,
    vote,
    sealPoll,
    getPollResults,
    hasVoted,
    loadPolls
  };
};
