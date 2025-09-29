# 🚀 Chạy Private Voting System - Đơn giản nhất

## ⚡ Cách chạy nhanh (3 terminals)

### Terminal 1 - Hardhat Node
```bash
npm run hardhat-node
```

### Terminal 2 - Deploy Contract
```bash
npm run deploy:private-voting
```

### Terminal 3 - Frontend
```bash
npm run dev
```

## 📝 Sau khi deploy:

1. **Copy địa chỉ contract** từ Terminal 2
2. **Cập nhật trong file:** `packages/site/components/PrivateVotingDemo.tsx`
   - Tìm dòng 8: `const PRIVATE_VOTING_CONTRACT = '0x0000000000000000000000000000000000000000';`
   - Thay thế bằng địa chỉ contract thực

## 🌐 Truy cập:
- Frontend: http://localhost:3000
- Hardhat Node: http://localhost:8545

## 🎯 Sử dụng:
1. **Tạo Poll** - Điền thông tin poll
2. **Vote** - Chọn poll và vote
3. **Xem kết quả** - Sau khi poll kết thúc

## 🚨 Nếu gặp lỗi:
- Kiểm tra tất cả 3 terminals đang chạy
- Kiểm tra contract address đã đúng chưa
- Restart tất cả processes

## 📞 Cần hỗ trợ?
Xem file `WINDOWS_SETUP.md` để biết thêm chi tiết.
