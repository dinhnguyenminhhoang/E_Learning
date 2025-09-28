const RESPONSE_MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo mới thành công",
    UPDATED: "Cập nhật thành công",
    DELETED: "Xóa thành công",
    FETCHED: "Lấy dữ liệu thành công",
    OK: "Thành công",
  },
  ERROR: {
    VALIDATION_FAILED: "Dữ liệu không hợp lệ",
    DUPLICATE_WORD: "Từ đã tồn tại",
    WORD_NOT_FOUND: "không tồn tại",
    UNAUTHORIZED: "Bạn chưa được xác thực",
    FORBIDDEN: "Bạn không có quyền truy cập",
    INTERNAL_SERVER_ERROR: "Lỗi máy chủ",
    NOT_FOUND: "Không tìm thấy tài nguyên",
    CONFLICT: "Xung đột dữ liệu",
    BAD_REQUEST: "Yêu cầu không hợp lệ",
  },
};

module.exports = RESPONSE_MESSAGES;
