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
   * Mark vocabulary block as completed when all flashcards are studied
   */
  async markVocabularyComplete(req, res) {
    const response = await blockService.markVocabularyComplete(req);
    return res.status(response.code).json(response);
  }

  /**
   * Bắt đầu học một block - thêm block vào user progress với trạng thái chưa hoàn thành
   */
  async startLearningBlock(req, res) {
    const response = await blockService.startLearningBlock(req);
    return res.status(response.code).json(response);
  }

  /**
   * POST /v1/api/block/ai-generate
   * Generate block content using AI
   */
  async aiGenerateBlockContent(req, res) {
    const response = await blockService.aiGenerateBlockContent(req);
    return res.status(response.code).json(response);
  }
}

module.exports = new BlockController();
