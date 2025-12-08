"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { RefPicker } from "../shared/RefPicker";
import { ChunkedMediaUploader, SourceType } from "../shared/ChunkedMediaUploader";
import { cn } from "@/lib/utils";

export interface GrammarBlockFormData {
    topic: string;
    explanation: string;
    examples: string[];
    videoUrl: string;
    sourceType: SourceType;
    exercise?: string; // Quiz ID
}

interface GrammarBlockFormProps {
    data: GrammarBlockFormData;
    onChange: (data: Partial<GrammarBlockFormData>) => void;
    lessonId?: string;
    duration?: number;
    onDurationChange?: (duration?: number) => void;
}

export function GrammarBlockForm({ data, onChange, lessonId, duration, onDurationChange }: GrammarBlockFormProps) {
    const handleSourceTypeChange = (sourceType: SourceType) => {
        onChange({ sourceType });
        // Khi chuyển sang upload, duration sẽ được auto từ Cloudinary, reset giá trị nhập tay
        if (sourceType === "upload") {
            onDurationChange?.(undefined);
        }
    };

    const displayMinutes = duration ? Math.ceil(duration / 60) : 0;
    const handleAddExample = () => {
        onChange({ examples: [...(data.examples || []), ""] });
    };

    const handleRemoveExample = (index: number) => {
        const newExamples = data.examples.filter((_, i) => i !== index);
        onChange({ examples: newExamples });
    };

    const handleExampleChange = (index: number, value: string) => {
        const newExamples = [...data.examples];
        newExamples[index] = value;
        onChange({ examples: newExamples });
    };

    return (
        <div className="space-y-6">
            {/* Topic */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chủ đề <span className="text-red-500">*</span>
                </label>
                <Input
                    value={data.topic || ""}
                    onChange={(e) => onChange({ topic: e.target.value })}
                    placeholder="Ví dụ: Present Perfect Tense"
                    className="cursor-pointer"
                />
            </div>

            {/* Explanation */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giải thích <span className="text-red-500">*</span>
                </label>
                <Textarea
                    value={data.explanation || ""}
                    onChange={(e) => onChange({ explanation: e.target.value })}
                    rows={6}
                    placeholder="Giải thích quy tắc ngữ pháp..."
                    className="resize-none cursor-pointer"
                />
            </div>

            {/* Examples */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ví dụ
                </label>
                <div className="space-y-2">
                    {(data.examples || []).map((example, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={example}
                                onChange={(e) => handleExampleChange(index, e.target.value)}
                                placeholder={`Ví dụ ${index + 1}`}
                                className="flex-1 cursor-pointer"
                            />
                            {(data.examples?.length || 0) > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveExample(index)}
                                    className="cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {(!data.examples || data.examples.length === 0) && (
                        <p className="text-sm text-gray-500 italic">
                            Chưa có ví dụ nào. Nhấn "Thêm ví dụ" để thêm.
                        </p>
                    )}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddExample}
                    className="mt-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ví dụ
                </Button>
            </div>

            {/* Video Uploader - Chunked for upload, fallback for youtube/link */}
            <div>
                <ChunkedMediaUploader
                    type="video"
                    sourceType={data.sourceType || "upload"}
                    value={data.videoUrl || ""}
                    onChange={(url) => onChange({ videoUrl: url })}
                    onSourceTypeChange={handleSourceTypeChange}
                    onDurationChange={onDurationChange}
                    label="Video (tùy chọn)"
                    required={false}
                />
            </div>

            {/* Exercise (Quiz) - Optional */}
            <div>
                <RefPicker
                    type="quiz"
                    value={data.exercise || ""}
                    onChange={(quizId) => onChange({ exercise: quizId })}
                    label="Bài tập (tùy chọn)"
                    required={false}
                />
            </div>

            {/* Duration - auto for upload (Cloudinary), manual for YouTube */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời lượng (phút)
                </label>
                {data.sourceType === "upload" ? (
                    <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm">
                        {displayMinutes} (tự động lấy từ Cloudinary)
                    </div>
                ) : (
                    <Input
                        type="number"
                        min={0}
                        value={displayMinutes || ""}
                        onChange={(e) => {
                            const minutes = Number(e.target.value);
                            if (!Number.isNaN(minutes)) {
                                onDurationChange?.(minutes * 60); // lưu giây để gửi server
                            } else {
                                onDurationChange?.(undefined);
                            }
                        }}
                        placeholder="Ví dụ: 15"
                        className="cursor-pointer"
                    />
                )}
            </div>
        </div>
    );
}

