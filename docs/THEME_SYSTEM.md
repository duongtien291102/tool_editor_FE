# THEME_SYSTEM.md

## Cơ sở kiến trúc (Design Tokens)

Toàn bộ dự án sử dụng CSS Variables để thiết lập Design Tokens. Tailwind CSS sẽ tiêu thụ (consume) các biến này, mang lại khả năng runtime-theming.

## Các biến cốt lõi (Core Tokens)

- **Colors**:
  - `bg-background`: Màu nền chính (rất tối cho IDE, VD: `#111111`).
  - `bg-panel`: Màu nền của các panel (sáng hơn nền chính, VD: `#18181b`).
  - `bg-primary`: Màu chủ đạo (Accent, VD: `#2563eb`).
  - `text-foreground`: Màu chữ chính.
  - `text-muted`: Màu chữ phụ.
  - `border-color`: Màu đường viền giữa các panel.
- **Spacing**: Sử dụng chuẩn 4px của Tailwind (`p-1`, `p-2`, `p-4`). IDE cần layout khít (Dense) nên ưu tiên các scale nhỏ (`p-1`, `p-2`).
- **Typography**: Mặc định font Sans-serif (Inter, Roboto). Font Mono cho hiển thị timecode.
- **Radius**: `0px` hoặc `2px`. Giao diện phần mềm chuyên nghiệp ưu tiên viền vuông vức (sharp) hoặc bo tròn rất nhỏ.

## Motion & Animation

- Do ứng dụng có tính chất thao tác nhanh, **giảm thiểu CSS animation**.
- Không dùng Transition cho hover effect ngoại trừ các nút Primary.
- Các thao tác kéo thả cần mượt mà nhưng không được có "bounce" hay delay.

## Khả năng tùy biến

- Hỗ trợ đổi Theme màu chính (Primary Accent).
- Cấu trúc thư mục CSS: Tạo file `tokens.css` nạp trước khi nạp Tailwind.
