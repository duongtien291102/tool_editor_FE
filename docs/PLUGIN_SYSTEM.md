# PLUGIN_SYSTEM.md

## Triết lý Extensibility

Ứng dụng được thiết kế theo hướng có thể mở rộng (Extensible by design). Mọi tính năng lớn không thuộc Core đều có thể viết dưới dạng Plugin.

## Vòng đời của Plugin (Lifecycle)

1. **Initialize (Khởi tạo)**: Plugin load các config cơ bản.
2. **Register (Đăng ký)**: Gọi các Hooks do Core cung cấp để đăng ký UI hoặc logic.
3. **Activate (Kích hoạt)**: Bắt đầu lắng nghe Event Bus.
4. **Deactivate/Unregister**: Dọn dẹp bộ nhớ, gỡ UI.

## Các Extension Points (Hook API)

- `registerPanel(id, title, component)`: Thêm một cửa sổ mới vào Layout System.
- `registerTool(id, icon, action)`: Thêm một công cụ vào thanh Toolbar của Timeline.
- `registerAIProvider(providerConfig)`: Đăng ký một service AI mới (VD thêm Sora hoặc Flux).
- `registerContextMenu(target, menuItems)`: Gắn các lựa chọn vào menu chuột phải.

## Sandbox và Quyền (Permissions)

- Tương lai (nếu cho phép 3rd party plugin): Plugin không được đọc trực tiếp Global Store, phải thông qua các hàm Getter/Setter (API Bridge).
- Đối với in-house plugin: Có quyền truy cập vào Global Store, nhưng phải tuân thủ việc mutate state thông qua Command System.
