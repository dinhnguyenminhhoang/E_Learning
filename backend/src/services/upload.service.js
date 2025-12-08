const cloudinaryConfig = require("../config/cloudinary.config");
const ResponseBuilder = require("../types/response/baseResponse");
const AppError = require("../utils/appError");

/**
 * File Upload Service using Cloudinary
 * Hỗ trợ upload: video, audio, image và các file types khác
 */
class UploadService {
  constructor() {
    this.cloudinary = cloudinaryConfig.getInstance();
    this.isConfigured = cloudinaryConfig.isConfigured();
  }

  /**
   * File type configurations
   */
  static FILE_TYPES = {
    VIDEO: {
      resourceType: "video",
      allowedMimeTypes: [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo", // avi
      ],
      maxSize: 100 * 1024 * 1024, // 100MB
      folder: "videos",
    },
    AUDIO: {
      resourceType: "video", // Cloudinary uses 'video' resource type for audio
      allowedMimeTypes: [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
        "audio/aac",
        "audio/flac",
      ],
      maxSize: 50 * 1024 * 1024, // 50MB
      folder: "audio",
    },
    IMAGE: {
      resourceType: "image",
      allowedMimeTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      folder: "images",
    },
  };

  /**
   * Validate file before upload
   * @private
   * @param {Object} file - File object from multer
   * @param {String} fileType - Type of file (VIDEO, AUDIO, IMAGE)
   * @returns {Object} Validation result
   */
  _validateFile(file, fileType) {
    if (!file) {
      throw new AppError("No file provided", 400);
    }

    const config = this.constructor.FILE_TYPES[fileType];
    if (!config) {
      throw new AppError(`Invalid file type: ${fileType}`, 400);
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError(
        `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(", ")}`,
        400
      );
    }

    // Check file size
    if (file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024);
      throw new AppError(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
        400
      );
    }

    return config;
  }

  /**
   * Generate upload options for Cloudinary
   * @private
   * @param {Object} config - File type configuration
   * @param {Object} options - Additional options
   * @returns {Object} Cloudinary upload options
   */
  _getUploadOptions(config, options = {}) {
    const {
      folder = config.folder,
      publicId = null,
      transformation = null,
      overwrite = false,
      invalidate = true,
      resourceType = config.resourceType,
    } = options;

    const uploadOptions = {
      resource_type: resourceType,
      folder: folder,
      overwrite: overwrite,
      invalidate: invalidate,
      use_filename: true,
      unique_filename: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    // Video/Audio specific options
    if (resourceType === "video") {
      uploadOptions.eager = [
        { format: "mp4", quality: "auto" },
        { format: "webm", quality: "auto" },
      ];
    }

    return uploadOptions;
  }

  /**
   * Upload file to Cloudinary
   * @private
   * @param {Buffer|String} fileData - File buffer or file path
   * @param {Object} config - File type configuration
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async _uploadToCloudinary(fileData, config, options = {}) {
    if (!this.isConfigured) {
      throw new AppError("Cloudinary is not configured", 500);
    }

    const uploadOptions = this._getUploadOptions(config, options);

    try {
      // Upload file
      const result = await this.cloudinary.uploader.upload(fileData, {
        ...uploadOptions,
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        duration: result.duration, // For video/audio
        resourceType: result.resource_type,
        createdAt: result.created_at,
        // Additional metadata
        originalFilename: result.original_filename,
        folder: result.folder,
      };
    } catch (error) {
      console.error("[UploadService] Cloudinary upload error:", error);
      throw new AppError(
        `Failed to upload file to Cloudinary: ${error.message}`,
        500
      );
    }
  }

  /**
   * Upload video file
   * @param {Object} file - File object from multer (req.file)
   * @param {Object} options - Upload options
   * @param {String} options.folder - Custom folder name (default: "videos")
   * @param {String} options.publicId - Custom public ID
   * @param {Object} options.transformation - Cloudinary transformation options
   * @returns {Promise<Object>} Upload result with video URL and metadata
   */
  async uploadVideo(file, options = {}) {
    const config = this._validateFile(file, "VIDEO");
    const uploadOptions = {
      ...options,
      folder: options.folder || config.folder,
    };

    const result = await this._uploadToCloudinary(
      file.buffer,
      config,
      uploadOptions
    );

    return ResponseBuilder.success("Video uploaded successfully", {
      videoUrl: result.url,
      publicId: result.publicId,
      duration: result.duration,
      size: result.bytes,
      format: result.format,
      ...result,
    });
  }

  /**
   * Upload audio file
   * @param {Object} file - File object from multer (req.file)
   * @param {Object} options - Upload options
   * @param {String} options.folder - Custom folder name (default: "audio")
   * @param {String} options.publicId - Custom public ID
   * @returns {Promise<Object>} Upload result with audio URL and metadata
   */
  async uploadAudio(file, options = {}) {
    const config = this._validateFile(file, "AUDIO");
    const uploadOptions = {
      ...options,
      folder: options.folder || config.folder,
    };

    const result = await this._uploadToCloudinary(
      file.buffer,
      config,
      uploadOptions
    );

    return ResponseBuilder.success("Audio uploaded successfully", {
      audioUrl: result.url,
      publicId: result.publicId,
      duration: result.duration,
      size: result.bytes,
      format: result.format,
      ...result,
    });
  }

  /**
   * Upload image file
   * @param {Object} file - File object from multer (req.file)
   * @param {Object} options - Upload options
   * @param {String} options.folder - Custom folder name (default: "images")
   * @param {String} options.publicId - Custom public ID
   * @param {Object} options.transformation - Cloudinary transformation options
   * @returns {Promise<Object>} Upload result with image URL and metadata
   */
  async uploadImage(file, options = {}) {
    const config = this._validateFile(file, "IMAGE");
    const uploadOptions = {
      ...options,
      folder: options.folder || config.folder,
    };

    const result = await this._uploadToCloudinary(
      file.buffer,
      config,
      uploadOptions
    );

    return ResponseBuilder.success("Image uploaded successfully", {
      imageUrl: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      size: result.bytes,
      format: result.format,
      ...result,
    });
  }

  /**
   * Generic file upload (auto-detect type)
   * @param {Object} file - File object from multer (req.file)
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, options = {}) {
    if (!file) {
      throw new AppError("No file provided", 400);
    }

    const mimeType = file.mimetype.toLowerCase();

    // Determine file type
    if (mimeType.startsWith("video/")) {
      return this.uploadVideo(file, options);
    } else if (mimeType.startsWith("audio/")) {
      return this.uploadAudio(file, options);
    } else if (mimeType.startsWith("image/")) {
      return this.uploadImage(file, options);
    } else {
      throw new AppError(
        `Unsupported file type: ${mimeType}. Supported types: video, audio, image`,
        400
      );
    }
  }

  /**
   * Upload file from URL (for YouTube links, etc.)
   * @param {String} url - File URL
   * @param {String} fileType - Type of file (VIDEO, AUDIO, IMAGE)
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFromUrl(url, fileType, options = {}) {
    if (!url) {
      throw new AppError("URL is required", 400);
    }

    const config = this.constructor.FILE_TYPES[fileType];
    if (!config) {
      throw new AppError(`Invalid file type: ${fileType}`, 400);
    }

    if (!this.isConfigured) {
      throw new AppError("Cloudinary is not configured", 500);
    }

    const uploadOptions = this._getUploadOptions(config, {
      ...options,
      folder: options.folder || config.folder,
    });

    try {
      const result = await this.cloudinary.uploader.upload(url, {
        ...uploadOptions,
      });

      return ResponseBuilder.success("File uploaded from URL successfully", {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        ...result,
      });
    } catch (error) {
      console.error("[UploadService] Cloudinary upload from URL error:", error);
      throw new AppError(
        `Failed to upload file from URL: ${error.message}`,
        500
      );
    }
  }

  /**
   * Delete file from Cloudinary
   * @param {String} publicId - Public ID of the file to delete
   * @param {String} resourceType - Resource type (image, video, raw)
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(publicId, resourceType = "auto") {
    if (!publicId) {
      throw new AppError("Public ID is required", 400);
    }

    if (!this.isConfigured) {
      throw new AppError("Cloudinary is not configured", 500);
    }

    try {
      // Auto-detect resource type if not provided
      let detectedResourceType = resourceType;
      if (resourceType === "auto") {
        // Try to get resource info first
        try {
          const resource = await this.cloudinary.api.resource(publicId);
          detectedResourceType = resource.resource_type;
        } catch (error) {
          // If resource not found, try common types
          detectedResourceType = "image";
        }
      }

      const result = await this.cloudinary.uploader.destroy(publicId, {
        resource_type: detectedResourceType,
        invalidate: true,
      });

      if (result.result === "ok") {
        return ResponseBuilder.success("File deleted successfully", {
          publicId: publicId,
          deleted: true,
        });
      } else if (result.result === "not found") {
        return ResponseBuilder.notFoundError("File not found");
      } else {
        throw new AppError(`Failed to delete file: ${result.result}`, 500);
      }
    } catch (error) {
      console.error("[UploadService] Cloudinary delete error:", error);
      throw new AppError(
        `Failed to delete file from Cloudinary: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get file info from Cloudinary
   * @param {String} publicId - Public ID of the file
   * @param {String} resourceType - Resource type (image, video, raw)
   * @returns {Promise<Object>} File info
   */
  async getFileInfo(publicId, resourceType = "image") {
    if (!publicId) {
      throw new AppError("Public ID is required", 400);
    }

    if (!this.isConfigured) {
      throw new AppError("Cloudinary is not configured", 500);
    }

    try {
      const result = await this.cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      return ResponseBuilder.success("File info retrieved successfully", {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        duration: result.duration,
        resourceType: result.resource_type,
        createdAt: result.created_at,
        ...result,
      });
    } catch (error) {
      console.error("[UploadService] Cloudinary get file info error:", error);
      if (error.http_code === 404) {
        return ResponseBuilder.notFoundError("File not found");
      }
      throw new AppError(
        `Failed to get file info: ${error.message}`,
        500
      );
    }
  }
}

module.exports = new UploadService();

