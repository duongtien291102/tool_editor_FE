# FEATURE_LIST.md

## Core Features (MVP)

1. **Workspace & Layout**
   - Resizable Panels (kéo thả điều chỉnh kích thước).
   - Dockable Windows (tháo lắp các panel như Premiere).
   - Dark Mode UI mặc định.
   - Project Management (Tạo, Mở, Lưu trữ cục bộ/Cloud).

2. **AI Video Generation**
   - Khung nhập Prompt/Script.
   - Chọn phong cách video (Style, Aspect Ratio, Mood).
   - Nút "Generate" để gọi AI APIs sinh assets (Hình ảnh, Giọng nói, Video clips).

3. **Timeline Editor**
   - Đa track (Multi-track): Video, Audio, Text, B-Roll, Effects.
   - Chức năng cơ bản: Split, Trim, Delete, Duplicate clip.
   - Zoom in/out timeline, Snap to grid/clip.
   - Playhead (thanh trượt thời gian).

4. **Preview / Player**
   - Phát video realtime đồng bộ với Timeline.
   - Play, Pause, Seek tới frame cụ thể.
   - Hỗ trợ xem các overlay (Text, Hình ảnh chèn thêm).

5. **Asset Manager (Media Bin)**
   - Upload file từ máy tính.
   - Quản lý các file do AI sinh ra.
   - Phân loại (Video, Audio, Images).
   - Drag & Drop từ Asset Manager xuống Timeline.

6. **Properties / Inspector Panel**
   - Tùy chỉnh thông số của Clip đang chọn: Position, Scale, Opacity.
   - Chỉnh sửa nội dung Text, Font, Màu sắc.
   - Chỉnh sửa Volume thanh âm thanh.

## Advanced Features (Future)

- Keyframe Animation.
- Chuyển cảnh (Transitions).
- Hiệu ứng (Visual Effects, Color Grading LUTs).
- Audio Mixing (Waveform trực quan).
- Export & Rendering (Client-side bằng FFmpeg.wasm hoặc Server-side).
- Undo/Redo System.
- Keyboard Shortcuts toàn cục.
- Context Menu (Chuột phải).
