# Ăn gì đây?

Web nội bộ để nhóm tạo các phiên đặt đồ độc lập.

1. Người đặt tạo phiên và nhập các món có sẵn.
2. Thành viên tick món; món ngoài danh sách được ghi vào ô **Món khác**.
3. Người đặt khóa danh sách, đặt món bên ngoài, rồi nhập tổng hóa đơn và tổng số lượng món.
4. Người đặt chọn **chia đều theo người tham gia** hoặc **chia theo món**.
5. Người đặt tải QR/thông tin nhận tiền.
6. Mỗi thành viên tự tick **Đã chuyển tiền**. Người đặt xem tiến độ và đối soát.
7. Hoàn tất phiên. Dữ liệu, lịch sử và thống kê được gắn với mã phiên riêng, không chỉ với ngày đặt.

Schema D1 trong `db/schema.ts` lưu phiên, menu, lựa chọn món và trạng thái thanh toán. Ảnh QR/hóa đơn được dành cho R2 (`FILES`), còn dữ liệu tra cứu được lưu trong D1 (`DB`).
