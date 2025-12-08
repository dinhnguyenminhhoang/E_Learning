"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { ChunkedMediaUploader, MediaType, SourceType } from "../shared/ChunkedMediaUploader";
import { cn } from "@/lib/utils";

export interface MediaTask {
    question: string;
    answer: string;
}

export interface MediaBlockFormData {
    mediaType: MediaType;
    sourceType: SourceType;
    sourceUrl: string;
    transcript: string;
    tasks: MediaTask[];
}

interface MediaBlockFormProps {
    data: MediaBlockFormData;
    onChange: (data: Partial<MediaBlockFormData>) => void;
}

export function MediaBlockForm({ data, onChange }: MediaBlockFormProps) {
    const handleAddTask = () => {
        onChange({
            tasks: [...(data.tasks || []), { question: "", answer: "" }],
        });
    };

    const handleRemoveTask = (index: number) => {
        const newTasks = data.tasks.filter((_, i) => i !== index);
        onChange({ tasks: newTasks });
    };

    const handleTaskChange = (index: number, field: "question" | "answer", value: string) => {
        const newTasks = [...(data.tasks || [])];
        if (!newTasks[index]) {
            newTasks[index] = { question: "", answer: "" };
        }
        newTasks[index][field] = value;
        onChange({ tasks: newTasks });
    };

    // Update sourceType based on mediaType
    const handleMediaTypeChange = (newMediaType: MediaType) => {
        // If switching to audio and sourceType is youtube, change to link
        if (newMediaType === "audio" && data.sourceType === "youtube") {
            onChange({ mediaType: newMediaType, sourceType: "link" });
        } else {
            onChange({ mediaType: newMediaType });
        }
    };

    return (
        <div className="space-y-6">
            {/* Media Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại media <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleMediaTypeChange("video")}
                        className={cn(
                            "flex-1 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer",
                            data.mediaType === "video"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Video
                    </button>
                    <button
                        type="button"
                        onClick={() => handleMediaTypeChange("audio")}
                        className={cn(
                            "flex-1 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer",
                            data.mediaType === "audio"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Audio
                    </button>
                </div>
            </div>

            {/* Media Uploader - Chunked Upload */}
            <div>
                <ChunkedMediaUploader
                    type={data.mediaType}
                    sourceType={data.sourceType || (data.mediaType === "video" ? "upload" : "upload")}
                    value={data.sourceUrl || ""}
                    onChange={(url) => onChange({ sourceUrl: url })}
                    onSourceTypeChange={(sourceType) => onChange({ sourceType })}
                    label="Nguồn media"
                    required={true}
                />
            </div>

            {/* Transcript */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transcript (tùy chọn)
                </label>
                <Textarea
                    value={data.transcript || ""}
                    onChange={(e) => onChange({ transcript: e.target.value })}
                    rows={6}
                    placeholder="Nhập transcript cho audio/video..."
                    className="resize-none cursor-pointer"
                />
            </div>

            {/* Tasks */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Câu hỏi (tùy chọn)
                </label>
                <div className="space-y-3">
                    {(data.tasks || []).map((task, index) => (
                        <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg space-y-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                    Câu hỏi {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveTask(index)}
                                    className="cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <Input
                                value={task.question}
                                onChange={(e) =>
                                    handleTaskChange(index, "question", e.target.value)
                                }
                                placeholder="Câu hỏi..."
                                className="cursor-pointer"
                            />
                            <Input
                                value={task.answer}
                                onChange={(e) =>
                                    handleTaskChange(index, "answer", e.target.value)
                                }
                                placeholder="Đáp án..."
                                className="cursor-pointer"
                            />
                        </div>
                    ))}
                    {(!data.tasks || data.tasks.length === 0) && (
                        <p className="text-sm text-gray-500 italic">
                            Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để thêm.
                        </p>
                    )}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTask}
                    className="mt-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm câu hỏi
                </Button>
            </div>
        </div>
    );
}

