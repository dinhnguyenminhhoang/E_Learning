"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Loader2, CheckCircle, XCircle, RotateCcw, Volume2 } from "lucide-react";
import { speakingPracticeService, SpeakingPracticeResult, SpeakingError } from "@/services/speakingPractice.service";
import { ttsService } from "@/services/tts.service";

interface SpeakingPracticeCardProps {
    sentence: string;
    onComplete?: (result: SpeakingPracticeResult) => void;
}

export default function SpeakingPracticeCard({ sentence, onComplete }: SpeakingPracticeCardProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<SpeakingPracticeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setResult(null);

            const stream = await speakingPracticeService.requestMicrophonePermission();
            streamRef.current = stream;

            const recorder = speakingPracticeService.createRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                setIsProcessing(true);

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                    const practiceResult = await speakingPracticeService.analyzeSpeaking(audioBlob);
                    setResult(practiceResult);
                    onComplete?.(practiceResult);
                } catch (err: any) {
                    setError(err.message || "Có lỗi xảy ra khi phân tích giọng nói");
                } finally {
                    setIsProcessing(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (err: any) {
            setError(err.message || "Không thể truy cập microphone");
        }
    }, [onComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const resetPractice = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    const playSentence = useCallback(async () => {
        try {
            await ttsService.speak(sentence);
        } catch (err) {
            console.error("TTS error:", err);
        }
    }, [sentence]);

    const renderHighlightedText = (text: string, errors: SpeakingError[], isOriginal: boolean) => {
        if (!errors.length) return text;

        const words = text.split(" ");
        const errorPositions = new Set(errors.map(e => e.position));

        return (
            <span>
                {words.map((word, idx) => {
                    const isError = errorPositions.has(idx);
                    return (
                        <span
                            key={idx}
                            className={`${isError ? (isOriginal ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700") : ""} px-0.5 rounded`}
                        >
                            {word}{idx < words.length - 1 ? " " : ""}
                        </span>
                    );
                })}
            </span>
        );
    };

    return (
        <Card className="w-full max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-lg border border-gray-100">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Câu cần đọc:</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={playSentence}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Nghe mẫu
                    </Button>
                </div>
                <p className="text-xl font-medium text-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                    {sentence}
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-6">
                {!result && !isProcessing && (
                    <>
                        <Button
                            size="lg"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105 ${isRecording
                                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                }`}
                        >
                            {isRecording ? (
                                <MicOff className="w-8 h-8 text-white" />
                            ) : (
                                <Mic className="w-8 h-8 text-white" />
                            )}
                        </Button>
                        <p className="text-sm text-gray-500">
                            {isRecording ? "Nhấn để dừng ghi âm" : "Nhấn để bắt đầu nói"}
                        </p>
                    </>
                )}

                {isProcessing && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-500">Đang phân tích giọng nói...</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-4 mt-4">
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">Bạn đã nói:</span>
                            {result.hasErrors && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                    Có lỗi
                                </span>
                            )}
                        </div>
                        <p className="text-lg text-gray-800">
                            {result.transcribedText ? (
                                renderHighlightedText(result.transcribedText, result.errors, true)
                            ) : (
                                <span className="text-gray-400 italic">Không nhận được giọng nói</span>
                            )}
                        </p>
                    </div>

                    {result.hasErrors && result.correctedText && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">Câu đã sửa:</span>
                            </div>
                            <p className="text-lg text-gray-800">
                                {renderHighlightedText(result.correctedText, result.errors, false)}
                            </p>
                        </div>
                    )}

                    {!result.hasErrors && result.transcribedText && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <span className="text-lg font-medium text-green-600">Tuyệt vời! Không có lỗi nào.</span>
                            </div>
                        </div>
                    )}

                    {result.errors.length > 0 && (
                        <div className="bg-yellow-50 rounded-xl p-4">
                            <p className="text-sm font-medium text-yellow-700 mb-2">Chi tiết lỗi:</p>
                            <ul className="space-y-1">
                                {result.errors.map((err, idx) => (
                                    <li key={idx} className="text-sm text-gray-600">
                                        <span className="text-red-600 line-through">{err.original}</span>
                                        {" → "}
                                        <span className="text-green-600 font-medium">{err.corrected}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-center pt-2">
                        <Button
                            variant="outline"
                            onClick={resetPractice}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Thử lại
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
