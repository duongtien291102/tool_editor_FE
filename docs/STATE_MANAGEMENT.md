# STATE_MANAGEMENT.md

## Triết lý chung

Quản lý trạng thái (State) là trái tim của một Video Editor. Cần thiết kế cẩn thận để tránh re-render diện rộng gây lag.

## Các loại State

1. **Editor State (Global & Complex)**:
   - _Dữ liệu_: Dữ liệu dự án, cấu trúc Timeline (Tracks, Clips), Properties của clip.
   - _Công cụ_: Sử dụng `Zustand`.
   - _Yêu cầu_: Phải hỗ trợ Undo/Redo (sử dụng thư viện như `zundo` hoặc tự viết Command history).

2. **Playback State (High Frequency)**:
   - _Dữ liệu_: Vị trí Playhead hiện tại (Current Time), Trạng thái Playing (True/False).
   - _Công cụ_: Không nên lưu trong Global State chung nếu nó làm trigger re-render toàn bộ ứng dụng. Ưu tiên dùng Event Emitter, Refs, hoặc atom state (Jotai) chỉ gắn vào các component cần thiết (Player, Playhead).

3. **UI State (Local / Ephemeral)**:
   - _Dữ liệu_: Trạng thái mở/đóng Modal, Tab đang chọn, kích thước Panel.
   - _Công cụ_: React `useState`, `useReducer`, hoặc lưu trong URL/LocalStorage để giữ trạng thái layout giữa các lần reload.

## Mô hình Dữ liệu (Dự kiến)

```typescript
interface Project {
  id: string;
  name: string;
  settings: {
    fps: number;
    width: number;
    height: number;
  };
}

interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
  clips: Clip[];
}

interface Clip {
  id: string;
  assetId: string; // Tham chiếu tới Asset
  startOffset: number; // Vị trí bắt đầu trên timeline (ms)
  duration: number; // Độ dài clip (ms)
  trimStart: number; // Phần bị cắt đầu của asset (ms)
  trimEnd: number; // Phần bị cắt đuôi của asset (ms)
  properties: {
    position: { x: number; y: number };
    scale: number;
    opacity: number;
    // ... custom properties for text/video
  };
}
```

## Undo / Redo

- Chỉ áp dụng Undo/Redo cho **Editor State** (thêm xóa clip, đổi vị trí, sửa thuộc tính).
- Không áp dụng cho UI State (mở tab, resize panel) hay Playback State.
