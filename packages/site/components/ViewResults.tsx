'use client';

import { useState, useEffect } from 'react';
import { usePrivateVoting, Poll, PollResult } from '../hooks/usePrivateVoting';

interface ViewResultsProps {
  contractAddress: string;
  poll: Poll;
  onSealSuccess?: () => void;
}

export default function ViewResults({ contractAddress, poll, onSealSuccess }: ViewResultsProps) {
  const { getPollResults, sealPoll, loading, error } = usePrivateVoting(contractAddress);
  const [results, setResults] = useState<PollResult[]>([]);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);
  const [sealing, setSealing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const now = Math.floor(Date.now() / 1000);
  const isEnded = now >= poll.end;

  const loadResults = async () => {
    setLoadingResults(true);
    try {
      const pollResults = await getPollResults(poll.id);
      setResults(pollResults);
      setShowResults(true);
    } catch (err: any) {
      console.error('Failed to load results:', err);
      alert(`Lỗi khi tải kết quả: ${err.message}`);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSeal = async () => {
    if (!confirm('Bạn có chắc chắn muốn đóng poll này? Sau khi đóng, không thể vote thêm.')) {
      return;
    }

    setSealing(true);
    try {
      await sealPoll(poll.id);
      if (onSealSuccess) {
        onSealSuccess();
      }
      alert('Poll đã được đóng thành công!');
    } catch (err: any) {
      console.error('Failed to seal poll:', err);
      alert(`Lỗi khi đóng poll: ${err.message}`);
    } finally {
      setSealing(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN');
  };

  const getTotalVotes = () => {
    return results.reduce((total, result) => total + result.votes, 0);
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{poll.title}</h2>
        <span className={`px-3 py-1 rounded-full text-white text-sm ${
          poll.isSealed ? 'bg-gray-500' : isEnded ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {poll.isSealed ? 'Đã đóng' : isEnded ? 'Đã kết thúc' : 'Đang diễn ra'}
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

      {!isEnded && !poll.sealed ? (
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <div className="text-yellow-600 text-lg font-medium mb-2">
            ⏰ Poll vẫn đang diễn ra
          </div>
          <p className="text-yellow-700">
            Kết quả sẽ được công bố sau khi poll kết thúc.
          </p>
        </div>
      ) : (
        <div>
          {!showResults ? (
            <div className="text-center">
              <button
                onClick={loadResults}
                disabled={loadingResults}
                className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingResults ? 'Đang tải...' : 'Xem Kết Quả'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Kết quả Poll</h3>
                
                {results.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Chưa có vote nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results
                      .sort((a, b) => b.votes - a.votes)
                      .map((result, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{result.option}</span>
                            <span className="text-lg font-bold text-blue-600">
                              {result.votes} vote{result.votes !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getPercentage(result.votes)}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {getPercentage(result.votes)}%
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {results.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <span className="text-lg font-medium text-blue-800">
                        Tổng số vote: {getTotalVotes()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!poll.isSealed && isEnded && (
                <div className="border-t pt-4">
                  <button
                    onClick={handleSeal}
                    disabled={sealing}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sealing ? 'Đang đóng...' : 'Đóng Poll'}
                  </button>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Đóng poll để ngăn vote thêm
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-green-50 rounded-md">
        <h4 className="font-medium text-green-800 mb-2">Tính năng bảo mật:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Tất cả lựa chọn cá nhân được mã hóa hoàn toàn</li>
          <li>• Không ai có thể xem được lựa chọn của từng người</li>
          <li>• Kết quả được tính toán trên dữ liệu mã hóa</li>
          <li>• Chỉ hiển thị tổng số vote, không lộ thông tin cá nhân</li>
        </ul>
      </div>
    </div>
  );
}
