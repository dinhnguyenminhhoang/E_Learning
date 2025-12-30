"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Loader2, ChevronLeft, Volume2, Bot, User } from "lucide-react";
import { speakingPracticeService } from "@/services/speakingPractice.service";
import { aiAssistantService } from "@/services/aiAssistant.service";
import { ttsService } from "@/services/tts.service";

interface Message {
    role: "user" | "assistant";
    content: string;
    originalText?: string;
    correctedText?: string;
    hasErrors?: boolean;
}

interface AIConversationProps {
    onExit?: () => void;
}

export default function AIConversation({ onExit }: AIConversationProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Xin chào! Tôi là AI trợ lý của bạn. Hãy nói bất cứ điều gì bằng tiếng Anh và tôi sẽ trò chuyện với bạn, đồng thời giúp bạn sửa lỗi ngữ pháp. Hãy bắt đầu nào!"
        }
    ]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>(undefined);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startRecording = useCallback(async () => {
        try {
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

                    if (!practiceResult.transcribedText) {
                        setMessages(prev => [...prev, {
                            role: "assistant",
                            content: "Xin lỗi, tôi không nghe rõ. Bạn có thể nói lại không?"
                        }]);
                        setIsProcessing(false);
                        return;
                    }

                    const userMessage: Message = {
                        role: "user",
                        content: practiceResult.correctedText || practiceResult.transcribedText,
                        originalText: practiceResult.transcribedText,
                        correctedText: practiceResult.correctedText,
                        hasErrors: practiceResult.hasErrors
                    };
                    setMessages(prev => [...prev, userMessage]);

                    const textToSend = practiceResult.correctedText || practiceResult.transcribedText;
                    const aiResponse = await aiAssistantService.chat(
                        `Please respond to this in English (keep it conversational and brief): "${textToSend}"`,
                        conversationId
                    );

                    if (!conversationId && aiResponse.conversationId) {
                        setConversationId(aiResponse.conversationId);
                    }

                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: aiResponse.message.content
                    }]);

                } catch (err: any) {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: `Có lỗi xảy ra: ${err.message}. Vui lòng thử lại.`
                    }]);
                } finally {
                    setIsProcessing(false);
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error("Recording error:", err);
        }
    }, [conversationId]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const playMessage = async (text: string) => {
        try {
            await ttsService.speak(text);
        } catch (err) {
            console.error("TTS error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={onExit}
                        className="text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Quay lại
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-800">
                        Trò chuyện với AI
                    </h1>
                    <div className="w-20" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}

                            <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                                <Card className={`p-4 ${msg.role === "user"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                    : "bg-white"
                                    }`}>
                                    <p className={msg.role === "user" ? "text-white" : "text-gray-800"}>
                                        {msg.content}
                                    </p>

                                    {msg.role === "user" && msg.hasErrors && msg.originalText !== msg.correctedText && (
                                        <div className="mt-2 pt-2 border-t border-white/20 text-sm">
                                            <p className="text-white/70 line-through">{msg.originalText}</p>
                                            <p className="text-green-200">✓ {msg.correctedText}</p>
                                        </div>
                                    )}
                                </Card>

                                {msg.role === "assistant" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => playMessage(msg.content)}
                                        className="text-gray-400 hover:text-blue-500 mt-1"
                                    >
                                        <Volume2 className="w-4 h-4 mr-1" />
                                        Nghe
                                    </Button>
                                )}
                            </div>

                            {msg.role === "user" && (
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <Card className="p-4 bg-white">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xử lý...
                                </div>
                            </Card>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="bg-white border-t border-gray-200 px-4 py-6">
                <div className="mx-auto flex flex-col items-center gap-3">
                    <Button
                        size="lg"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        className={`w-16 h-16 rounded-full transition-all duration-300 ${isRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                            : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            }`}
                    >
                        {isRecording ? (
                            <MicOff className="w-6 h-6 text-white" />
                        ) : (
                            <Mic className="w-6 h-6 text-white" />
                        )}
                    </Button>
                    <p className="text-sm text-gray-500">
                        {isRecording ? "Nhấn để dừng" : isProcessing ? "Đang xử lý..." : "Nhấn để nói"}
                    </p>
                </div>
            </div>
        </div>
    );
}
