"use client";

import { useState, useEffect, useCallback } from "react";
import { WritingTemplate } from "@/services/writingTemplate.service";
import { writingPracticeService, GrammarError, GradingResult } from "@/services/writingPractice.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    X,
    Lightbulb,
    CheckCircle,
    AlertTriangle,
    FileText,
    Loader2,
    Send
} from "lucide-react";
import { toast } from "react-hot-toast";

interface WritingPracticeCardProps {
    template: WritingTemplate;
    currentIndex: number;
    totalTemplates: number;
    onNext: () => void;
    onPrevious: () => void;
    onExit: () => void;
}

export default function WritingPracticeCard({
    template,
    currentIndex,
    totalTemplates,
    onNext,
    onPrevious,
    onExit,
}: WritingPracticeCardProps) {
    const [text, setText] = useState("");
    const [checking, setChecking] = useState(false);
    const [grammarErrors, setGrammarErrors] = useState<GrammarError[]>([]);
    const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
    const [showHints, setShowHints] = useState(false);
    const [showTranslation, setShowTranslation] = useState(false);

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const progress = ((currentIndex + 1) / totalTemplates) * 100;

    useEffect(() => {
        setText("");
        setGrammarErrors([]);
        setGradingResult(null);
        setShowHints(false);
    }, [template._id]);

    const handleCheckGrammar = async () => {
        if (text.trim().length === 0) {
            toast.error("Vui lòng viết gì đó trước khi kiểm tra!");
            return;
        }

        try {
            setChecking(true);

            const data = await writingPracticeService.gradeWriting(text.trim(), {
                topic: template.title,
                prompt: template.prompt
            });

            if (data) {
                const errors = data.grammar_errors || [];
                setGrammarErrors(errors);

                if (data.grading) {
                    setGradingResult(data.grading);

                    const score = data.grading.score || 0;
                    if (score >= 80) {
                        toast.success(`Xuất sắc! Điểm: ${score}/100`);
                    } else if (score >= 60) {
                        toast.success(`Tốt! Điểm: ${score}/100`);
                    } else {
                        toast.error(`Điểm: ${score}/100 - Cần cải thiện`);
                    }
                } else {
                    if (errors.length === 0) {
                        toast.success("Tuyệt vời! Không tìm thấy lỗi ngữ pháp nào!");
                    } else {
                        toast.error(`Tìm thấy ${errors.length} lỗi ngữ pháp`);
                    }
                }
            }
        } catch (error: any) {
            console.error("Error checking grammar:", error);
            toast.error(error?.response?.data?.message || "Không thể kiểm tra ngữ pháp. Vui lòng thử lại!");
        } finally {
            setChecking(false);
        }
    };

    const highlightGrammarErrors = (inputText: string, errors: GrammarError[]) => {
        if (!inputText || errors.length === 0) return inputText;

        const parts: Array<{ text: string; isError: boolean; error?: GrammarError }> = [];
        let lastIndex = 0;

        errors.sort((a, b) => a.offset - b.offset).forEach((error) => {
            if (error.offset > lastIndex) {
                parts.push({ text: inputText.substring(lastIndex, error.offset), isError: false });
            }

            parts.push({
                text: inputText.substring(error.offset, error.offset + error.length),
                isError: true,
                error: error
            });

            lastIndex = error.offset + error.length;
        });

        if (lastIndex < inputText.length) {
            parts.push({ text: inputText.substring(lastIndex), isError: false });
        }

        return parts;
    };

    const parts = highlightGrammarErrors(text, grammarErrors);

    return (
        <div className="flex h-screen bg-gray-100 fixed inset-0">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Tiến độ</h2>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">
                                Chủ đề {currentIndex + 1} / {totalTemplates}
                            </span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Chủ đề:</h3>
                            <Card className="p-4 bg-blue-50 border-blue-200">
                                <p className="text-blue-900 font-medium">{template.title}</p>
                                {template.titleVi && (
                                    <p className="text-sm text-blue-700 mt-1">{template.titleVi}</p>
                                )}
                            </Card>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Yêu cầu:</h3>
                            <Card className="p-4 bg-purple-50 border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-purple-700" />
                                    <span className="text-sm font-medium text-purple-900">
                                        {template.minWords} - {template.maxWords} từ
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${template.level === "easy"
                                        ? "bg-green-100 text-green-700"
                                        : template.level === "medium"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                        {template.level === "easy" ? "Dễ" : template.level === "medium" ? "TB" : "Khó"}
                                    </div>
                                    <div className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                        {template.type}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {template.hints && template.hints.length > 0 && (
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowHints(!showHints)}
                                    className="w-full mb-2"
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    {showHints ? "Ẩn gợi ý" : "Hiện gợi ý"}
                                </Button>
                                {showHints && (
                                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            {template.hints.map((hint, index) => (
                                                <li key={index} className="flex gap-2">
                                                    <span className="text-yellow-600">•</span>
                                                    <span>{hint}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}
                            </div>
                        )}

                        {gradingResult && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    Kết quả chấm điểm
                                </h3>
                                <Card className={`p-4 border-2 ${gradingResult.score >= 80
                                    ? "bg-green-50 border-green-200"
                                    : gradingResult.score >= 60
                                        ? "bg-blue-50 border-blue-200"
                                        : "bg-orange-50 border-orange-200"
                                    }`}>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Điểm số:</span>
                                            <span className={`text-2xl font-bold ${gradingResult.score >= 80
                                                ? "text-green-600"
                                                : gradingResult.score >= 60
                                                    ? "text-blue-600"
                                                    : "text-orange-600"
                                                }`}>
                                                {gradingResult.score}/100
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Trình độ:</span>
                                            <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold">
                                                {gradingResult.level}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t text-xs text-gray-500 text-center">
                                            Xem chi tiết đánh giá ở bên phải
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {grammarErrors.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    Lỗi ngữ pháp ({grammarErrors.length})
                                </h3>
                                <Card className="p-4 bg-red-50 border-red-200 max-h-60 overflow-y-auto">
                                    <ul className="space-y-3 text-sm">
                                        {grammarErrors.map((error, index) => (
                                            <li key={index} className="border-b border-red-200 last:border-0 pb-2 last:pb-0">
                                                <p className="text-red-900 font-medium">{error.message}</p>
                                                {error.replacements && error.replacements.length > 0 && (
                                                    <p className="text-red-700 text-xs mt-1">
                                                        Gợi ý: <span className="font-semibold">{error.replacements.map(r => r.value).join(", ")}</span>
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Thống kê:</h3>
                            <Card className="p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Số từ:</span>
                                    <span className={`text-lg font-bold ${wordCount < template.minWords
                                        ? "text-orange-600"
                                        : wordCount > template.maxWords
                                            ? "text-red-600"
                                            : "text-green-600"
                                        }`}>
                                        {wordCount}
                                    </span>
                                </div>
                                {wordCount > 0 && (
                                    <div className="text-xs text-gray-500">
                                        {wordCount < template.minWords && `Cần thêm ${template.minWords - wordCount} từ`}
                                        {wordCount > template.maxWords && `Vượt quá ${wordCount - template.maxWords} từ`}
                                        {wordCount >= template.minWords && wordCount <= template.maxWords && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-3 h-3" />
                                                Đạt yêu cầu
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onExit}
                        className="w-full"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Thoát
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {template.title}
                        </h1>
                        <Button
                            onClick={handleCheckGrammar}
                            disabled={checking || text.trim().length === 0}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {checking ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang chấm điểm...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Chấm điểm
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    <Card className="max-w-4xl mx-auto p-6">
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold text-gray-800">Đề bài:</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTranslation(!showTranslation)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                    {showTranslation ? "Ẩn dịch" : "Dịch đề bài"}
                                </Button>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{template.prompt}</p>
                            {showTranslation && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-blue-800 text-sm italic">
                                        {template.promptVi || "Chưa có bản dịch cho đề bài này."}
                                    </p>
                                </div>
                            )}
                            {template.promptVi && !showTranslation && (
                                <p className="text-gray-500 text-sm mt-2 italic hidden">{template.promptVi}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Bài viết của bạn:
                            </label>
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Bắt đầu viết bài của bạn tại đây..."
                                rows={20}
                                className="resize-none font-mono"
                            />
                        </div>

                        {grammarErrors.length > 0 && text && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Xem trước với lỗi được đánh dấu:</h3>
                                <Card className="p-4 bg-gray-50 border-gray-200">
                                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                        {typeof parts === 'string' ? parts : parts.map((part, index) => (
                                            part.isError ? (
                                                <span
                                                    key={index}
                                                    className="bg-red-200 text-red-800 cursor-help underline decoration-red-500 decoration-dotted"
                                                    title={part.error?.message}
                                                >
                                                    {part.text}
                                                </span>
                                            ) : (
                                                <span key={index}>{part.text}</span>
                                            )
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {gradingResult && gradingResult.detailed_analysis && (
                            <div className="mt-8 space-y-6">
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Chi tiết đánh giá
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="p-4 bg-blue-50 border-blue-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-blue-900">Từ vựng (Vocabulary)</span>
                                                <span className="font-bold text-blue-700">{gradingResult.detailed_analysis.vocabulary.score}/10</span>
                                            </div>
                                            <Progress value={gradingResult.detailed_analysis.vocabulary.score * 10} className="h-2 mb-2" />
                                            <p className="text-sm text-blue-800">{gradingResult.detailed_analysis.vocabulary.comment}</p>
                                        </Card>

                                        <Card className="p-4 bg-green-50 border-green-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-green-900">Ngữ pháp (Grammar)</span>
                                                <span className="font-bold text-green-700">{gradingResult.detailed_analysis.grammar.score}/10</span>
                                            </div>
                                            <Progress value={gradingResult.detailed_analysis.grammar.score * 10} className="h-2 mb-2" />
                                            <p className="text-sm text-green-800">{gradingResult.detailed_analysis.grammar.comment}</p>
                                        </Card>

                                        <Card className="p-4 bg-purple-50 border-purple-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-purple-900">Mạch lạc (Coherence)</span>
                                                <span className="font-bold text-purple-700">{gradingResult.detailed_analysis.coherence.score}/10</span>
                                            </div>
                                            <Progress value={gradingResult.detailed_analysis.coherence.score * 10} className="h-2 mb-2" />
                                            <p className="text-sm text-purple-800">{gradingResult.detailed_analysis.coherence.comment}</p>
                                        </Card>

                                        <Card className="p-4 bg-orange-50 border-orange-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-orange-900">Đúng đề bài (Relevance)</span>
                                                <span className="font-bold text-orange-700">{gradingResult.detailed_analysis.relevance.score}/10</span>
                                            </div>
                                            <Progress value={gradingResult.detailed_analysis.relevance.score * 10} className="h-2 mb-2" />
                                            <p className="text-sm text-orange-800">{gradingResult.detailed_analysis.relevance.comment}</p>
                                        </Card>
                                    </div>
                                </div>

                                {gradingResult.improvement_plan && (
                                    <Card className="p-6 bg-yellow-50 border-yellow-200">
                                        <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-yellow-600" />
                                            Kế hoạch cải thiện
                                        </h4>
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                            {gradingResult.improvement_plan}
                                        </p>
                                    </Card>
                                )}

                                {gradingResult.translated_text && (
                                    <Card className="p-6 bg-indigo-50 border-indigo-200">
                                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                            Bản dịch bài viết của bạn
                                        </h4>
                                        <p className="text-gray-800 leading-relaxed italic">
                                            "{gradingResult.translated_text}"
                                        </p>
                                    </Card>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="bg-white border-t border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <Button
                            variant="outline"
                            onClick={onPrevious}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Chủ đề trước
                        </Button>

                        <Button
                            variant="outline"
                            onClick={onNext}
                            disabled={currentIndex === totalTemplates - 1}
                        >
                            Chủ đề sau
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
