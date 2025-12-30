"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SpeakingPracticeSwiper from "@/components/speaking/SpeakingPracticeSwiper";
import AIConversation from "@/components/speaking/AIConversation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, BookOpen, Zap, ListChecks, ChevronLeft, Bot, Type, MessageSquareText, Loader2 } from "lucide-react";
import speakingTemplateService, { SpeakingTemplate, SpeakingTemplateStats } from "@/services/speakingTemplate.service";
import { toast } from "react-hot-toast";

type PracticeMode = "select" | "ai-conversation" | "template-config" | "template-practice";
type ContentType = "all" | "word" | "sentence";
type Level = "easy" | "medium" | "hard";

export default function SpeakingPracticePage() {
    const router = useRouter();
    const [mode, setMode] = useState<PracticeMode>("select");
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [contentType, setContentType] = useState<ContentType>("all");
    const [templates, setTemplates] = useState<SpeakingTemplate[]>([]);
    const [stats, setStats] = useState<SpeakingTemplateStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoadingStats(true);
            const data = await speakingTemplateService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const getFilteredCount = () => {
        if (!stats) return 0;

        let count = 0;

        if (selectedLevel) {
            if (contentType === "all") {
                count = stats.byLevel[selectedLevel];
            } else {
                const levelCount = stats.byLevel[selectedLevel];
                const typeRatio = stats.byType[contentType] / stats.total;
                count = Math.round(levelCount * typeRatio);
            }
        } else {
            if (contentType === "all") {
                count = stats.total;
            } else {
                count = stats.byType[contentType];
            }
        }

        return count;
    };

    const handleStartPractice = async () => {
        try {
            setLoading(true);

            const params: { level?: string; type?: string; count?: number } = { count: 50 };
            if (selectedLevel) params.level = selectedLevel;
            if (contentType !== "all") params.type = contentType;

            const result = await speakingTemplateService.getRandomTemplates(params);

            if (result.data.length === 0) {
                toast.error("Không tìm thấy mẫu phù hợp");
                return;
            }

            setTemplates(result.data);
            setMode("template-practice");
        } catch (error: any) {
            toast.error(error.message || "Không thể tải mẫu luyện tập");
        } finally {
            setLoading(false);
        }
    };

    const handleExit = () => {
        if (mode === "select") {
            router.push("/learn");
        } else if (mode === "template-practice") {
            setMode("template-config");
            setTemplates([]);
        } else {
            setMode("select");
        }
    };

    const handleComplete = (results: Map<string, any>) => {
        console.log("Practice completed with results:", results);
    };

    if (mode === "select") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mic className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Luyện Nói Tiếng Anh
                        </h1>
                        <p className="text-gray-600">
                            Chọn chế độ luyện tập phù hợp với bạn
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card
                            className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 group"
                            onClick={() => setMode("ai-conversation")}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Bot className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    Luyện nói với AI
                                </h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    Trò chuyện tự do với AI bằng tiếng Anh. AI sẽ phản hồi và sửa lỗi ngữ pháp cho bạn.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                        GPT
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                        Tự do
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Sửa lỗi
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card
                            className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 group"
                            onClick={() => setMode("template-config")}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <ListChecks className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    Luyện nói theo mẫu
                                </h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    Đọc theo từ/câu mẫu có sẵn. AI sẽ kiểm tra phát âm và ngữ pháp của bạn.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {loadingStats ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    ) : (
                                        <>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                {stats?.total || 0} mẫu
                                            </span>
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                Từ & Câu
                                            </span>
                                            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                                3 cấp độ
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="mt-8 text-center">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/learn")}
                            className="text-gray-500"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === "ai-conversation") {
        return <AIConversation onExit={handleExit} />;
    }

    if (mode === "template-config") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ListChecks className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Luyện nói theo mẫu
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Chọn loại nội dung và độ khó phù hợp
                        </p>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm font-medium text-gray-600 mb-3">Loại nội dung:</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setContentType("all")}
                                className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${contentType === "all"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <ListChecks className="w-5 h-5" />
                                <span className="text-sm font-medium">Tất cả</span>
                            </button>
                            <button
                                onClick={() => setContentType("word")}
                                className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${contentType === "word"
                                    ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <Type className="w-5 h-5" />
                                <span className="text-sm font-medium">Từ vựng</span>
                            </button>
                            <button
                                onClick={() => setContentType("sentence")}
                                className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${contentType === "sentence"
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <MessageSquareText className="w-5 h-5" />
                                <span className="text-sm font-medium">Câu</span>
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm font-medium text-gray-600 mb-3">Chọn độ khó:</p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { level: "easy" as Level, label: "Dễ", color: "from-green-400 to-green-500" },
                                { level: "medium" as Level, label: "Trung bình", color: "from-yellow-400 to-orange-500" },
                                { level: "hard" as Level, label: "Khó", color: "from-red-400 to-pink-500" }
                            ].map(({ level, label, color }) => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                                    className={`p-4 rounded-xl transition-all ${selectedLevel === level
                                        ? `bg-gradient-to-r ${color} text-white`
                                        : "bg-gray-50 hover:bg-gray-100"
                                        }`}
                                >
                                    <div className={`text-2xl font-bold mb-1 ${selectedLevel === level ? "text-white" : "text-gray-800"
                                        }`}>
                                        {stats?.byLevel[level] || 0}
                                    </div>
                                    <p className={`text-sm font-medium ${selectedLevel === level ? "text-white/90" : "text-gray-600"
                                        }`}>{label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Số mẫu ước tính:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                ~{getFilteredCount()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                            <Mic className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-gray-700">Whisper AI nhận diện giọng nói</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-gray-700">T5 AI kiểm tra ngữ pháp</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                            <Zap className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-700">Phản hồi và sửa lỗi tức thì</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleStartPractice}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 py-6 text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Đang tải...
                            </>
                        ) : (
                            `Bắt đầu luyện tập`
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleExit}
                        className="w-full mt-2 text-gray-500"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    const formattedTemplates = templates.map(t => ({
        id: t._id,
        text: t.text,
        level: t.level.charAt(0).toUpperCase() + t.level.slice(1) as "Easy" | "Medium" | "Hard"
    }));

    return (
        <SpeakingPracticeSwiper
            sentences={formattedTemplates}
            onComplete={handleComplete}
            onExit={handleExit}
        />
    );
}
