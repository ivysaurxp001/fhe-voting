# 🗳️ Private Voting System - Quick Start

Hệ thống bỏ phiếu bí mật sử dụng Fully Homomorphic Encryption (FHE) trên FHEVM.

## 🚀 Chạy nhanh

### 1. Khởi động Hardhat Node
```bash
cd packages/fhevm-hardhat-template
npm run hardhat:node
```

### 2. Deploy Contract
```bash
# Trong terminal mới
cd packages/fhevm-hardhat-template
npx hardhat run tasks/PrivateVoting.ts --network localhost
```

### 3. Cập nhật Contract Address
Sau khi deploy, copy địa chỉ contract và cập nhật trong:
- `packages/site/components/PrivateVotingDemo.tsx` (dòng 8)
- `packages/site/abi/PrivateVotingAddresses.ts`

### 4. Chạy Frontend
```bash
cd packages/site
npm run dev
```

### 5. Mở trình duyệt
Truy cập http://localhost:3000

## 📋 Cách sử dụng

### Tạo Poll
1. Click tab "Tạo Poll"
2. Điền thông tin:
   - Tiêu đề poll
   - Các lựa chọn (mỗi dòng một lựa chọn)
   - Thời gian bắt đầu và kết thúc
3. Click "Tạo Poll"

### Vote
1. Click tab "Vote"
2. Chọn poll từ danh sách
3. Chọn lựa chọn của bạn
4. Click "Vote"

### Xem kết quả
1. Click tab "Kết Quả"
2. Chọn poll từ danh sách
3. Click "Xem Kết Quả"

## 🔧 Cấu trúc dự án

```
packages/
├── fhevm-hardhat-template/
│   ├── contracts/
│   │   └── PrivateVoting.sol          # Smart contract
│   └── tasks/
│       └── PrivateVoting.ts          # Deploy tasks
└── site/
    ├── components/
    │   ├── PrivateVotingDemo.tsx     # Main demo component
    │   ├── CreatePoll.tsx            # Create poll component
    │   ├── VotePoll.tsx              # Vote component
    │   └── ViewResults.tsx            # Results component
    ├── hooks/
    │   └── usePrivateVoting.tsx      # Voting logic hook
    └── abi/
        ├── PrivateVotingABI.ts        # Contract ABI
        └── PrivateVotingAddresses.ts  # Contract addresses
```

## 🛠️ Tính năng

- ✅ **Mã hóa hoàn toàn**: Lựa chọn được mã hóa bằng FHE
- ✅ **Bảo mật cao**: Không ai có thể xem lựa chọn cá nhân
- ✅ **Minh bạch**: Kết quả được tính toán trên dữ liệu mã hóa
- ✅ **1 địa chỉ = 1 phiếu**: Ngăn chặn vote nhiều lần
- ✅ **Công bố kết quả**: Chỉ hiển thị tổng số vote

## 🔒 Bảo mật

- Sử dụng FHE để mã hóa lựa chọn cá nhân
- Không lưu trữ lựa chọn dạng plaintext
- Tính toán trên dữ liệu mã hóa
- Chỉ hiển thị kết quả tổng hợp

## 🚨 Lưu ý

- Cần FHEVM network để chạy
- Contract address cần được cập nhật sau khi deploy
- Relayer cần được cấu hình để decrypt kết quả
- Hiện tại sử dụng mock data cho demo

## 🐛 Troubleshooting

### Contract không deploy được
- Kiểm tra Hardhat node đang chạy
- Kiểm tra network configuration

### Frontend không kết nối được
- Kiểm tra contract address đã đúng chưa
- Kiểm tra MetaMask đã kết nối chưa

### Vote không thành công
- Kiểm tra poll còn đang diễn ra không
- Kiểm tra đã vote chưa
- Kiểm tra FHEVM instance

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong browser
2. Hardhat node logs
3. MetaMask connection
4. Contract deployment status
