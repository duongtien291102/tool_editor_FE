# Feature Definition Checklist

Bảng kiểm chuẩn mực trước khi hợp nhất (merge) bất kỳ Feature nào vào hệ thống chính. Tất cả Feature phải tuân thủ nghiêm ngặt để đảm bảo kiến trúc AI Video Studio bền vững.

## 1. Cấu trúc (Architecture & Isolation)

- [ ] Feature phải nằm gọn trong thư mục `src/features/[feature-name]`.
- [ ] Tuân thủ cấu trúc thư mục tiêu chuẩn:
  - `components/` (UI Components của riêng feature)
  - `hooks/` (Custom hooks chứa logic React)
  - `services/` (Tầng giao tiếp API/Backend giả lập)
  - `store/` (State Management cục bộ bằng Zustand/Context)
  - `types/` (TypeScript interfaces/types)
  - `mock/` (Dữ liệu giả lập - BẮT BUỘC có trong giai đoạn Prototype)
  - `index.ts` (Public API của Feature)
- [ ] Feature **KHÔNG** import trực tiếp state hoặc component từ Feature khác trừ khi qua Event Bus hoặc Store dùng chung đã thỏa thuận.

## 2. Trạng thái (State Management)

- [ ] UI Component chỉ render, không chứa Business Logic rườm rà.
- [ ] Logic phải nằm trong Store (Zustand) hoặc Custom Hooks.
- [ ] Store lấy dữ liệu thông qua Services, không nạp trực tiếp mock data.

## 3. Giao tiếp ngoài (Public API)

- [ ] File `index.ts` chỉ export ra những Component, Types và Hooks mà các hệ thống khác thực sự cần.
- [ ] Giấu đi các Component con bên trong (để private).

## 4. UI & Mocking

- [ ] Tái sử dụng tối đa UI Elements từ thư viện chung (`src/components/ui/` - shadcn).
- [ ] Component lỗi không được sập toàn ứng dụng (Đã được bọc `GlobalErrorBoundary` bởi Layout).
- [ ] Tất cả data rendering phải dựa trên Mock Data trong thư mục `mock/`.

## 5. Hiệu năng & Khả năng mở rộng

- [ ] Render ít nhất có thể (Sử dụng selector chính xác trong Zustand).
- [ ] Tên file, biến số phải bằng tiếng Anh, chuẩn camelCase hoặc PascalCase.
