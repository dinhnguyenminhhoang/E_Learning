const uploadService = require("../services/upload.service");
const { asynchandler } = require("../helpers/asyncHandler");

/**
 * Upload Controller
 * Handles file upload requests
 */
class UploadController {
  /**
   * POST /api/upload/video
   * Upload video file
   */
  async uploadVideo(req, res) {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "No file provided",
        data: null,
      });
    }

    const response = await uploadService.uploadVideo(req.file, {
      folder: req.body.folder || "videos",
      publicId: req.body.publicId || null,
    });

    return res.status(response.code).json(response);
  }

  /**
   * POST /api/upload/audio
   * Upload audio file
   */
  async uploadAudio(req, res) {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "No file provided",
        data: null,
      });
    }

    const response = await uploadService.uploadAudio(req.file, {
      folder: req.body.folder || "audio",
      publicId: req.body.publicId || null,
    });

    return res.status(response.code).json(response);
  }

  /**
   * POST /api/upload/image
   * Upload image file
   */
  async uploadImage(req, res) {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "No file provided",
        data: null,
      });
    }

    const response = await uploadService.uploadImage(req.file, {
      folder: req.body.folder || "images",
      publicId: req.body.publicId || null,
    });

    return res.status(response.code).json(response);
  }

  /**
   * POST /api/upload/file
   * Generic file upload (auto-detect type)
   */
  async uploadFile(req, res) {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "No file provided",
        data: null,
      });
    }

    const response = await uploadService.uploadFile(req.file, {
      folder: req.body.folder || null,
      publicId: req.body.publicId || null,
    });

    return res.status(response.code).json(response);
  }

  /**
   * POST /api/upload/url
   * Upload file from URL
   */
  async uploadFromUrl(req, res) {
    const { url, fileType, folder, publicId } = req.body;

    if (!url || !fileType) {
      return res.status(400).json({
        code: 400,
        message: "URL and fileType are required",
        data: null,
      });
    }

    const response = await uploadService.uploadFromUrl(url, fileType, {
      folder: folder || null,
      publicId: publicId || null,
    });

    return res.status(response.code).json(response);
  }

  /**
   * DELETE /api/upload/:publicId
   * Delete file from Cloudinary
   */
  async deleteFile(req, res) {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    const response = await uploadService.deleteFile(
      publicId,
      resourceType || "auto"
    );

    return res.status(response.code).json(response);
  }

  /**
   * GET /api/upload/:publicId/info
   * Get file info from Cloudinary
   */
  async getFileInfo(req, res) {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    const response = await uploadService.getFileInfo(
      publicId,
      resourceType || "image"
    );

    return res.status(response.code).json(response);
  }
}

module.exports = new UploadController();

