const WordService = require("../services/word.service");
const ResponseBuilder = require("../types/response/baseResponse");

class WordController {
  async createWord(req, res) {
    try {
      const result = await WordService.createWord(req);
      res.status(result.code).json(result);
    } catch (err) {
      console.error("Create word error:", err);
      res.status(500).json(ResponseBuilder.error("Internal server error", 500));
    }
  }
  async getWordsByCategory(req, res) {
    try {
      const result = await WordService.getWordsByCategory(req);
      res.status(result.code).json(result);
    } catch (err) {
      console.error("Get words by category error:", err);
      res.status(500).json(ResponseBuilder.error("Internal server error", 500));
    }
  }

  async deleteWord(req, res) {
    const result = await WordService.deleteWord(req);
    res.status(result.code).json(result);
  }

  async updateWord(req, res) {
    const result = await WordService.updateWord(req);
    res.status(result.code).json(result);
  }

  async importWords(req, res) {
    const result = await WordService.importWords(req);
    res.status(result.code).json(result);
  }

  async exportSampleWords(req, res) {
    try {
      const { buffer, fileName } = await WordService.exportSampleFile();

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.send(buffer);
    } catch (error) {
      res
        .status(500)
        .json(ResponseBuilder.error("Export failed", error.message));
    }
  }
}

module.exports = new WordController();
