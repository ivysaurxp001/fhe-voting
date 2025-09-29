"use client";

import { usePrivateVoting } from '../hooks/usePrivateVoting';

const CONTRACT_ADDRESS = '0x90791c8472d9262395d72c76572c8d6728F0dfF2';

export default function PollDebug() {
  const { polls, loadPolls, loading, error } = usePrivateVoting(CONTRACT_ADDRESS);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Poll Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Contract Address:</strong> {CONTRACT_ADDRESS}
        </div>
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Polls Count:</strong> {polls.length}
        </div>
        <div>
          <strong>Error:</strong> {error || 'None'}
        </div>
      </div>

      {polls.length > 0 && (
        <div className="mt-4">
          <strong>Polls:</strong>
          <ul className="mt-2 space-y-1">
            {polls.map((poll) => (
              <li key={poll.id} className="text-sm bg-white p-2 rounded">
                <strong>ID:</strong> {poll.id} | <strong>Title:</strong> {poll.title} | 
                <strong> Options:</strong> {poll.options.length} | 
                <strong> Start:</strong> {new Date(poll.start * 1000).toLocaleString()} |
                <strong> End:</strong> {new Date(poll.end * 1000).toLocaleString()} |
                <strong> Sealed:</strong> {poll.isSealed ? 'Yes' : 'No'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={loadPolls}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Polls
      </button>
    </div>
  );
}
