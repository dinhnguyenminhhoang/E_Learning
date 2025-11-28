const targetService = require("../services/target.service");

class TargetController {
  async getAllTargets(req, res) {
    const response = await targetService.getAllTargets(req);
    return res.status(response.code).json(response);
  }

  async getUnassignedTargets(req, res) {
    const response = await targetService.getUnassignedTargets();
    return res.status(response.code).json(response);
  }

  async createTarget(req, res) {
    const response = await targetService.createTarget(req);
    return res.status(response.code).json(response);
  }

  async updateTarget(req, res) {
    const response = await targetService.updateTarget(req);
    return res.status(response.code).json(response);
  }

  async deleteTarget(req, res) {
    const response = await targetService.deleteTarget(req);
    return res.status(response.code).json(response);
  }
}

module.exports = new TargetController();
