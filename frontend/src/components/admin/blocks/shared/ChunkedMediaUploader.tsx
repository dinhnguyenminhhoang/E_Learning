"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, Link2, Youtube, Volume2, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

export type MediaType = "video" | "audio";
export type SourceType = "upload" | "youtube" | "link";

interface ChunkedMediaUploaderProps {
    type: MediaType;
    sourceType: SourceType;
    value: string;
    onChange: (url: string) => void;
    onSourceTypeChange: (sourceType: SourceType) => void;
    onDurationChange?: (duration?: number) => void;
    label?: string;
    required?: boolean;
    className?: string;
}

export function ChunkedMediaUploader({
    type,
    sourceType,
    value,
        onChange,
    onSourceTypeChange,
        onDurationChange,
    label,
    required = false,
    className,
}: ChunkedMediaUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

    // Map MediaType to fileType for upload service
    const fileType: "VIDEO" | "AUDIO" | "IMAGE" = type === "video" ? "VIDEO" : "AUDIO";

    const {
        file,
        uploading,
        progress,
        uploadedUrl,
        error,
        setFile,
        cancelUpload,
        reset,
    } = useChunkedUpload({
        fileType,
        folder: type === "video" ? "videos" : "audio",
        onSuccess: (url, _publicId, duration) => {
            onChange(url);
            setPreviewUrl(url);
            if (duration !== undefined) {
                onDurationChange?.(duration);
            }
        },
        onError: (err) => {
            console.error("Upload error:", err);
        },
        autoStart: true,
    });

    // Update preview when value changes externally
    useEffect(() => {
        if (value && !uploadedUrl) {
            setPreviewUrl(value);
        }
    }, [value, uploadedUrl]);

    // Update preview when upload completes
    useEffect(() => {
        if (uploadedUrl) {
            setPreviewUrl(uploadedUrl);
        }
    }, [uploadedUrl]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
        const validAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/flac"];

        if (type === "video" && !validVideoTypes.includes(selectedFile.type)) {
            toast.error("Vui lòng chọn file video hợp lệ (mp4, webm, ogg)");
            return;
        }

        if (type === "audio" && !validAudioTypes.includes(selectedFile.type)) {
            toast.error("Vui lòng chọn file audio hợp lệ (mp3, wav, ogg)");
            return;
        }

        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (selectedFile.size > maxSize) {
            toast.error("File quá lớn. Kích thước tối đa là 100MB");
            return;
        }

        // Create preview URL
        const localUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(localUrl);

        // Start chunked upload
        setFile(selectedFile);
    };

    const handleUrlChange = (url: string) => {
        onChange(url);
        setPreviewUrl(url);
    };

    const handleRemove = () => {
        if (uploading) {
            cancelUpload();
        }
        reset();
        onChange("");
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const formatSpeed = (bytesPerSecond: number): string => {
        if (bytesPerSecond === 0) return "0 B/s";
        const k = 1024;
        const sizes = ["B/s", "KB/s", "MB/s"];
        const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
        return (
            Math.round((bytesPerSecond / Math.pow(k, i)) * 100) / 100 +
            " " +
            sizes[i]
        );
    };

    const formatTime = (seconds: number): string => {
        if (seconds === 0 || !isFinite(seconds)) return "--";
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    };

    const getAcceptTypes = () => {
        if (type === "video") {
            return "video/mp4,video/webm,video/ogg";
        }
        return "audio/mpeg,audio/wav,audio/ogg,audio/mp3,audio/flac";
    };

    const getSourceTypeOptions = (): { value: SourceType; label: string; icon: any }[] => {
        if (type === "video") {
            return [
                { value: "upload", label: "Upload từ máy", icon: Upload },
                { value: "youtube", label: "Link YouTube", icon: Youtube },
            ];
        } else {
            return [
                { value: "upload", label: "Upload từ máy", icon: Upload },
                { value: "link", label: "Dán link", icon: Link2 },
            ];
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Source Type Selector */}
            <div className="flex gap-2">
                {getSourceTypeOptions().map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onSourceTypeChange(option.value)}
                            disabled={uploading}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer",
                                sourceType === option.value
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                                uploading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{option.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Upload Input */}
            {sourceType === "upload" && (
                <div className="space-y-2">
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={getAcceptTypes()}
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full cursor-pointer"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang upload...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Chọn file {type === "video" ? "video" : "audio"}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Upload Progress */}
                    {uploading && file && (
                        <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">
                                    {file.name}
                                </span>
                                <span className="text-gray-600">
                                    {formatFileSize(file.size)}
                                </span>
                            </div>

                            <Progress value={progress.progress} className="h-2" />

                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>
                                    {progress.uploaded} / {progress.total} chunks
                                </span>
                                <div className="flex items-center gap-4">
                                    {progress.speed > 0 && (
                                        <span>{formatSpeed(progress.speed)}</span>
                                    )}
                                    {progress.timeRemaining > 0 && (
                                        <span>Còn lại: {formatTime(progress.timeRemaining)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-blue-700">
                                    {progress.progress}%
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelUpload}
                                    className="text-red-600 hover:text-red-700 cursor-pointer"
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Upload Success */}
                    {uploadedUrl && !uploading && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                                Upload thành công!
                            </span>
                        </div>
                    )}

                    {/* Upload Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <X className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-red-700">
                                {error.message || "Upload thất bại"}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* URL Input (YouTube or Link) */}
            {(sourceType === "youtube" || sourceType === "link") && (
                <div className="space-y-2">
                    <Input
                        type="url"
                        value={value}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder={
                            sourceType === "youtube"
                                ? "https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                                : "https://..."
                        }
                        className="w-full cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">
                        {sourceType === "youtube"
                            ? "Dán link YouTube (watch hoặc youtu.be)"
                            : "Dán link trực tiếp đến file audio"}
                    </p>
                </div>
            )}

            {/* Preview */}
            {previewUrl && (
                <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-900">
                    {type === "video" ? (
                        <div className="aspect-video">
                            {sourceType === "youtube" ? (
                                <iframe
                                    src={previewUrl.replace(
                                        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
                                        "https://www.youtube.com/embed/$1"
                                    )}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title="Video preview"
                                />
                            ) : (
                                <video
                                    src={previewUrl}
                                    controls
                                    className="w-full h-full"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="p-8 flex items-center justify-center">
                            <div className="text-center">
                                <Volume2 className="w-12 h-12 text-white mx-auto mb-3" />
                                <audio src={previewUrl} controls className="w-full max-w-md" />
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={uploading}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

