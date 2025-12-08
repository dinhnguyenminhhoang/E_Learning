"use client";

import { useRef, useEffect, useState } from "react";
import { PlayCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    videoUrl: string;
    title?: string;
    type?: "video" | "media" | "grammar";
    className?: string;
    onLoad?: () => void;
    onDurationChange?: (durationSeconds: number) => void;
}

/**
 * VideoPlayer component - Hiển thị video hoặc audio player
 * Hỗ trợ YouTube, Vimeo và các video URL khác
 */
export function VideoPlayer({
    videoUrl,
    title,
    type = "video",
    className,
    onLoad,
    onDurationChange,
}: VideoPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Detect source type
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const isYoutube = youtubeRegex.test(videoUrl);
    const isVimeo = vimeoRegex.test(videoUrl);
        const isAudio =
        type === "media" ||
        videoUrl.includes("audio") ||
        videoUrl.includes(".mp3") ||
        videoUrl.includes(".wav") ||
        videoUrl.includes(".flac");
    const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(videoUrl) || (!isYoutube && !isVimeo);

    // Convert YouTube/Vimeo to embed if needed
    const getEmbedUrl = (url: string): string => {
        if (!url) return "";
        if (isYoutube) {
            const match = url.match(youtubeRegex);
            return match ? `https://www.youtube.com/embed/${match[1]}` : url;
        }
        if (isVimeo) {
            const match = url.match(vimeoRegex);
            return match ? `https://player.vimeo.com/video/${match[1]}` : url;
        }
        return url;
    };

    const embedUrl = getEmbedUrl(videoUrl);

    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
    }, [videoUrl]);

    const notifyDuration = (duration?: number) => {
        const safeDuration = duration && duration > 0 ? Math.ceil(duration) : 10; // default 10s if missing
        if (onDurationChange) onDurationChange(safeDuration);
    };

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) {
            onLoad();
        }
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (!videoUrl) {
        return null;
    }

    if (isAudio) {
        return (
            <div className={cn("w-full", className)}>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 md:p-8 border-2 border-purple-200 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                            <Volume2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Audio</h3>
                            {title && (
                                <p className="text-sm text-gray-600">{title}</p>
                            )}
                        </div>
                    </div>
                    <audio
                        controls
                        className="w-full"
                        onLoadedData={(e) => {
                            notifyDuration(e.currentTarget.duration);
                            handleLoad();
                        }}
                        onLoadedMetadata={(e) => notifyDuration(e.currentTarget.duration)}
                        onError={handleError}
                    >
                        <source src={videoUrl} type="audio/mpeg" />
                        <source src={videoUrl} type="audio/wav" />
                        <source src={videoUrl} type="audio/ogg" />
                        <source src={videoUrl} type="audio/flac" />
                        Trình duyệt của bạn không hỗ trợ audio element.
                    </audio>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-white text-sm">Đang tải video...</p>
                        </div>
                    </div>
                )}

                {hasError ? (
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                        <div className="text-center text-white p-8">
                            <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-semibold mb-2">Không thể tải video</p>
                            <p className="text-sm text-gray-400">
                                Vui lòng kiểm tra lại đường dẫn video
                            </p>
                            <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                            >
                                Mở trong tab mới
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="aspect-video bg-black">
                        {isDirectVideo && !isYoutube && !isVimeo ? (
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-full"
                                onLoadedData={(e) => {
                                    notifyDuration(e.currentTarget.duration);
                                    handleLoad();
                                }}
                                onLoadedMetadata={(e) => notifyDuration(e.currentTarget.duration)}
                                onError={handleError}
                            />
                        ) : (
                            <iframe
                                ref={iframeRef}
                                src={embedUrl}
                                className="w-full h-full"
                                allowFullScreen
                                title={title || "Video player"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

