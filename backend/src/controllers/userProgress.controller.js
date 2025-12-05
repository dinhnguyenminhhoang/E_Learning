const userProgressService = require("../services/userProgress.service");

class UserProgressController {
  /**
   * Lấy danh sách các block đã hoàn thành trong lesson
   */
  async getUserProgress(req, res) {
    const response = await userProgressService.getCompletedBlocksInLesson(req);
    return res.status(response.code).json(response);
  }

  /**
   * Đánh dấu block là "đang xem" (cho phép học lại block cũ)
   * Khi user chọn xem một block (kể cả block đã completed), cập nhật lastAccessedBlockId
   */
  async markBlockAsAccessing(req, res) {
    const response = await userProgressService.markBlockAsAccessing(req);
    return res.status(response.code).json(response);
  }
}

module.exports = new UserProgressController();
