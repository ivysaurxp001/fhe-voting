# 🚀 Chạy Private Voting System NGAY BÂY GIỜ

## ⚡ Cách nhanh nhất (Windows)

### 1. Chạy script tự động
```bash
# Double-click file này hoặc chạy:
start-voting-system.bat
```

### 2. Hoặc chạy thủ công từng bước:

#### Terminal 1 - Hardhat Node
```bash
cd packages/fhevm-hardhat-template
npx hardhat node
```

#### Terminal 2 - Deploy Contract  
```bash
cd packages/fhevm-hardhat-template
npx hardhat run tasks/PrivateVoting.ts --network localhost
```

#### Terminal 3 - Frontend
```bash
cd packages/site
npm run dev
```

## 🔧 Sau khi deploy contract:

1. **Copy địa chỉ contract** từ terminal 2
2. **Cập nhật trong 2 files:**
   - `packages/site/components/PrivateVotingDemo.tsx` (dòng 8)
   - `packages/site/abi/PrivateVotingAddresses.ts`

## 🌐 Truy cập:
- Frontend: http://localhost:3000
- Hardhat Node: http://localhost:8545

## 🎯 Sử dụng:
1. **Tạo Poll** - Điền thông tin poll
2. **Vote** - Chọn poll và vote
3. **Xem kết quả** - Sau khi poll kết thúc

## 🚨 Nếu gặp lỗi:
- Kiểm tra tất cả terminals đang chạy
- Kiểm tra contract address đã đúng chưa
- Restart tất cả processes

## 📞 Cần hỗ trợ?
Xem file `WINDOWS_SETUP.md` để biết thêm chi tiết.
