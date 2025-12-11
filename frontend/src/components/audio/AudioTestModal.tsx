"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mic, MicOff, Volume2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioTestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AudioTestModal({ isOpen, onClose }: AudioTestModalProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isTestingPlayback, setIsTestingPlayback] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Request microphone permission
    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            setHasPermission(true);

            // Setup audio context for visualization
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            return stream;
        } catch (error) {
            console.error("Microphone permission denied:", error);
            setHasPermission(false);
            throw error;
        }
    };

    // Update audio level visualization
    const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);

        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    // Start recording
    const startRecording = async () => {
        try {
            let stream = streamRef.current;
            if (!stream) {
                stream = await requestPermission();
            }

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const audioUrl = URL.createObjectURL(audioBlob);
                setRecordedAudio(audioUrl);
            };

            recorder.start();
            setIsRecording(true);
            updateAudioLevel();
        } catch (error) {
            console.error("Error starting recording:", error);
            setHasPermission(false);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            setAudioLevel(0);
        }
    };

    // Test audio playback
    const testPlayback = () => {
        const utterance = new SpeechSynthesisUtterance("Audio playback is working correctly");
        utterance.lang = "en-US";
        utterance.onstart = () => setIsTestingPlayback(true);
        utterance.onend = () => setIsTestingPlayback(false);
        speechSynthesis.speak(utterance);
    };

    // Play recorded audio
    const playRecordedAudio = () => {
        if (recordedAudio) {
            const audio = new Audio(recordedAudio);
            audio.play();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (recordedAudio) {
                URL.revokeObjectURL(recordedAudio);
            }
        };
    }, [recordedAudio]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            stopRecording();
            setRecordedAudio(null);
            setAudioLevel(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 m-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Kiểm tra âm thanh
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Permission Status */}
                <div className="mb-6">
                    {hasPermission === null && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-blue-900">
                                Chưa kiểm tra quyền truy cập microphone
                            </p>
                        </div>
                    )}
                    {hasPermission === true && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-900">
                                Microphone đã được phép truy cập
                            </p>
                        </div>
                    )}
                    {hasPermission === false && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-900">
                                Không thể truy cập microphone. Vui lòng cấp quyền trong trình duyệt.
                            </p>
                        </div>
                    )}
                </div>

                {/* Microphone Test */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        1. Kiểm tra Microphone
                    </h3>
                    <div className="space-y-4">
                        {/* Audio Level Visualization */}
                        <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                                className={cn(
                                    "absolute bottom-0 left-0 right-0 transition-all duration-100",
                                    isRecording
                                        ? "bg-gradient-to-t from-green-500 to-emerald-400"
                                        : "bg-gradient-to-t from-gray-300 to-gray-400"
                                )}
                                style={{
                                    height: `${Math.min((audioLevel / 255) * 100, 100)}%`,
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                    {isRecording ? "Đang ghi âm..." : "Nhấn nút để bắt đầu"}
                                </span>
                            </div>
                        </div>

                        {/* Record Button */}
                        <Button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={cn(
                                "w-full transition-all duration-300",
                                isRecording
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-green-500 hover:bg-green-600"
                            )}
                        >
                            {isRecording ? (
                                <>
                                    <MicOff className="w-5 h-5 mr-2" />
                                    Dừng ghi âm
                                </>
                            ) : (
                                <>
                                    <Mic className="w-5 h-5 mr-2" />
                                    Bắt đầu ghi âm
                                </>
                            )}
                        </Button>

                        {/* Play Recording Button */}
                        {recordedAudio && (
                            <Button
                                onClick={playRecordedAudio}
                                variant="outline"
                                className="w-full"
                            >
                                <Volume2 className="w-5 h-5 mr-2" />
                                Nghe lại bản ghi
                            </Button>
                        )}
                    </div>
                </div>

                {/* Speaker Test */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        2. Kiểm tra Loa
                    </h3>
                    <Button
                        onClick={testPlayback}
                        disabled={isTestingPlayback}
                        variant="outline"
                        className="w-full"
                    >
                        {isTestingPlayback ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Đang phát...
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-5 h-5 mr-2" />
                                Test âm thanh loa
                            </>
                        )}
                    </Button>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        Hướng dẫn:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Cho phép trình duyệt truy cập microphone</li>
                        <li>Nói vào microphone và xem thanh âm lượng</li>
                        <li>Nghe lại bản ghi để kiểm tra chất lượng</li>
                        <li>Test loa để đảm bảo âm thanh hoạt động</li>
                    </ul>
                </div>

                {/* Close Button */}
                <Button
                    onClick={onClose}
                    variant="default"
                    className="w-full mt-6"
                >
                    Đóng
                </Button>
            </div>
        </div>
    );
}
