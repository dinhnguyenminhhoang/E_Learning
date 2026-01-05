"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PenTool, BookOpen, Zap, ListChecks, ChevronLeft, FileText, Loader2 } from "lucide-react";
import writingTemplateService, { WritingTemplate, WritingTemplateStats } from "@/services/writingTemplate.service";
import { toast } from "react-hot-toast";
import WritingPracticeCard from "@/components/writing/WritingPracticeCard";
import { apiClient } from "@/config/api.config";

type PracticeMode = "select" | "template-config" | "template-practice";
type ContentType = "all" | "essay" | "email" | "story" | "description" | "opinion";
type Level = "easy" | "medium" | "hard";

const contentTypeLabels: Record<ContentType, string> = {
    all: "Tất cả",
    essay: "Bài luận",
    email: "Email",
    story: "Câu chuyện",
    description: "Mô tả",
    opinion: "Quan điểm"
};

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
    all: <ListChecks className="w-5 h-5" />,
    essay: <FileText className="w-5 h-5" />,
    email: <BookOpen className="w-5 h-5" />,
    story: <PenTool className="w-5 h-5" />,
    description: <Zap className="w-5 h-5" />,
    opinion: <FileText className="w-5 h-5" />
};

export default function WritingPracticePage() {
    const router = useRouter();
    const [mode, setMode] = useState<PracticeMode>("select");
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [contentType, setContentType] = useState<ContentType>("all");
    const [templates, setTemplates] = useState<WritingTemplate[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState<WritingTemplateStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoadingStats(true);
            const data = await writingTemplateService.getStats();
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

    const handleStartPractice = () => {
        // Build URL with query params
        const params = new URLSearchParams();
        params.append('count', '20');
        if (selectedLevel) params.append('level', selectedLevel);
        if (contentType !== 'all') params.append('type', contentType);

        // Navigate to writing-practice-test with params
        router.push(`/writing-practice-test?${params.toString()}`);
    };

    const handleExit = () => {
        if (mode === "select") {
            router.push("/learn");
        } else if (mode === "template-practice") {
            setMode("template-config");
            setTemplates([]);
            setCurrentIndex(0);
        } else {
            setMode("select");
        }
    };

    const handleNext = () => {
        if (currentIndex < templates.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (mode === "select") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PenTool className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Luyện Viết Tiếng Anh
                        </h1>
                        <p className="text-gray-600">
                            Cải thiện kỹ năng viết với AI Grammar Check
                        </p>
                    </div>

                    <Card
                        className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 group"
                        onClick={() => setMode("template-config")}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <ListChecks className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                Luyện viết theo chủ đề
                            </h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Viết theo các chủ đề có sẵn. AI sẽ kiểm tra ngữ pháp và chấm điểm bài viết của bạn.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {loadingStats ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : (
                                    <>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                            {stats?.total || 0} chủ đề
                                        </span>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                            5 loại bài
                                        </span>
                                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                            3 cấp độ
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

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

    if (mode === "template-config") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ListChecks className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Luyện viết theo chủ đề
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Chọn loại bài viết và độ khó phù hợp
                        </p>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm font-medium text-gray-600 mb-3">Loại bài viết:</p>
                        <div className="grid grid-cols-3 gap-3">
                            {(Object.keys(contentTypeLabels) as ContentType[]).slice(0, 3).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setContentType(type)}
                                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${contentType === type
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {contentTypeIcons[type]}
                                    <span className="text-sm font-medium">{contentTypeLabels[type]}</span>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-3">
                            {(Object.keys(contentTypeLabels) as ContentType[]).slice(3).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setContentType(type)}
                                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${contentType === type
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {contentTypeIcons[type]}
                                    <span className="text-sm font-medium">{contentTypeLabels[type]}</span>
                                </button>
                            ))}
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
                            <span className="text-gray-600">Số chủ đề ước tính:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                ~{getFilteredCount()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                            <PenTool className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-gray-700">Viết tự do theo chủ đề</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-gray-700">AI Grammar Check kiểm tra ngữ pháp</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                            <Zap className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-700">Nhận feedback và đề xuất cải thiện</span>
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

    if (mode === "template-practice" && templates.length > 0) {
        return (
            <WritingPracticeCard
                template={templates[currentIndex]}
                currentIndex={currentIndex}
                totalTemplates={templates.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onExit={handleExit}
            />
        );
    }

    return null;
}
