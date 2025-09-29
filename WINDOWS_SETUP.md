# 🪟 Windows Setup Guide - Private Voting System

## 🚨 Vấn đề với npm install

Script `deploy-hardhat-node.sh` không thể chạy trên Windows. Tôi đã tạo script Node.js thay thế.

## 🔧 Cách chạy thủ công (Recommended)

### Bước 1: Cài đặt dependencies
```bash
# Cài đặt dependencies cho tất cả packages
npm install

# Hoặc cài đặt từng package riêng
cd packages/fhevm-hardhat-template
npm install

cd ../site
npm install
```

### Bước 2: Khởi động Hardhat Node
```bash
# Terminal 1
cd packages/fhevm-hardhat-template
npx hardhat node
```

### Bước 3: Deploy Contract (Terminal mới)
```bash
# Terminal 2
cd packages/fhevm-hardhat-template
npx hardhat run tasks/PrivateVoting.ts --network localhost
```

### Bước 4: Cập nhật Contract Address
Sau khi deploy, copy địa chỉ contract và cập nhật trong:
- `packages/site/components/PrivateVotingDemo.tsx` (dòng 8)
- `packages/site/abi/PrivateVotingAddresses.ts`

### Bước 5: Chạy Frontend
```bash
# Terminal 3
cd packages/site
npm run dev
```

### Bước 6: Mở trình duyệt
Truy cập http://localhost:3000

## 🛠️ Troubleshooting

### Lỗi "Contract not found"
- Kiểm tra Hardhat node đang chạy
- Kiểm tra contract address đã đúng chưa
- Kiểm tra network configuration

### Lỗi "FHEVM instance not available"
- Kiểm tra MetaMask đã kết nối chưa
- Kiểm tra network trong MetaMask
- Kiểm tra FHEVM configuration

### Lỗi "Transaction failed"
- Kiểm tra gas limit
- Kiểm tra account có đủ ETH không
- Kiểm tra contract deployment

## 📋 Checklist

- [ ] Hardhat node đang chạy trên port 8545
- [ ] Contract đã được deploy thành công
- [ ] Contract address đã được cập nhật
- [ ] Frontend đang chạy trên port 3000
- [ ] MetaMask đã kết nối
- [ ] Network configuration đúng

## 🎯 Quick Commands

```bash
# Start everything
npm run hardhat-node  # Terminal 1
npm run deploy:hardhat-node  # Terminal 2  
npm run dev  # Terminal 3 (from site directory)
```

## 🔍 Debug Commands

```bash
# Kiểm tra Hardhat node
npm run is-hardhat-node-running

# Deploy lại contract
cd packages/fhevm-hardhat-template
npx hardhat deploy --network localhost

# Kiểm tra contract
npx hardhat console --network localhost
```

## 📞 Nếu vẫn gặp vấn đề

1. Kiểm tra tất cả terminals đang chạy
2. Kiểm tra ports 8545 và 3000 không bị chiếm
3. Restart tất cả processes
4. Kiểm tra console logs trong browser
