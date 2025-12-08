const blockService = require("../services/block.service");

class BlockController {
  /**
   * GET /v1/api/block/:blockId
   * Lấy block by ID với format response giống request khi tạo (cho admin)
   */
  async getBlockById(req, res) {
    const response = await blockService.getBlockById(req);
    return res.status(response.code).json(response);
  }

  async getBlockWithProgress(req, res) {
    const response = await blockService.getBlockWithProgress(req);
    return res.status(response.code).json(response);
  }

  async heartbeat(req, res) {
    const response = await blockService.trackVideoHeartbeat(req);
    return res.status(response.code).json(response);
  }

  /**
   * Bắt đầu học một block - thêm block vào user progress với trạng thái chưa hoàn thành
   */
  async startLearningBlock(req, res) {
    const response = await blockService.startLearningBlock(req);
    return res.status(response.code).json(response);
  }
}

module.exports = new BlockController();
