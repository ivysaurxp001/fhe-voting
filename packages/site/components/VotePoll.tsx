'use client';

import { useState, useEffect } from 'react';
import { usePrivateVoting, Poll } from '../hooks/usePrivateVoting';
import { useMetaMaskEthersSigner } from '../hooks/metamask/useMetaMaskEthersSigner';

interface VotePollProps {
  contractAddress: string;
  poll: Poll;
  onVoteSuccess?: () => void;
}

export default function VotePoll({ contractAddress, poll, onVoteSuccess }: VotePollProps) {
  const { vote, hasVoted, loading, error } = usePrivateVoting(contractAddress);
  const { signer } = useMetaMaskEthersSigner();
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
  const [checkingVoteStatus, setCheckingVoteStatus] = useState<boolean>(true);
  const [voting, setVoting] = useState<boolean>(false);

  const now = Math.floor(Date.now() / 1000);
  const isActive = now >= poll.start && now < poll.end && !poll.isSealed;
  const isEnded = now >= poll.end;

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!signer) {
        setCheckingVoteStatus(false);
        return;
      }

      try {
        const address = await signer.getAddress();
        const voted = await hasVoted(poll.id, address);
        setUserHasVoted(voted);
      } catch (err) {
        console.warn('Failed to check vote status:', err);
      } finally {
        setCheckingVoteStatus(false);
      }
    };

    checkVoteStatus();
  }, [signer, poll.id, hasVoted]);

  const handleVote = async () => {
    if (selectedOption === -1) {
      alert('Vui lòng chọn một lựa chọn');
      return;
    }

    if (!signer) {
      alert('Vui lòng kết nối ví MetaMask');
      return;
    }

    setVoting(true);

    try {
      const txHash = await vote(poll.id, selectedOption);
      console.log('Vote cast:', txHash);
      
      setUserHasVoted(true);
      setSelectedOption(-1);
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
      
      alert('Vote thành công!');
    } catch (err: any) {
      console.error('Failed to vote:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setVoting(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  const getStatusText = () => {
    if (poll.isSealed) return 'Đã đóng';
    if (isEnded) return 'Đã kết thúc';
    if (isActive) return 'Đang diễn ra';
    return 'Chưa bắt đầu';
  };

  const getStatusColor = () => {
    if (poll.isSealed) return 'bg-gray-500';
    if (isEnded) return 'bg-red-500';
    if (isActive) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  if (checkingVoteStatus) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra trạng thái vote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{poll.title}</h2>
        <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Lỗi: {error}
        </div>
      )}

      <div className="mb-6 text-sm text-gray-600">
        <p><strong>Bắt đầu:</strong> {formatTime(poll.start)}</p>
        <p><strong>Kết thúc:</strong> {formatTime(poll.end)}</p>
      </div>

      {userHasVoted ? (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-green-600 text-lg font-medium mb-2">
            ✅ Bạn đã vote thành công!
          </div>
          <p className="text-green-700">
            Lựa chọn của bạn đã được mã hóa và lưu trữ an toàn.
          </p>
        </div>
      ) : !isActive ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="text-gray-600">
            {isEnded ? 'Poll đã kết thúc' : 'Poll chưa bắt đầu'}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Chọn một lựa chọn:
          </h3>
          
          <div className="space-y-3 mb-6">
            {poll.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={index}
                  checked={selectedOption === index}
                  onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800">{option}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleVote}
            disabled={voting || selectedOption === -1}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voting ? 'Đang vote...' : 'Vote'}
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="font-medium text-blue-800 mb-2">Bảo mật:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Lựa chọn của bạn được mã hóa hoàn toàn</li>
          <li>• Không ai có thể xem được lựa chọn cá nhân</li>
          <li>• Kết quả chỉ được công bố sau khi poll kết thúc</li>
          <li>• Mỗi địa chỉ chỉ có thể vote 1 lần</li>
        </ul>
      </div>
    </div>
  );
}
