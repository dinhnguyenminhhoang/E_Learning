const chunkedUploadService = require("../services/chunkedUpload.service");
const { asynchandler } = require("../helpers/asyncHandler");

/**
 * Chunked Upload Controller
 * Handles chunked file upload requests
 */
class ChunkedUploadController {
  /**
   * POST /api/upload/chunked/initialize
   * Initialize chunked upload session
   */
  async initializeUpload(req, res) {
    const response = await chunkedUploadService.initializeUpload(req);
    return res.status(response.code).json(response);
  }

  /**
   * POST /api/upload/chunked/:uploadId/chunk
   * Upload a single chunk
   */
  async uploadChunk(req, res) {
    const response = await chunkedUploadService.uploadChunk(req);
    return res.status(response.code).json(response);
  }

  /**
   * POST /api/upload/chunked/:uploadId/merge
   * Merge all chunks and upload to Cloudinary
   */
  async mergeAndUpload(req, res) {
    const response = await chunkedUploadService.mergeAndUpload(req);
    return res.status(response.code).json(response);
  }

  /**
   * GET /api/upload/chunked/:uploadId/status
   * Get upload status
   */
  async getUploadStatus(req, res) {
    const response = await chunkedUploadService.getUploadStatus(req);
    return res.status(response.code).json(response);
  }

  /**
   * DELETE /api/upload/chunked/:uploadId
   * Cancel upload and cleanup
   */
  async cancelUpload(req, res) {
    const response = await chunkedUploadService.cancelUpload(req);
    return res.status(response.code).json(response);
  }
}

module.exports = new ChunkedUploadController();

