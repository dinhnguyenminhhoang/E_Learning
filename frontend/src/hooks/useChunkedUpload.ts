import { useState, useCallback, useRef } from "react";
import { chunkedUploadService } from "@/services/chunkedUpload.service";
import { toast } from "react-hot-toast";

export interface UseChunkedUploadOptions {
  fileType: "VIDEO" | "AUDIO" | "IMAGE";
  folder?: string;
  publicId?: string;
  onSuccess?: (url: string, publicId: string, duration?: number) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean; // Auto start upload when file is set
}

export interface UploadProgress {
  progress: number; // 0-100
  uploaded: number;
  total: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

export function useChunkedUpload(options: UseChunkedUploadOptions) {
  const {
    fileType,
    folder,
    publicId,
    onSuccess,
    onError,
    autoStart = true,
  } = options;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    uploaded: 0,
    total: 0,
    speed: 0,
    timeRemaining: 0,
  });
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const uploadStartTimeRef = useRef<number | null>(null);
  const lastProgressRef = useRef<{ bytes: number; time: number } | null>(null);
  const cancelRef = useRef<boolean>(false);

  /**
   * Calculate upload speed and time remaining
   */
  const calculateSpeed = useCallback(
    (uploadedBytes: number, totalBytes: number) => {
      const now = Date.now();

      if (!uploadStartTimeRef.current) {
        uploadStartTimeRef.current = now;
        lastProgressRef.current = { bytes: uploadedBytes, time: now };
        return { speed: 0, timeRemaining: 0 };
      }

      const elapsed = (now - uploadStartTimeRef.current) / 1000; // seconds
      const speed = elapsed > 0 ? uploadedBytes / elapsed : 0; // bytes per second

      const remainingBytes = totalBytes - uploadedBytes;
      const timeRemaining = speed > 0 ? remainingBytes / speed : 0;

      return { speed, timeRemaining };
    },
    []
  );

  /**
   * Start upload
   */
  const startUpload = useCallback(
    async (fileToUpload?: File) => {
      const fileToUse = fileToUpload || file;
      if (!fileToUse) {
        toast.error("Vui lòng chọn file");
        return;
      }

      // Reset state
      setUploading(true);
      setError(null);
      setUploadedUrl(null);
      setProgress({
        progress: 0,
        uploaded: 0,
        total: fileToUse.size,
        speed: 0,
        timeRemaining: 0,
      });
      uploadStartTimeRef.current = null;
      lastProgressRef.current = null;
      cancelRef.current = false;

      try {
        const result = await chunkedUploadService.uploadFile(
          fileToUse,
          fileType,
          {
            folder,
            publicId,
            onProgress: (progressPercent, uploadedChunks, totalChunks) => {
              if (cancelRef.current) return;

              // Estimate uploaded bytes (approximate)
              const uploadedBytes = Math.round(
                (uploadedChunks / totalChunks) * fileToUse.size
              );

              const { speed, timeRemaining } = calculateSpeed(
                uploadedBytes,
                fileToUse.size
              );

              setProgress({
                progress: progressPercent,
                uploaded: uploadedChunks,
                total: totalChunks,
                speed,
                timeRemaining,
              });
            },
            onChunkComplete: (chunkIndex, totalChunks) => {
              // Optional: Log chunk completion
              console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded`);
            },
          }
        );

        if (cancelRef.current) {
          return;
        }

        setUploadedUrl(result.url);
        setProgress({
          progress: 100,
          uploaded: progress.total,
          total: progress.total,
          speed: 0,
          timeRemaining: 0,
        });

        onSuccess?.(result.url, result.publicId, result.duration);
        toast.success("Upload thành công!");
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(err.message || "Upload failed");
        setError(error);
        onError?.(error);
        toast.error(error.message || "Upload thất bại");
      } finally {
        setUploading(false);
      }
    },
    [file, fileType, folder, publicId, onSuccess, onError, calculateSpeed, progress.total]
  );

  /**
   * Cancel upload
   */
  const cancelUpload = useCallback(async () => {
    if (!uploading) return;

    cancelRef.current = true;
    setUploading(false);
    toast.info("Đang hủy upload...");
  }, [uploading]);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setFile(null);
    setUploading(false);
    setProgress({
      progress: 0,
      uploaded: 0,
      total: 0,
      speed: 0,
      timeRemaining: 0,
    });
    setUploadedUrl(null);
    setError(null);
    uploadStartTimeRef.current = null;
    lastProgressRef.current = null;
    cancelRef.current = false;
  }, []);

  /**
   * Set file and auto-start if enabled
   */
  const setFileAndStart = useCallback(
    (newFile: File) => {
      setFile(newFile);
      if (autoStart) {
        setTimeout(() => startUpload(newFile), 100);
      }
    },
    [autoStart, startUpload]
  );

  return {
    file,
    setFile: setFileAndStart,
    uploading,
    progress,
    uploadedUrl,
    error,
    startUpload,
    cancelUpload,
    reset,
  };
}

