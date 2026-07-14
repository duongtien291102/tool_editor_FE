# ARCHITECTURE.md: Frontend Architecture

## Tổng quan (Overview)

Ứng dụng được thiết kế theo kiến trúc Module hóa (Modular Architecture), ưu tiên khả năng mở rộng và hiệu năng cao cho Desktop-class Web Application. Dự án tuân theo triết lý "Frontend-first", cho phép phát triển và kiểm thử độc lập hoàn toàn với Backend thông qua Mock API Layer.

## Tech Stack Đề Xuất

- **Core Framework**: React + Vite (Tối ưu SPA, tốc độ build nhanh cho Desktop-class app).
- **Ngôn ngữ**: TypeScript (Bắt buộc 100% strict mode).
- **State Management**: Zustand (Global state, Editor state).
- **Data Fetching & Caching**: TanStack Query (React Query).
- **Styling**: Tailwind CSS.
- **UI Components**: shadcn/ui (Accessible, customizable).
- **Layout & Drag/Drop**:
  - FlexLayout (Quản lý layout dockable, resizable như IDE).
  - dnd-kit (Cho các tác vụ kéo thả element vào timeline hoặc UI list).
- **Bảng dữ liệu**: TanStack Table (Cho Asset list dạng bảng, quản lý danh sách phức tạp).
- **Video/Canvas**: Remotion (Hỗ trợ render video programmatically).
- **Node-based Editor**: React Flow (Hỗ trợ nếu cần UI dạng node cho quy trình AI sinh video).
- **Code/Script Editor**: Monaco Editor (Trải nghiệm gõ kịch bản chuyên nghiệp như VSCode).
- **Shortcuts**: React Hotkeys (Quản lý phím tắt toàn cục và theo context).
- **Testing**:
  - Vitest (Unit/Integration Testing).
  - Playwright (E2E Testing).

## Thiết Kế Hệ Thống Cốt Lõi (Core Systems)

### 1. Plugin System

- **Mục đích**: Đảm bảo core app nhẹ và có thể mở rộng tính năng trong tương lai (ví dụ: thêm AI provider mới, thêm render engine mới) mà không sửa core.
- **Cách hoạt động**:
  - Core app định nghĩa các Extension Points (ví dụ: `registerPanel`, `registerToolbarItem`, `registerAIProvider`).
  - Các module độc lập (plugins) sẽ hook vào các điểm này lúc khởi tạo ứng dụng.

### 2. Theme Engine

- **Mục đích**: Quản lý giao diện linh hoạt (Mặc định Dark Mode).
- **Cách hoạt động**:
  - Dựa trên CSS Variables và Tailwind (kết hợp `next-themes` hoặc Provider tự viết).
  - Hỗ trợ đổi Theme màu (Primary/Accent) dynamic mà không cần reload trang.

### 3. Event Bus

- **Mục đích**: Giao tiếp giữa các component ở các góc khác nhau của ứng dụng mà không cần đi qua Global State (tránh re-render không cần thiết).
- **Cách hoạt động**:
  - Dùng cho các sự kiện tần suất cao (High-frequency events) như `onPlayheadMove`, `onVideoPlay`, `onTimelineScroll`.
  - Có thể tự build bằng RxJS hoặc thư viện nhỏ gọn (như `mitt`).

### 4. Mock API Layer

- **Mục đích**: Cho phép team Frontend làm việc 100% không cần chờ Backend.
- **Cách hoạt động**:
  - Sử dụng **MSW (Mock Service Worker)** để chặn các request HTTP/GraphQL ở mức Network.
  - Trả về dữ liệu giả lập giống hệt production.

## Cấu trúc thư mục (Directory Structure)

```text
src/
├── assets/          # Static assets (hình ảnh tĩnh, icons, fonts) không build qua bundler
├── components/      # UI components dùng chung, stateless
│   └── ui/          # Các component sinh ra từ shadcn/ui (Button, Dialog, Input...)
├── core/            # Logic nền tảng của toàn ứng dụng (Không chứa UI)
│   ├── plugin/      # Plugin System Manager
│   ├── event-bus/   # Event Bus implementation (mitt / rxjs)
│   └── theme/       # Theme provider và logic đổi màu
├── features/        # Phân chia theo Domain (Feature-based architecture)
│   ├── timeline/    # Mọi thứ về Timeline (UI, Logic, State nội bộ)
│   ├── player/      # Video Player và Preview logic
│   ├── asset-bank/  # Asset Manager, File Upload
│   └── script-ide/  # Monaco Editor integration cho kịch bản
├── hooks/           # Custom hooks dùng chung toàn app (useHotkeys, useClipboard)
├── layouts/         # Các layout chính (FlexLayout config, MainEditorLayout)
├── mocks/           # Mock API Layer (MSW handlers, mock data)
├── services/        # Lớp giao tiếp với bên ngoài (API, WebSocket)
│   └── api/         # TanStack Query configurations và fetchers
├── store/           # Global State Management (Zustand slices)
│   ├── editor/      # Undo/Redo, Timeline data
│   └── app/         # UI global state (Modal open, Layout state)
├── types/           # TypeScript Type definitions & Interfaces dùng chung
├── utils/           # Helper functions thuần túy (Math, Date, Formatters)
├── App.tsx          # Root component (Providers, Layout wrapper)
└── main.tsx         # Entry point (Khởi tạo MSW, mount React app)
```

### Lý do lựa chọn cấu trúc thư mục:

1. **Feature-based (`features/`)**: Giữ mọi logic, UI, types liên quan đến một tính năng ở cùng một chỗ. Khi Timeline phình to, ta không phải nhảy qua lại giữa `src/components`, `src/hooks`, `src/store` để sửa một lỗi của Timeline.
2. **`core/` tách biệt**: Tách hệ thống nền tảng (EventBus, Plugins) ra khỏi UI giúp code dễ test và dễ maintain.
3. **`mocks/`**: Được đặt ở thư mục gốc của src để dễ dàng inject vào `main.tsx` khi chạy ở môi trường development.
4. **`components/ui/`**: Cô lập toàn bộ code sinh ra từ `shadcn/ui`, giúp việc update component sau này dễ dàng hơn mà không lẫn lộn với component nghiệp vụ.
