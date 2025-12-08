"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link2, Youtube, FileVideo, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export type MediaType = "video" | "audio";
export type SourceType = "upload" | "youtube" | "link";

interface MediaUploaderProps {
    type: MediaType;
    sourceType: SourceType;
    value: string;
    onChange: (url: string) => void;
    onSourceTypeChange: (sourceType: SourceType) => void;
    label?: string;
    required?: boolean;
    className?: string;
    accept?: string;
}

export function MediaUploader({
    type,
    sourceType,
    value,
    onChange,
    onSourceTypeChange,
    label,
    required = false,
    className,
}: MediaUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

    // Update preview when value changes
    useEffect(() => {
        if (value) {
            setPreviewUrl(value);
        }
    }, [value]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
        const validAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];

        if (type === "video" && !validVideoTypes.includes(file.type)) {
            toast.error("Vui lòng chọn file video hợp lệ (mp4, webm, ogg)");
            return;
        }

        if (type === "audio" && !validAudioTypes.includes(file.type)) {
            toast.error("Vui lòng chọn file audio hợp lệ (mp3, wav, ogg)");
            return;
        }

        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            toast.error("File quá lớn. Kích thước tối đa là 100MB");
            return;
        }

        try {
            setUploading(true);
            // TODO: Implement actual file upload to server
            // For now, create a local URL for preview
            const localUrl = URL.createObjectURL(file);
            setPreviewUrl(localUrl);
            
            // In production, upload file to server and get URL
            // const formData = new FormData();
            // formData.append('file', file);
            // const response = await uploadService.uploadFile(formData);
            // onChange(response.data.url);
            
            toast.success("File đã được chọn. Vui lòng upload lên server.");
            // Temporary: use local URL
            onChange(localUrl);
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Không thể upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleUrlChange = (url: string) => {
        onChange(url);
        setPreviewUrl(url);
    };

    const handleRemove = () => {
        onChange("");
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getAcceptTypes = () => {
        if (type === "video") {
            return "video/mp4,video/webm,video/ogg";
        }
        return "audio/mpeg,audio/wav,audio/ogg,audio/mp3";
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
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer",
                                sourceType === option.value
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
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
                                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
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
                    {value && (
                        <div className="text-sm text-gray-600">
                            File đã chọn: {value.split("/").pop() || "File"}
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
                        className="w-full"
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
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

