import { useState, useEffect, useCallback } from 'react';
import { useFhevm } from '@fhevm/react';
import { useMetaMaskEthersSigner } from './metamask/useMetaMaskEthersSigner';
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
  const { ethersSigner, provider, chainId } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({
    provider,
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

      const tx = await contract.createPoll(title, options, start, end);
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
      // Encrypt the choice using FHEVM
      const encryptedChoice = await instance.encrypt8(choiceIndex);
      const attestation = await instance.generateAttestation(encryptedChoice);
      
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const tx = await contract.vote(pollId, encryptedChoice, attestation);
      await tx.wait();
      
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [instance, ethersSigner, getContract]);

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
          const decryptedVotes = await instance.decrypt32(encryptedTallies[i]);
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
