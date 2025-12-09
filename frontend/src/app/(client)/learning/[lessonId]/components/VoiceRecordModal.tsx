"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
    targetWord: string;
}

export function VoiceRecordModal({ isOpen, onClose, onSubmit, targetWord }: VoiceRecordModalProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const startRecording = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsRecording(true);
                setIsListening(true);
            };

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
                setIsListening(false);
            };

            recognitionRef.current.start();
        } else {
            alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        setIsListening(false);
    };

    const handleSubmit = () => {
        if (transcript.trim()) {
            onSubmit(transcript.trim());
            handleClose();
        }
    };

    const handleClose = () => {
        stopRecording();
        setTranscript("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🎤 Voice Spell Check
                    </h2>
                    <p className="text-gray-600">
                        Say the word: <span className="font-bold text-purple-600">"{targetWord}"</span>
                    </p>
                </div>

                {/* Recording Visualization */}
                <div className="mb-6">
                    <div className={cn(
                        "w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all",
                        isRecording
                            ? "bg-gradient-to-br from-red-400 to-pink-500 animate-pulse"
                            : "bg-gradient-to-br from-purple-400 to-pink-400"
                    )}>
                        {isRecording ? (
                            <MicOff className="w-16 h-16 text-white" />
                        ) : (
                            <Mic className="w-16 h-16 text-white" />
                        )}
                    </div>

                    {isListening && (
                        <div className="text-center mt-4">
                            <div className="inline-flex gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Listening...</p>
                        </div>
                    )}
                </div>

                {/* Transcript Display */}
                {transcript && (
                    <div className="bg-purple-50 rounded-xl p-4 mb-6 border-2 border-purple-200">
                        <p className="text-sm text-purple-700 mb-1 font-semibold">You said:</p>
                        <p className="text-lg font-medium text-purple-900">"{transcript}"</p>
                    </div>
                )}

                {/* Control Buttons */}
                <div className="flex gap-3">
                    {!isRecording ? (
                        <Button
                            onClick={startRecording}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
                        >
                            <Mic className="w-5 h-5 mr-2" />
                            Start Recording
                        </Button>
                    ) : (
                        <Button
                            onClick={stopRecording}
                            variant="outline"
                            className="flex-1 border-red-300 bg-red-50 hover:bg-red-100 h-12"
                        >
                            <MicOff className="w-5 h-5 mr-2" />
                            Stop
                        </Button>
                    )}

                    {transcript && !isRecording && (
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 bg-green-600 hover:bg-green-700 h-12"
                        >
                            <Send className="w-5 h-5 mr-2" />
                            Submit
                        </Button>
                    )}
                </div>

                {/* Helper Text */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    💡 Tip: Speak clearly and at a normal pace
                </p>
            </div>

            <style jsx global>{`
                @keyframes scale-in {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
