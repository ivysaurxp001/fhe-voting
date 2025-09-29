'use client';

import { useState, useEffect } from 'react';
import { usePrivateVoting, Poll } from '../hooks/usePrivateVoting';
import CreatePoll from './CreatePoll';
import VotePoll from './VotePoll';
import ViewResults from './ViewResults';

// Contract address - đã deploy thành công
const PRIVATE_VOTING_CONTRACT = '0x90791c8472d9262395d72c76572c8d6728F0dfF2';

export default function PrivateVotingDemo() {
  const { polls, loadPolls, loading } = usePrivateVoting(PRIVATE_VOTING_CONTRACT);
  const [activeTab, setActiveTab] = useState<'create' | 'vote' | 'results'>('create');
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const handlePollCreated = () => {
    loadPolls();
    setActiveTab('vote');
  };

  const handleVoteSuccess = () => {
    loadPolls();
  };

  const handleSealSuccess = () => {
    loadPolls();
  };

  const now = Math.floor(Date.now() / 1000);

  const getPollStatus = (poll: Poll) => {
    if (poll.isSealed) return 'sealed';
    if (now >= poll.end) return 'ended';
    if (now >= poll.start) return 'active';
    return 'upcoming';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sealed': return 'Đã đóng';
      case 'ended': return 'Đã kết thúc';
      case 'active': return 'Đang diễn ra';
      case 'upcoming': return 'Chưa bắt đầu';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sealed': return 'bg-gray-500';
      case 'ended': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🗳️ Private Voting System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hệ thống bỏ phiếu bí mật sử dụng Fully Homomorphic Encryption (FHE).
          Lựa chọn của bạn được mã hóa hoàn toàn và không ai có thể xem được.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center mb-8">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tạo Poll
        </button>
        <button
          onClick={() => setActiveTab('vote')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'vote'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vote
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'results'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Kết Quả
        </button>
      </div>

      {/* Create Poll Tab */}
      {activeTab === 'create' && (
        <CreatePoll
          contractAddress={PRIVATE_VOTING_CONTRACT}
          onPollCreated={handlePollCreated}
        />
      )}

      {/* Vote Tab */}
      {activeTab === 'vote' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Chọn Poll để Vote</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải polls...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Chưa có poll nào. Hãy tạo poll đầu tiên!</p>
            </div>
          ) : (
            <div className="grid gap-4 mb-6">
              {polls.map((poll) => {
                const status = getPollStatus(poll);
                return (
                  <div
                    key={poll.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPoll?.id === poll.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedPoll(poll)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{poll.title}</h3>
                        <p className="text-sm text-gray-600">
                          {poll.options.length} lựa chọn • 
                          Bắt đầu: {new Date(poll.start * 1000).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedPoll && (
            <VotePoll
              contractAddress={PRIVATE_VOTING_CONTRACT}
              poll={selectedPoll}
              onVoteSuccess={handleVoteSuccess}
            />
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Xem Kết Quả Poll</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải polls...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Chưa có poll nào.</p>
            </div>
          ) : (
            <div className="grid gap-4 mb-6">
              {polls.map((poll) => {
                const status = getPollStatus(poll);
                return (
                  <div
                    key={poll.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPoll?.id === poll.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedPoll(poll)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{poll.title}</h3>
                        <p className="text-sm text-gray-600">
                          {poll.options.length} lựa chọn • 
                          Kết thúc: {new Date(poll.end * 1000).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedPoll && (
            <ViewResults
              contractAddress={PRIVATE_VOTING_CONTRACT}
              poll={selectedPoll}
              onSealSuccess={handleSealSuccess}
            />
          )}
        </div>
      )}

      {/* Contract Address Info */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">⚠️ Lưu ý quan trọng:</h3>
        <p className="text-sm text-yellow-700">
          Contract address hiện tại: <code className="bg-yellow-100 px-2 py-1 rounded">{PRIVATE_VOTING_CONTRACT}</code>
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          Bạn cần deploy contract và cập nhật địa chỉ trong file này để sử dụng.
        </p>
      </div>
    </div>
  );
}
