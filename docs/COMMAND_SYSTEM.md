# COMMAND_SYSTEM.md

## Mẫu thiết kế (Command Pattern)

Để hỗ trợ tính năng Undo/Redo không giới hạn và đáng tin cậy, mọi thay đổi ảnh hưởng đến dữ liệu dự án (Editor State) phải được thực hiện thông qua Command.

## Cấu trúc Command Interface

```typescript
interface ICommand {
  /** Tên hoặc ID của command để ghi log/hiển thị UI */
  name: string;

  /** Hàm thực thi thay đổi */
  execute(): void;

  /** Hàm hoàn tác thay đổi */
  undo(): void;
}
```

## History Stack (Ngăn xếp lịch sử)

- Gồm 2 stack: `UndoStack` và `RedoStack`.
- Giới hạn độ sâu: 50 - 100 commands để tối ưu bộ nhớ.
- Khi người dùng thực hiện Command mới:
  1. `execute()` được gọi.
  2. Command được đẩy vào `UndoStack`.
  3. Xóa sạch `RedoStack`.

## Tích hợp với Global State (Zustand)

- Thay vì sử dụng Snapshot (lưu toàn bộ state mỗi lần thay đổi - gây tốn RAM), sử dụng **Patch-based Command** (lưu lại sự khác biệt - diff).
- Các Command cụ thể: `AddClipCommand`, `MoveClipCommand`, `UpdatePropertyCommand`.
- Những thay đổi diễn ra liên tục (như kéo thanh trượt Timeline hoặc kéo Clip) sẽ dùng một Command trung gian và chỉ commit (đẩy vào UndoStack) khi thao tác kết thúc (Mouse Up).
