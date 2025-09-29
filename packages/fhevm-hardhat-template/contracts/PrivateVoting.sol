// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, euint8, euint32, ebool, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";

contract PrivateVoting is Ownable {
    constructor() Ownable(msg.sender) {}
    
    using FHE for euint8;
    using FHE for euint32;
    using FHE for ebool;

    struct Poll {
        string title;
        string[] options;              // Option labels (công khai)
        euint32[] encTallies;          // Mỗi options[i] có 1 tally mã hoá
        uint64 start;                  // epoch seconds
        uint64 end;                    // epoch seconds
        mapping(address => bool) voted;
        bool isSealed;                 // khoá sau khi kết thúc (không vote nữa)
        address creator;
    }

    uint256 public pollCount;
    mapping(uint256 => Poll) private polls;

    event PollCreated(uint256 indexed pollId, string title, string[] options, uint64 start, uint64 end);
    event Voted(uint256 indexed pollId, address indexed voter);
    event Sealed(uint256 indexed pollId);

    modifier onlyRunning(uint256 pollId) {
        Poll storage p = polls[pollId];
        require(block.timestamp >= p.start && block.timestamp < p.end, "not running");
        require(!p.isSealed, "sealed");
        _;
    }

    function createPoll(
        string memory title,
        string[] memory options,
        uint64 start,
        uint64 end
    ) external returns (uint256 pollId) {
        require(options.length >= 2 && options.length <= 16, "2..16 options");
        require(start < end, "time");

        pollId = ++pollCount;
        Poll storage p = polls[pollId];
        p.title = title;
        p.creator = msg.sender;
        p.start = start;
        p.end = end;

        // Lưu labels công khai
        for (uint i = 0; i < options.length; i++) p.options.push(options[i]);
        // Tạo tally mã hoá = 0 cho từng lựa chọn
        for (uint i = 0; i < options.length; i++) {
            p.encTallies.push(FHE.asEuint32(0));
        }

        emit PollCreated(pollId, title, options, start, end);
    }

    /// @notice encChoice là externalEuint8 (encrypted choice index)
    function vote(uint256 pollId, externalEuint8 encChoice, bytes calldata attestation) external onlyRunning(pollId) {
        Poll storage p = polls[pollId];
        require(!p.voted[msg.sender], "already voted");
        p.voted[msg.sender] = true;

        euint8 choice = FHE.fromExternal(encChoice, attestation);
        require(FHE.isSenderAllowed(choice), "not allowed");

        for (uint i = 0; i < p.encTallies.length; i++) {
            ebool isI = choice.eq(FHE.asEuint8(uint8(i)));
            euint32 inc = FHE.select(isI, FHE.asEuint32(1), FHE.asEuint32(0));
            p.encTallies[i] = FHE.add(p.encTallies[i], inc);
        }

        // Persist access for later use
        for (uint i = 0; i < p.encTallies.length; i++) {
            FHE.allow(p.encTallies[i], address(this));
        }

        emit Voted(pollId, msg.sender);
    }

    /// Khoá sổ sau khi hết hạn (tuỳ chọn, giúp UI rõ ràng)
    function seal(uint256 pollId) external {
        Poll storage p = polls[pollId];
        require(msg.sender == p.creator || msg.sender == owner(), "no auth");
        require(block.timestamp >= p.end, "not ended");
        p.isSealed = true;
        emit Sealed(pollId);
    }

    // -------- Views cho UI --------

    function getMeta(uint256 pollId) external view returns (
        string memory title,
        string[] memory options,
        uint64 start,
        uint64 end,
        bool isSealed
    ) {
        Poll storage p = polls[pollId];
        return (p.title, p.options, p.start, p.end, p.isSealed);
    }

    /// @notice Lấy tally ở dạng ciphertext để front-end xin quyền re-encrypt/decrypt
    /// Trả ra mảng euint32 (encrypted tallies)
    function getEncryptedTallies(uint256 pollId) external view returns (euint32[] memory out) {
        Poll storage p = polls[pollId];
        out = new euint32[](p.encTallies.length);
        for (uint i = 0; i < p.encTallies.length; i++) {
            out[i] = p.encTallies[i];
        }
    }

    function hasVoted(uint256 pollId, address user) external view returns (bool) {
        return polls[pollId].voted[user];
    }
}