'use client';

import { useState } from 'react';
import { usePrivateVoting } from '../hooks/usePrivateVoting';

interface CreatePollProps {
  contractAddress: string;
  onPollCreated?: (pollId: number) => void;
}

export default function CreatePoll({ contractAddress, onPollCreated }: CreatePollProps) {
  const { createPoll, loading, error } = usePrivateVoting(contractAddress);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !options.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const optionsArray = options.split('\n').filter(opt => opt.trim());
    if (optionsArray.length < 2) {
      alert('Cần ít nhất 2 lựa chọn');
      return;
    }

    if (optionsArray.length > 16) {
      alert('Tối đa 16 lựa chọn');
      return;
    }

    const start = Math.floor(new Date(startTime).getTime() / 1000);
    const end = Math.floor(new Date(endTime).getTime() / 1000);

    if (start >= end) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    try {
      const txHash = await createPoll(title, optionsArray, start, end);
      console.log('Poll created:', txHash);
      
      // Reset form
      setTitle('');
      setOptions('');
      setStartTime('');
      setEndTime('');
      
      if (onPollCreated) {
        // We don't have the poll ID from the transaction, so we'll just refresh
        onPollCreated(0);
      }
      
      alert('Tạo poll thành công!');
    } catch (err: any) {
      console.error('Failed to create poll:', err);
      alert(`Lỗi: ${err.message}`);
    }
  };

  // Set default times (now and 1 hour from now)
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  
  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tạo Poll Mới</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Lỗi: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề Poll *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tiêu đề poll..."
            required
          />
        </div>

        <div>
          <label htmlFor="options" className="block text-sm font-medium text-gray-700 mb-2">
            Các lựa chọn (mỗi dòng một lựa chọn) *
          </label>
          <textarea
            id="options"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Lựa chọn 1&#10;Lựa chọn 2&#10;Lựa chọn 3"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Tối thiểu 2, tối đa 16 lựa chọn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian bắt đầu *
            </label>
            <input
              type="datetime-local"
              id="startTime"
              value={startTime || formatDateTime(now)}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian kết thúc *
            </label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime || formatDateTime(oneHourLater)}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo...' : 'Tạo Poll'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Lưu ý:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Mỗi địa chỉ ví chỉ có thể vote 1 lần</li>
          <li>• Lựa chọn của bạn sẽ được mã hóa và không ai có thể xem được</li>
          <li>• Kết quả chỉ được công bố sau khi poll kết thúc</li>
          <li>• Bạn có thể seal poll sau khi kết thúc để ngăn vote thêm</li>
        </ul>
      </div>
    </div>
  );
}
