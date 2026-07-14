# DOMAIN_MODEL.md

## Định nghĩa Entity Cốt Lõi

1. **Workspace (Không gian làm việc)**
   - Lưu trữ cấu hình người dùng, danh sách Projects, và thông tin xác thực.
   - Là container cấp cao nhất.

2. **Project (Dự án)**
   - Bao gồm toàn bộ dữ liệu để render thành một video.
   - Chứa: Metadata (tên, độ phân giải, fps), danh sách Assets, và cấu trúc Timeline.

3. **Scene (Cảnh - Tùy chọn)**
   - Một đoạn video phức tạp có thể được chia thành nhiều Scene để dễ quản lý.
   - Mỗi Scene có Timeline riêng. Cấu trúc có thể gộp thành một Master Timeline.

4. **Track (Kênh)**
   - Một hàng trên Timeline.
   - Phân loại: VideoTrack, AudioTrack, TextTrack, EffectTrack.
   - Chứa một danh sách các Clips.

5. **Clip (Đoạn cắt)**
   - Đơn vị cấu thành trên Timeline.
   - Tham chiếu đến một Asset (File gốc).
   - Chứa thông tin: `startOffset` (vị trí trên timeline), `duration`, `trimStart`, `trimEnd`.
   - Thuộc tính (Properties): Position, Scale, Opacity, Rotation, Volume.

6. **Asset (Tài nguyên)**
   - File vật lý hoặc virtual (Hình ảnh, Video, Âm thanh, Text).
   - Lưu trong Asset Bank (Media Bin).
   - Có thể được tái sử dụng bởi nhiều Clip khác nhau.

7. **Effect / Transition (Hiệu ứng / Chuyển cảnh)**
   - Effect: Áp dụng lên toàn bộ một Clip hoặc Track.
   - Transition: Đặt ở giữa hai Clip trên cùng một Track.

8. **Keyframe (Điểm neo hiệu ứng)**
   - Lưu trữ giá trị của một thuộc tính (Property) tại một thời điểm cụ thể.
   - Dùng để nội suy (interpolate) chuyển động hoặc biến đổi.

## Sơ đồ Quan Hệ (Relationships)

- **Workspace** (1) ── (n) **Project**
- **Project** (1) ── (n) **Asset**
- **Project** (1) ── (n) **Track**
- **Track** (1) ── (n) **Clip**
- **Clip** (n) ── (1) **Asset**
- **Clip** (1) ── (n) **Keyframe** / **Effect**
