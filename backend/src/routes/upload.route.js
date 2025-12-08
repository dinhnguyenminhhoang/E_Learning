const { Router } = require("express");
const uploadController = require("../controllers/upload.controller");
const chunkedUploadController = require("../controllers/chunkedUpload.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");
const { uploadSingle } = require("../middlewares/uploadMedia");
const { uploadSingleChunk } = require("../middlewares/uploadChunk");

const router = Router();

/**
 * POST /v1/api/upload/video
 * Upload video file
 * Body: multipart/form-data with 'file' field
 * Optional: folder, publicId
 */
router.post(
  "/video",
  authenticate,
  uploadSingle,
  asynchandler(uploadController.uploadVideo)
);

/**
 * POST /v1/api/upload/audio
 * Upload audio file
 * Body: multipart/form-data with 'file' field
 * Optional: folder, publicId
 */
router.post(
  "/audio",
  authenticate,
  uploadSingle,
  asynchandler(uploadController.uploadAudio)
);

/**
 * POST /v1/api/upload/image
 * Upload image file
 * Body: multipart/form-data with 'file' field
 * Optional: folder, publicId
 */
router.post(
  "/image",
  authenticate,
  uploadSingle,
  asynchandler(uploadController.uploadImage)
);

/**
 * POST /v1/api/upload/file
 * Generic file upload (auto-detect type)
 * Body: multipart/form-data with 'file' field
 * Optional: folder, publicId
 */
router.post(
  "/file",
  authenticate,
  uploadSingle,
  asynchandler(uploadController.uploadFile)
);

/**
 * POST /v1/api/upload/url
 * Upload file from URL (for YouTube links, etc.)
 * Body: { url: string, fileType: "VIDEO" | "AUDIO" | "IMAGE", folder?: string, publicId?: string }
 */
router.post(
  "/url",
  authenticate,
  asynchandler(uploadController.uploadFromUrl)
);

/**
 * DELETE /v1/api/upload/:publicId
 * Delete file from Cloudinary
 * Query: resourceType (optional, default: "auto")
 */
router.delete(
  "/:publicId",
  authenticate,
  asynchandler(uploadController.deleteFile)
);

/**
 * GET /v1/api/upload/:publicId/info
 * Get file info from Cloudinary
 * Query: resourceType (optional, default: "image")
 */
router.get(
  "/:publicId/info",
  authenticate,
  asynchandler(uploadController.getFileInfo)
);

// ===== CHUNKED UPLOAD ROUTES =====

/**
 * POST /v1/api/upload/chunked/initialize
 * Initialize chunked upload session
 * Body: { fileName, fileSize, fileType, mimeType, folder? }
 */
router.post(
  "/chunked/initialize",
  authenticate,
  asynchandler(chunkedUploadController.initializeUpload)
);

/**
 * POST /v1/api/upload/chunked/:uploadId/chunk
 * Upload a single chunk
 * Body: multipart/form-data with 'chunk' field
 * Body: { chunkIndex, totalChunks }
 */
router.post(
  "/chunked/:uploadId/chunk",
  authenticate,
  uploadSingleChunk,
  asynchandler(chunkedUploadController.uploadChunk)
);

/**
 * POST /v1/api/upload/chunked/:uploadId/merge
 * Merge all chunks and upload to Cloudinary
 * Body: { publicId? }
 */
router.post(
  "/chunked/:uploadId/merge",
  authenticate,
  asynchandler(chunkedUploadController.mergeAndUpload)
);

/**
 * GET /v1/api/upload/chunked/:uploadId/status
 * Get upload status
 */
router.get(
  "/chunked/:uploadId/status",
  authenticate,
  asynchandler(chunkedUploadController.getUploadStatus)
);

/**
 * DELETE /v1/api/upload/chunked/:uploadId
 * Cancel upload and cleanup
 */
router.delete(
  "/chunked/:uploadId",
  authenticate,
  asynchandler(chunkedUploadController.cancelUpload)
);

module.exports = router;

