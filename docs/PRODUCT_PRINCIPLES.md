# PRODUCT_PRINCIPLES.md

Bất kỳ tính năng mới, giao diện mới, hoặc đoạn code nào được viết ra cho dự án này đều phải tuyệt đối tuân thủ 10 nguyên tắc UX/UI sau đây:

1. **Không thêm popup (modal) nếu có thể dùng panel**: Hạn chế tối đa việc che khuất không gian làm việc. Mọi thao tác cấu hình nên nằm ở Properties Panel (bên phải) hoặc các Dockable Panel.
2. **Không dùng wizard nhiều bước nếu có thể hiển thị trực tiếp**: Người dùng chuyên nghiệp cần kiểm soát ngay lập tức. Đặt mọi thứ trong tầm mắt thay vì bắt họ qua nhiều bước Next/Back.
3. **Mỗi thao tác quan trọng tối đa 3 lần click**: Đảm bảo quãng đường di chuyển chuột ngắn nhất có thể. Sử dụng Context Menu hoặc Panel cạnh bên.
4. **Ưu tiên kéo thả (Drag & Drop) thay vì nhập liệu**: Việc chèn ảnh vào Video, đưa Audio vào Timeline, hay tạo hiệu ứng phải làm được thông qua kéo thả trực quan.
5. **Mọi thao tác render / xử lý nặng đều phải chạy nền và có thể hủy (Cancelable)**: Các tác vụ gọi AI, render video, xuất file không được chiếm dụng toàn bộ màn hình. Có Progress Bar hiển thị ngầm.
6. **Không khóa giao diện (Never Freeze UI) khi AI đang xử lý**: Người dùng phải có thể tiếp tục xem video, kéo thả asset khác trong khi chờ AI sinh một clip khác.
7. **Luôn hỗ trợ Undo nếu thao tác có thể hoàn tác**: Xóa clip, di chuyển clip, thay đổi text, áp dụng màu sắc... mọi thứ đều phải `Ctrl/Cmd + Z` được.
8. **Feedback phản hồi tức thì (Instant feedback)**: Khi bấm nút, Playhead di chuyển, hoặc áp dụng tham số, UI phải phản hồi dưới 16ms (60 FPS), không được có độ trễ do API hay logic xử lý phức tạp.
9. **Nhất quán về không gian (Spatial Consistency)**: Nếu một công cụ (ví dụ Volume) nằm ở góc phải dưới, nó luôn ở đó. Tránh việc UI nhảy múa tùy theo context.
10. **Keyboard-first cho power user**: Mọi thao tác click chuột thường xuyên đều phải có Phím tắt toàn cục tương ứng (như Space, Delete, C (Cut), V (Pointer)).
