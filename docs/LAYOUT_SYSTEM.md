# LAYOUT_SYSTEM.md

## Nguyên lý Thiết kế Layout (IDE-like)

Sử dụng thư viện chuyên dụng (FlexLayout hoặc Golden Layout) để cung cấp khả năng tùy biến UI tối đa cho người dùng.

## Các tính năng Layout cốt lõi

1. **Dockable Panels**: Bất kỳ cửa sổ nào cũng có thể được kéo và gắn (dock) vào các vị trí khác (trên, dưới, trái, phải).
2. **Resizable**: Cho phép thay đổi kích thước của mọi panel.
3. **Floating Windows**: Cho phép kéo một panel ra thành một cửa sổ pop-out (hữu ích cho chế độ đa màn hình, đặc biệt là Preview).
4. **Tabs**: Nếu kéo 2 panel vào cùng một khu vực, chúng sẽ tự động gom thành dạng Tabbed UI.

## Các Panel Tiêu Chuẩn (Standard Panels)

- **Script / Prompt Panel**: Nơi người dùng nhập text kịch bản để AI xử lý.
- **Asset Manager (Media Bin)**: Quản lý file đầu vào.
- **Preview Player**: Màn hình xem trước video (Canvas/Video tag).
- **Timeline**: Khung thời gian đa track nằm ở dưới cùng.
- **Properties / Inspector**: Nằm bên phải, hiển thị thông số chi tiết của phần tử đang được chọn.

## Trạng thái Layout (Layout State)

- Được lưu cục bộ (`localStorage` hoặc `IndexedDB`) để khôi phục chính xác giao diện sau khi reload trình duyệt.
- Hỗ trợ các Layout Preset (VD: Default, AI Generating, Audio Editing, Color Correction).
