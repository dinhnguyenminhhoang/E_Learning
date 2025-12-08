const multer = require("multer");
const AppError = require("../utils/appError");

/**
 * Multer configuration for chunk uploads
 * Chunks are smaller (5MB max), so we can use memory storage
 */
const storage = multer.memoryStorage();

/**
 * File filter for chunk uploads
 * Accepts any file type since chunks are binary data
 */
const fileFilter = (req, file, cb) => {
  // Chunks can be any binary data
  cb(null, true);
};

/**
 * Multer upload configuration for chunks
 */
const uploadChunk = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per chunk (safety margin)
  },
});

/**
 * Middleware for single chunk upload
 */
const uploadSingleChunk = uploadChunk.single("chunk");

module.exports = {
  uploadChunk,
  uploadSingleChunk,
};

