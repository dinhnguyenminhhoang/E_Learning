"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Loader2, CheckCircle, XCircle, RotateCcw, Volume2, Star, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { speakingPracticeService, SpeakingPracticeResult } from "@/services/speakingPractice.service";
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
                    const practiceResult = await speakingPracticeService.analyzeSpeaking(audioBlob, sentence);
                    setResult(practiceResult);
                    onComplete?.(practiceResult);
                } catch (err: unknown) {
                    const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi phân tích giọng nói";
                    setError(errorMessage);
                } finally {
                    setIsProcessing(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Không thể truy cập microphone";
            setError(errorMessage);
        }
    }, [onComplete, sentence]);

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

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        if (score >= 40) return "text-orange-600";
        return "text-red-600";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "from-green-50 to-emerald-50";
        if (score >= 60) return "from-yellow-50 to-amber-50";
        if (score >= 40) return "from-orange-50 to-amber-50";
        return "from-red-50 to-rose-50";
    };

    const getLevelBadgeColor = (level: string) => {
        if (level.startsWith("C")) return "bg-purple-100 text-purple-700";
        if (level.startsWith("B")) return "bg-blue-100 text-blue-700";
        return "bg-gray-100 text-gray-700";
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
                    {/* Score Header */}
                    <div className={`bg-gradient-to-r ${getScoreBgColor(result.grading.score)} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`text-4xl font-bold ${getScoreColor(result.grading.score)}`}>
                                    {result.grading.score}
                                </div>
                                <div className="text-sm text-gray-500">/ 100 điểm</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeColor(result.grading.level)}`}>
                                {result.grading.level}
                            </span>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            {result.grading.pronunciationScore !== undefined && (
                                <div className="bg-white/60 rounded-lg p-2">
                                    <div className="text-xs text-gray-500">Phát âm</div>
                                    <div className={`text-lg font-semibold ${getScoreColor(result.grading.pronunciationScore)}`}>
                                        {result.grading.pronunciationScore}%
                                    </div>
                                </div>
                            )}
                            <div className="bg-white/60 rounded-lg p-2">
                                <div className="text-xs text-gray-500">Độ chính xác</div>
                                <div className={`text-lg font-semibold ${getScoreColor(result.accuracy)}`}>
                                    {result.accuracy}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transcription */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">Bạn đã nói:</div>
                        <p className="text-lg text-gray-800">
                            {result.transcribedText ? (
                                <span>&ldquo;{result.transcribedText}&rdquo;</span>
                            ) : (
                                <span className="text-gray-400 italic">Không nhận được giọng nói</span>
                            )}
                        </p>
                        {result.targetText && result.transcribedText && result.transcribedText.toLowerCase() !== result.targetText.toLowerCase() && (
                            <p className="text-sm text-gray-500 mt-2">
                                Câu mục tiêu: <span className="text-green-600 font-medium">&ldquo;{result.targetText}&rdquo;</span>
                            </p>
                        )}
                    </div>

                    {/* Overall Comment */}
                    {result.grading.overallComment && (
                        <div className="bg-blue-50 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <p className="text-sm text-gray-700">{result.grading.overallComment}</p>
                            </div>
                        </div>
                    )}

                    {/* Strengths */}
                    {result.grading.strengths.length > 0 && (
                        <div className="bg-green-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Điểm mạnh</span>
                            </div>
                            <ul className="space-y-1">
                                {result.grading.strengths.map((strength, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Weaknesses */}
                    {result.grading.weaknesses.length > 0 && (
                        <div className="bg-orange-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                <span className="text-sm font-medium text-orange-700">Cần cải thiện</span>
                            </div>
                            <ul className="space-y-1">
                                {result.grading.weaknesses.map((weakness, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                        {weakness}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Suggestions */}
                    {result.grading.suggestions.length > 0 && (
                        <div className="bg-purple-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-purple-700">Gợi ý cải thiện</span>
                            </div>
                            <ul className="space-y-1">
                                {result.grading.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-purple-500">•</span>
                                        {suggestion}
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
