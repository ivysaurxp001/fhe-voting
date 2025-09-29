# Private Voting System trên FHEVM

Hệ thống bỏ phiếu bí mật sử dụng Fully Homomorphic Encryption (FHE) để đảm bảo tính riêng tư hoàn toàn.

## Tính năng

- **Mã hóa hoàn toàn**: Lựa chọn của mỗi người được mã hóa bằng FHE
- **Bảo mật cao**: Không ai có thể xem được lựa chọn cá nhân
- **Minh bạch**: Kết quả được tính toán trên dữ liệu mã hóa
- **1 địa chỉ = 1 phiếu**: Ngăn chặn vote nhiều lần
- **Công bố kết quả**: Chỉ hiển thị tổng số vote, không lộ thông tin cá nhân

## Cách sử dụng

### 1. Deploy Contract

```bash
# Chạy hardhat node
npm run hardhat:node

# Deploy contract
npx hardhat run tasks/PrivateVoting.ts --network localhost
```

### 2. Cập nhật Contract Address

Sau khi deploy, cập nhật địa chỉ contract trong:
- `packages/site/components/PrivateVotingDemo.tsx` (dòng 8)
- `packages/site/abi/PrivateVotingAddresses.ts`

### 3. Chạy Frontend

```bash
cd packages/site
npm run dev
```

### 4. Sử dụng

1. **Tạo Poll**: Điền thông tin poll, thời gian bắt đầu/kết thúc
2. **Vote**: Chọn lựa chọn và vote (lựa chọn được mã hóa)
3. **Xem kết quả**: Sau khi poll kết thúc, xem kết quả tổng hợp

## Cấu trúc Code

### Smart Contract
- `contracts/PrivateVoting.sol`: Contract chính với logic FHE
- `tasks/PrivateVoting.ts`: Tasks deploy và test

### Frontend
- `hooks/usePrivateVoting.tsx`: Hook quản lý state và tương tác contract
- `components/CreatePoll.tsx`: Component tạo poll
- `components/VotePoll.tsx`: Component vote
- `components/ViewResults.tsx`: Component xem kết quả
- `components/PrivateVotingDemo.tsx`: Component chính tích hợp tất cả

### ABI & Addresses
- `abi/PrivateVotingABI.ts`: ABI của contract
- `abi/PrivateVotingAddresses.ts`: Địa chỉ contract theo network

## Luồng hoạt động

1. **Tạo Poll**: Admin tạo poll với các lựa chọn và thời gian
2. **Vote**: User chọn lựa chọn, lựa chọn được mã hóa bằng FHE
3. **Tính toán**: Contract cộng dồn kết quả trên dữ liệu mã hóa
4. **Công bố**: Sau khi kết thúc, decrypt tổng số vote cho từng lựa chọn

## Bảo mật

- Sử dụng FHE để mã hóa lựa chọn cá nhân
- Không lưu trữ lựa chọn dạng plaintext
- Tính toán trên dữ liệu mã hóa
- Chỉ hiển thị kết quả tổng hợp

## Mở rộng

- Quadratic Voting: Vote với trọng số
- Weighted Voting: Vote với điểm số khác nhau
- Whitelist: Chỉ cho phép địa chỉ được phép vote
- Multi-choice: Vote nhiều lựa chọn cùng lúc

## Lưu ý

- Cần FHEVM network để chạy
- Contract address cần được cập nhật sau khi deploy
- Relayer cần được cấu hình để decrypt kết quả
