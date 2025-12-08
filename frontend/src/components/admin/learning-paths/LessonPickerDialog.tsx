"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonPickerDialogProps {
    open: boolean;
    onClose: () => void;
    levelOrder: number | null;
    lessons: any[];
    loading: boolean;
    search: string;
    onSearchChange: (search: string) => void;
    onSelectLesson: (lessonId: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function LessonPickerDialog({
    open,
    onClose,
    levelOrder,
    lessons,
    loading,
    search,
    onSearchChange,
    onSelectLesson,
    page,
    totalPages,
    onPageChange,
}: LessonPickerDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Thêm Bài học vào Cấp độ</h2>
                        <p className="text-sm text-gray-600 mt-1">Cấp độ {levelOrder}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm bài học..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                        </div>
                    ) : lessons.length > 0 ? (
                        <div className="space-y-2">
                            {lessons.map((lesson) => (
                                <button
                                    key={lesson._id}
                                    onClick={() => onSelectLesson(lesson._id)}
                                    className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <BookOpen className="w-5 h-5 text-gray-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{lesson.title}</p>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {lesson.description || "Không có mô tả"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs px-2 py-1 bg-white border rounded capitalize">
                                                    {lesson.skill}
                                                </span>
                                                <span className="text-xs text-gray-500">{lesson.difficulty}</span>
                                                <span
                                                    className={cn(
                                                        "text-xs px-2 py-1 rounded",
                                                        lesson.status === "published"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    )}
                                                >
                                                    {lesson.status}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Không tìm thấy bài học</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Trang {page} / {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || loading}
                                onClick={() => onPageChange(page - 1)}
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages || loading}
                                onClick={() => onPageChange(page + 1)}
                            >
                                Tiếp theo
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
