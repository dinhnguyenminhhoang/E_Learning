import { apiClient } from "@/config/api.config";
import axios from "axios";

export interface InitializeUploadResponse {
  code: number;
  message: string;
  data: {
    uploadId: string;
    chunkSize: number;
    totalChunks: number;
    maxConcurrentChunks: number;
  };
}

export interface ChunkUploadResponse {
  code: number;
  message: string;
  data: {
    uploadId: string;
    chunkIndex: number;
    uploaded: boolean;
    progress: number;
    uploadedChunks: number;
    totalChunks: number;
  };
}

export interface MergeUploadResponse {
  code: number;
  message: string;
  data: {
    url: string;
    publicId: string;
    size: number;
    format: string;
    duration?: number;
  };
}

export interface UploadStatusResponse {
  code: number;
  message: string;
  data: {
    uploadId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    totalChunks: number;
    uploadedChunks: number;
    progress: number;
    uploadedChunksList: number[];
    missingChunks: number[];
    createdAt: string;
    lastActivity: string;
  };
}

class ChunkedUploadService {
  private readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_CONCURRENT_CHUNKS = 3;

  /**
   * Initialize chunked upload session
   */
  async initializeUpload(params: {
    fileName: string;
    fileSize: number;
    fileType: "VIDEO" | "AUDIO" | "IMAGE";
    mimeType: string;
    folder?: string;
  }): Promise<InitializeUploadResponse> {
    return await apiClient.post<InitializeUploadResponse>(
      "/v1/api/upload/chunked/initialize",
      params
    );
  }

  /**
   * Upload a single chunk
   */
  async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    totalChunks: number,
    chunkBlob: Blob
  ): Promise<ChunkUploadResponse> {
    const formData = new FormData();
    formData.append("chunk", chunkBlob);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());

    // Use axios directly for FormData to avoid Content-Type header override
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const response = await axios.post<ChunkUploadResponse>(
      `${API_BASE_URL}/v1/api/upload/chunked/${uploadId}/chunk`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
        timeout: 120000, // 120s for large chunks
      }
    );

    return response.data;
  }

  /**
   * Merge all chunks and upload to Cloudinary
   */
  async mergeAndUpload(
    uploadId: string,
    publicId?: string
  ): Promise<MergeUploadResponse> {
    return await apiClient.post<MergeUploadResponse>(
      `/v1/api/upload/chunked/${uploadId}/merge`,
      { publicId: publicId || null },
      { timeout: 180000 } // 180s to allow Cloudinary upload of merged file
    );
  }

  /**
   * Get upload status
   */
  async getUploadStatus(uploadId: string): Promise<UploadStatusResponse> {
    return await apiClient.get<UploadStatusResponse>(
      `/v1/api/upload/chunked/${uploadId}/status`
    );
  }

  /**
   * Cancel upload
   */
  async cancelUpload(uploadId: string): Promise<{ code: number; message: string }> {
    return await apiClient.delete(`/v1/api/upload/chunked/${uploadId}`);
  }

  /**
   * Split file into chunks
   * @private
   */
  private splitFileIntoChunks(file: File, chunkSize: number): Blob[] {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  }

  /**
   * Upload file with chunked upload
   * @param file - File to upload
   * @param fileType - File type
   * @param options - Upload options
   * @param onProgress - Progress callback
   * @returns Upload result with URL
   */
  async uploadFile(
    file: File,
    fileType: "VIDEO" | "AUDIO" | "IMAGE",
    options: {
      folder?: string;
      publicId?: string;
      onProgress?: (progress: number, uploaded: number, total: number) => void;
      onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
    } = {}
  ): Promise<{ url: string; publicId: string; duration?: number }> {
    const { folder, publicId, onProgress, onChunkComplete } = options;

    // Step 1: Initialize upload
    const initResponse = await this.initializeUpload({
      fileName: file.name,
      fileSize: file.size,
      fileType,
      mimeType: file.type,
      folder,
    });

    if (initResponse.code !== 200) {
      throw new Error(initResponse.message || "Failed to initialize upload");
    }

    const { uploadId, totalChunks } = initResponse.data;
    const chunkSize = initResponse.data.chunkSize || this.CHUNK_SIZE;

    // Step 2: Split file into chunks
    const chunks = this.splitFileIntoChunks(file, chunkSize);

    // Ensure chunk count aligns with server expectation
    if (chunks.length !== totalChunks) {
      // Recompute using server chunkSize to avoid mismatch
      console.warn(
        `[ChunkedUploadService] Chunk count mismatch. Client: ${chunks.length}, Server: ${totalChunks}. Using server totalChunks.`
      );
    }

    // Step 3: Upload chunks concurrently (with limit)
    const uploadedChunks = new Set<number>();
    const failedChunks: number[] = [];

    // Upload chunks in batches
    for (let i = 0; i < chunks.length; i += this.MAX_CONCURRENT_CHUNKS) {
      const batch = chunks.slice(i, i + this.MAX_CONCURRENT_CHUNKS);
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex;
        let retries = 3;

        while (retries > 0) {
          try {
            const response = await this.uploadChunk(
              uploadId,
              chunkIndex,
              totalChunks,
              chunk
            );

            if (response.code === 200) {
              uploadedChunks.add(chunkIndex);
              onChunkComplete?.(chunkIndex, totalChunks);
              
              const progress = Math.round(
                (uploadedChunks.size / totalChunks) * 100
              );
              onProgress?.(progress, uploadedChunks.size, totalChunks);
              
              return;
            } else {
              throw new Error(response.message || "Chunk upload failed");
            }
          } catch (error) {
            retries--;
            if (retries === 0) {
              console.error(
                `Failed to upload chunk ${chunkIndex} after 3 retries:`,
                error
              );
              failedChunks.push(chunkIndex);
            } else {
              // Wait before retry (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, 3 - retries) * 1000)
              );
            }
          }
        }
      });

      await Promise.all(batchPromises);
    }

    // Check if all chunks uploaded successfully
    if (failedChunks.length > 0) {
      throw new Error(
        `Failed to upload chunks: ${failedChunks.join(", ")}`
      );
    }

    // Step 4: Merge and upload to Cloudinary
    const mergeResponse = await this.mergeAndUpload(uploadId, publicId);

    if (mergeResponse.code !== 200) {
      throw new Error(mergeResponse.message || "Failed to merge and upload");
    }

    onProgress?.(100, totalChunks, totalChunks);

    return {
      url: mergeResponse.data.url,
      publicId: mergeResponse.data.publicId,
      duration: mergeResponse.data.duration,
    };
  }
}

export const chunkedUploadService = new ChunkedUploadService();

