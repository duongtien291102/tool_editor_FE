# ASSET_PIPELINE.md

## Các loại Asset (Asset Types)

- **Image**: `png`, `jpg`, `webp`, `svg`.
- **Video**: `mp4`, `webm` (ưu tiên WebM có kênh alpha).
- **Audio**: `mp3`, `wav`.
- **Subtitle**: `srt`, `vtt`.
- **Font**: `.ttf`, `.woff2`.

## Vòng đời của một Asset

1. **Ingestion (Đầu vào)**
   - Upload file local hoặc Nhận từ AI Provider trả về.
2. **Processing (Xử lý tiền kỳ - nếu cần)**
   - Tạo Thumbnail ngay dưới Client (dùng Canvas/WebCodecs).
   - Trích xuất Waveform cho file Audio.
   - Chuyển đổi định dạng nếu cần thiết (Proxy generation).
3. **Storage (Lưu trữ)**
   - Lưu trữ tạm thời trên FileSystem API (IndexedDB) để thao tác tức thì.
   - Tải lên Cloud (S3/GCS) chạy ngầm (Background Sync).
4. **Referencing (Gắn kết)**
   - Asset tạo ra một ID duy nhất (`AssetID`). Các Clip trên Timeline chỉ reference đến `AssetID` này.

## Quản lý bộ nhớ (Memory Management)

- Không nạp toàn bộ file Video/Audio vào RAM.
- Dùng `URL.createObjectURL` cho các file Blob/File local. Luôn nhớ `URL.revokeObjectURL` khi xóa Asset để tránh Memory Leak (Cực kỳ quan trọng với Desktop Web App).
