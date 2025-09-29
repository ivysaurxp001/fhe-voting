export const PrivateVotingABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string[]", "name": "options", "type": "string[]"},
      {"internalType": "uint64", "name": "start", "type": "uint64"},
      {"internalType": "uint64", "name": "end", "type": "uint64"}
    ],
    "name": "createPoll",
    "outputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "bytes", "name": "encChoice", "type": "bytes"},
      {"internalType": "bytes", "name": "attestation", "type": "bytes"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "seal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getMeta",
    "outputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string[]", "name": "options", "type": "string[]"},
      {"internalType": "uint64", "name": "start", "type": "uint64"},
      {"internalType": "uint64", "name": "end", "type": "uint64"},
      {"internalType": "bool", "name": "sealed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getEncryptedTallies",
    "outputs": [{"internalType": "uint32[]", "name": "out", "type": "uint32[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "hasVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pollCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "title", "type": "string"},
      {"indexed": false, "internalType": "string[]", "name": "options", "type": "string[]"},
      {"indexed": false, "internalType": "uint64", "name": "start", "type": "uint64"},
      {"indexed": false, "internalType": "uint64", "name": "end", "type": "uint64"}
    ],
    "name": "PollCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "voter", "type": "address"}
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "pollId", "type": "uint256"}
    ],
    "name": "Sealed",
    "type": "event"
  }
] as const;
