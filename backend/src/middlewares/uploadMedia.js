const multer = require("multer");
const AppError = require("../utils/appError");

/**
 * Multer configuration for media uploads (video, audio, image)
 */
const storage = multer.memoryStorage();

/**
 * File filter for media files
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Video
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    // Audio
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/aac",
    "audio/flac",
    // Image
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed types: video (mp4, webm, ogg), audio (mp3, wav, ogg), image (jpeg, png, gif, webp)`,
        400
      ),
      false
    );
  }
};

/**
 * Multer upload configuration for media files
 */
const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (will be validated per file type in service)
  },
});

/**
 * Middleware for single file upload
 */
const uploadSingle = uploadMedia.single("file");

/**
 * Middleware for multiple files upload
 */
const uploadMultiple = uploadMedia.array("files", 10); // Max 10 files

/**
 * Middleware for specific field uploads
 */
const uploadFields = uploadMedia.fields([
  { name: "video", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

module.exports = {
  uploadMedia,
  uploadSingle,
  uploadMultiple,
  uploadFields,
};

