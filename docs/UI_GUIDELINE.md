# UI_GUIDELINE.md

## Triết lý Design

1. **Professional & Clean**: Giống các phần mềm đồ họa chuyên nghiệp (Dark theme, độ tương phản vừa đủ, không chói mắt).
2. **Dense but Readable**: Hiển thị nhiều thông tin (thông số, clip) nhưng vẫn dễ đọc. Padding/Margin nhỏ gọn hơn web thông thường (Desktop-class).
3. **Responsive & Dynamic**: Mọi vùng không gian phải có thể thay đổi kích thước.

## Màu sắc (Color Palette)

- **Background**: `gray-900` hoặc `#1E1E1E` (Màu nền chính của app).
- **Panel Background**: `gray-800` hoặc `#252526`.
- **Primary / Accent**: `blue-500` hoặc `#007FD4` (Màu cho trạng thái active, nút bấm chính).
- **Text Primary**: `gray-100` (Tiêu đề, text chính).
- **Text Secondary**: `gray-400` (Label, thông tin phụ).
- **Timeline Tracks**: Các màu nhẹ (muted) cho các loại track khác nhau (Video màu xanh nhạt, Audio màu xanh lá, Text màu tím).

## Typography

- **Font-family**: Inter, Roboto, hoặc System UI mặc định (San Francisco trên Mac, Segoe UI trên Windows). Kích thước font chủ yếu từ `12px` đến `14px` để tiết kiệm không gian.
- **Font-weight**: Regular (400) cho body, SemiBold (600) cho Titles.

## Layout & Tương tác

- **Resizing**: Sử dụng các splitter line (vạch chia) giữa các panel. Hover vào splitter sẽ đổi con trỏ chuột (`col-resize`, `row-resize`).
- **Context Menus**: Mọi click chuột phải trên file, clip, track đều hiện Context Menu riêng (Custom menu, override menu mặc định của trình duyệt).
- **Tooltips**: Bắt buộc có tooltip cho các icon buttons.
- **Scrollbars**: Custom scrollbar nhỏ gọn, chỉ hiện khi hover.

## Trạng thái UI (UI States)

- **Hover**: Thay đổi màu background nhẹ để nhận biết.
- **Active / Selected**: Có viền (border/ring) màu Primary sáng.
- **Disabled**: Giảm opacity xuống 50%, cấm pointer events.
- **Loading**: Sử dụng Skeleton mượt mà cho ảnh/video, spinner nhỏ gọn cho các button.
