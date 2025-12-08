const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/appError");

/**
 * Cloudinary Configuration
 * Sử dụng CLOUDINARY_URL từ environment variable
 * Format: cloudinary://api_key:api_secret@cloud_name
 */
class CloudinaryConfig {
  constructor() {
    this.initialize();
  }

  initialize() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (!cloudinaryUrl) {
      console.warn(
        "[CloudinaryConfig] CLOUDINARY_URL not found in environment variables"
      );
      return;
    }

    try {
      // Parse CLOUDINARY_URL
      // Format: cloudinary://api_key:api_secret@cloud_name
      const urlMatch = cloudinaryUrl.match(
        /cloudinary:\/\/([^:]+):([^@]+)@(.+)/
      );

      if (!urlMatch) {
        throw new Error("Invalid CLOUDINARY_URL format");
      }

      const [, apiKey, apiSecret, cloudName] = urlMatch;

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true, // Use HTTPS
      });

      console.log("[CloudinaryConfig] Cloudinary initialized successfully");
    } catch (error) {
      console.error("[CloudinaryConfig] Error initializing Cloudinary:", error);
      throw new AppError("Cloudinary configuration failed", 500);
    }
  }

  /**
   * Get Cloudinary instance
   * @returns {Object} Cloudinary instance
   */
  getInstance() {
    return cloudinary;
  }

  /**
   * Verify Cloudinary is configured
   * @returns {Boolean}
   */
  isConfigured() {
    return !!(
      cloudinary.config().cloud_name &&
      cloudinary.config().api_key &&
      cloudinary.config().api_secret
    );
  }
}

module.exports = new CloudinaryConfig();

