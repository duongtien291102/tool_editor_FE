# WORKSPACE.md

## Cơ chế Local-First

Để đạt hiệu năng của ứng dụng Desktop, mọi thao tác chỉnh sửa, cấu trúc Timeline, metadata dự án đều phải lưu xuống Browser Storage trước khi đồng bộ lên Cloud.

## Các cấp độ cấu trúc

- **Workspace**: Lưu các thiết lập của người dùng (Darkmode, Layout preset, AI Provider API keys, Keyboard shortcuts tùy chỉnh).
- **Project**: Một dự án cụ thể. Có ID, thư mục (ảo) chứa assets, file config `.json` mô tả timeline.

## Autosave & Persistence

- Sử dụng **IndexedDB** (qua thư viện như `idb` hoặc tích hợp sẵn trong Zustand Persist, Dexie.js).
- **Throttled Autosave**: Mọi thay đổi của Editor State (Undo/Redo stack thay đổi) sẽ trigger lưu dự án, nhưng bị throttle khoảng 2 giây một lần để không quá tải Disk I/O.

## Versioning (Snapshot)

- Mỗi khi người dùng yêu cầu AI generate lại toàn bộ dự án (từ Script mới), hệ thống tạo ra một Version (Snapshot).
- Người dùng có thể xem lại cây lịch sử các version (như Figma Version History).
