const cloudinaryConfig = require("../config/cloudinary.config");
const ResponseBuilder = require("../types/response/baseResponse");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

/**
 * Chunked Upload Service
 * Hỗ trợ upload file lớn bằng cách chia thành chunks và upload song song
 */
class ChunkedUploadService {
  constructor() {
    this.cloudinary = cloudinaryConfig.getInstance();
    this.isConfigured = cloudinaryConfig.isConfigured();
    this.chunkSize = 5 * 1024 * 1024; // 5MB per chunk
    this.maxConcurrentChunks = 3; // Upload 3 chunks concurrently
    this.tempDir = path.join(os.tmpdir(), "chunked-uploads");
    this.activeUploads = new Map(); // Track active uploads: uploadId -> { chunks, metadata }
    
    // Initialize temp directory
    this._ensureTempDir();
    
    // Cleanup old chunks periodically (every 1 hour)
    this._startCleanupJob();
  }

  /**
   * Ensure temp directory exists
   * @private
   */
  async _ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error("[ChunkedUploadService] Error creating temp directory:", error);
    }
  }

  /**
   * Generate unique upload ID
   * @private
   * @returns {String} Upload ID
   */
  _generateUploadId() {
    return `upload_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }

  /**
   * Initialize chunked upload
   * @param {Object} req - Express request object
   * @param {String} req.body.fileName - Original file name
   * @param {Number} req.body.fileSize - Total file size in bytes
   * @param {String} req.body.fileType - File type (VIDEO, AUDIO, IMAGE)
   * @param {String} req.body.mimeType - MIME type
   * @param {String} req.body.folder - Cloudinary folder (optional)
   * @returns {Promise<Object>} Upload initialization response
   */
  async initializeUpload(req) {
    const { fileName, fileSize, fileType, mimeType, folder } = req.body;

    // Validation
    if (!fileName || !fileSize || !fileType || !mimeType) {
      throw new AppError(
        "fileName, fileSize, fileType, and mimeType are required",
        400
      );
    }

    if (fileSize <= 0) {
      throw new AppError("File size must be greater than 0", 400);
    }

    // Validate file type
    const validFileTypes = ["VIDEO", "AUDIO", "IMAGE"];
    if (!validFileTypes.includes(fileType)) {
      throw new AppError(
        `Invalid fileType. Must be one of: ${validFileTypes.join(", ")}`,
        400
      );
    }

    // Calculate number of chunks
    const totalChunks = Math.ceil(fileSize / this.chunkSize);

    // Generate upload ID
    const uploadId = this._generateUploadId();

    // Initialize upload tracking
    const uploadInfo = {
      uploadId,
      fileName,
      fileSize,
      fileType,
      mimeType,
      folder: folder || null,
      totalChunks,
      uploadedChunks: new Set(),
      chunks: new Map(), // chunkIndex -> { buffer, uploaded: boolean }
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.activeUploads.set(uploadId, uploadInfo);

    return ResponseBuilder.success("Upload initialized successfully", {
      uploadId,
      chunkSize: this.chunkSize,
      totalChunks,
      maxConcurrentChunks: this.maxConcurrentChunks,
    });
  }

  /**
   * Upload a single chunk
   * @param {Object} req - Express request object
   * @param {String} req.params.uploadId - Upload ID
   * @param {Number} req.body.chunkIndex - Chunk index (0-based)
   * @param {Number} req.body.totalChunks - Total number of chunks
   * @param {Buffer} req.file.buffer - Chunk data
   * @returns {Promise<Object>} Chunk upload response
   */
  async uploadChunk(req) {
    const { uploadId } = req.params;
    // Values from multipart/form-data are strings; cast to numbers before validation
    const chunkIndex = Number(req.body.chunkIndex);
    const totalChunks = Number(req.body.totalChunks);
    const chunkBuffer = req.file?.buffer;

    if (!chunkBuffer) {
      throw new AppError("Chunk data is required", 400);
    }

    if (
      chunkIndex === undefined ||
      totalChunks === undefined ||
      Number.isNaN(chunkIndex) ||
      Number.isNaN(totalChunks)
    ) {
      throw new AppError("chunkIndex and totalChunks are required", 400);
    }

    // Get upload info
    const uploadInfo = this.activeUploads.get(uploadId);
    if (!uploadInfo) {
      throw new AppError("Upload session not found or expired", 404);
    }

    // Validate chunk index
    if (chunkIndex < 0 || chunkIndex >= uploadInfo.totalChunks) {
      throw new AppError("Invalid chunk index", 400);
    }

    if (totalChunks !== uploadInfo.totalChunks) {
      throw new AppError("Total chunks mismatch", 400);
    }

    // Check if chunk already uploaded
    if (uploadInfo.uploadedChunks.has(chunkIndex)) {
      return ResponseBuilder.success("Chunk already uploaded", {
        uploadId,
        chunkIndex,
        uploaded: true,
        progress: this._calculateProgress(uploadInfo),
      });
    }

    // Store chunk in memory (for small chunks) or temp file (for large chunks)
    uploadInfo.chunks.set(chunkIndex, {
      buffer: chunkBuffer,
      uploaded: false,
      size: chunkBuffer.length,
    });

    uploadInfo.uploadedChunks.add(chunkIndex);
    uploadInfo.lastActivity = new Date();

    // Calculate progress
    const progress = this._calculateProgress(uploadInfo);

    return ResponseBuilder.success("Chunk uploaded successfully", {
      uploadId,
      chunkIndex,
      uploaded: true,
      progress,
      uploadedChunks: uploadInfo.uploadedChunks.size,
      totalChunks: uploadInfo.totalChunks,
    });
  }

  /**
   * Merge chunks and upload to Cloudinary
   * @param {Object} req - Express request object
   * @param {String} req.params.uploadId - Upload ID
   * @param {String} req.body.publicId - Custom public ID (optional)
   * @returns {Promise<Object>} Final upload result
   */
  async mergeAndUpload(req) {
    const { uploadId } = req.params;
    const { publicId } = req.body;

    // Get upload info
    const uploadInfo = this.activeUploads.get(uploadId);
    if (!uploadInfo) {
      throw new AppError("Upload session not found or expired", 404);
    }

    // Check if all chunks are uploaded
    if (uploadInfo.uploadedChunks.size !== uploadInfo.totalChunks) {
      throw new AppError(
        `Not all chunks uploaded. Progress: ${uploadInfo.uploadedChunks.size}/${uploadInfo.totalChunks}`,
        400
      );
    }

    try {
      // Merge chunks in order
      const mergedBuffer = await this._mergeChunks(uploadInfo);

      // Upload to Cloudinary
      const cloudinaryResult = await this._uploadToCloudinary(
        mergedBuffer,
        uploadInfo,
        publicId
      );

      // Cleanup
      this._cleanupUpload(uploadId);

      return ResponseBuilder.success("File uploaded successfully", {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        size: cloudinaryResult.bytes,
        format: cloudinaryResult.format,
        duration: cloudinaryResult.duration,
        ...cloudinaryResult,
      });
    } catch (error) {
      console.error("[ChunkedUploadService] Error merging/uploading:", error);
      throw new AppError(
        `Failed to merge and upload file: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get upload status
   * @param {Object} req - Express request object
   * @param {String} req.params.uploadId - Upload ID
   * @returns {Promise<Object>} Upload status
   */
  async getUploadStatus(req) {
    const { uploadId } = req.params;

    const uploadInfo = this.activeUploads.get(uploadId);
    if (!uploadInfo) {
      return ResponseBuilder.notFoundError("Upload session not found");
    }

    const progress = this._calculateProgress(uploadInfo);
    const uploadedChunks = Array.from(uploadInfo.uploadedChunks).sort(
      (a, b) => a - b
    );
    const missingChunks = [];

    for (let i = 0; i < uploadInfo.totalChunks; i++) {
      if (!uploadInfo.uploadedChunks.has(i)) {
        missingChunks.push(i);
      }
    }

    return ResponseBuilder.success("Upload status retrieved", {
      uploadId,
      fileName: uploadInfo.fileName,
      fileSize: uploadInfo.fileSize,
      fileType: uploadInfo.fileType,
      totalChunks: uploadInfo.totalChunks,
      uploadedChunks: uploadInfo.uploadedChunks.size,
      progress,
      uploadedChunksList: uploadedChunks,
      missingChunks,
      createdAt: uploadInfo.createdAt,
      lastActivity: uploadInfo.lastActivity,
    });
  }

  /**
   * Cancel upload and cleanup
   * @param {Object} req - Express request object
   * @param {String} req.params.uploadId - Upload ID
   * @returns {Promise<Object>} Cancel response
   */
  async cancelUpload(req) {
    const { uploadId } = req.params;

    const uploadInfo = this.activeUploads.get(uploadId);
    if (!uploadInfo) {
      return ResponseBuilder.notFoundError("Upload session not found");
    }

    this._cleanupUpload(uploadId);

    return ResponseBuilder.success("Upload cancelled successfully", {
      uploadId,
    });
  }

  /**
   * Merge chunks in order
   * @private
   * @param {Object} uploadInfo - Upload info object
   * @returns {Promise<Buffer>} Merged buffer
   */
  async _mergeChunks(uploadInfo) {
    const chunks = [];
    
    // Collect chunks in order
    for (let i = 0; i < uploadInfo.totalChunks; i++) {
      const chunkData = uploadInfo.chunks.get(i);
      if (!chunkData) {
        throw new AppError(`Chunk ${i} not found`, 500);
      }
      chunks.push(chunkData.buffer);
    }

    // Merge buffers
    return Buffer.concat(chunks);
  }

  /**
   * Upload merged file to Cloudinary
   * @private
   * @param {Buffer} buffer - File buffer
   * @param {Object} uploadInfo - Upload info
   * @param {String} publicId - Custom public ID
   * @returns {Promise<Object>} Cloudinary result
   */
  async _uploadToCloudinary(buffer, uploadInfo, publicId = null) {
    if (!this.isConfigured) {
      throw new AppError("Cloudinary is not configured", 500);
    }

    // Get file type config
    const uploadService = require("./upload.service");
    const config = uploadService.constructor.FILE_TYPES[uploadInfo.fileType];
    if (!config) {
      throw new AppError(`Invalid file type: ${uploadInfo.fileType}`, 400);
    }

    const uploadOptions = {
      resource_type: config.resourceType,
      folder: uploadInfo.folder || config.folder,
      overwrite: false,
      invalidate: true,
      use_filename: true,
      unique_filename: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    try {
      // Upload to Cloudinary using stream for large files
      const result = await new Promise((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Write buffer to stream
        uploadStream.end(buffer);
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        duration: result.duration,
        resourceType: result.resource_type,
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error("[ChunkedUploadService] Cloudinary upload error:", error);
      throw new AppError(
        `Failed to upload to Cloudinary: ${error.message}`,
        500
      );
    }
  }

  /**
   * Calculate upload progress
   * @private
   * @param {Object} uploadInfo - Upload info
   * @returns {Number} Progress percentage (0-100)
   */
  _calculateProgress(uploadInfo) {
    if (uploadInfo.totalChunks === 0) return 0;
    return Math.round(
      (uploadInfo.uploadedChunks.size / uploadInfo.totalChunks) * 100
    );
  }

  /**
   * Cleanup upload data
   * @private
   * @param {String} uploadId - Upload ID
   */
  _cleanupUpload(uploadId) {
    const uploadInfo = this.activeUploads.get(uploadId);
    if (uploadInfo) {
      // Clear chunks from memory
      uploadInfo.chunks.clear();
      uploadInfo.uploadedChunks.clear();
    }
    this.activeUploads.delete(uploadId);
  }

  /**
   * Start cleanup job for expired uploads
   * @private
   */
  _startCleanupJob() {
    // Cleanup uploads older than 1 hour
    setInterval(() => {
      const now = new Date();
      const expiredUploads = [];

      for (const [uploadId, uploadInfo] of this.activeUploads.entries()) {
        const timeSinceLastActivity =
          now - uploadInfo.lastActivity.getTime();
        const oneHour = 60 * 60 * 1000;

        if (timeSinceLastActivity > oneHour) {
          expiredUploads.push(uploadId);
        }
      }

      expiredUploads.forEach((uploadId) => {
        console.log(
          `[ChunkedUploadService] Cleaning up expired upload: ${uploadId}`
        );
        this._cleanupUpload(uploadId);
      });

      if (expiredUploads.length > 0) {
        console.log(
          `[ChunkedUploadService] Cleaned up ${expiredUploads.length} expired uploads`
        );
      }
    }, 60 * 60 * 1000); // Run every hour
  }
}

module.exports = new ChunkedUploadService();

