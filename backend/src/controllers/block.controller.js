const blockService = require("../services/block.service");

class BlockController {
  async getBlockWithProgress(req, res) {
    const response = await blockService.getBlockWithProgress(req);
    return res.status(response.code).json(response);
  }

  async heartbeat(req, res) {
    const response = await blockService.trackVideoHeartbeat(req);
    return res.status(response.code).json(response);
  }
}

module.exports = new BlockController();
