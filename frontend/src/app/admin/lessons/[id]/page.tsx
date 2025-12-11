"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { lessonService } from "@/services/lesson.service";
import { quizAdminService } from "@/services/quizAdmin.service";
import { blockService } from "@/services/block.service";
import { Quiz } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Save,
    Trash2,
    Plus,
    X,
    HelpCircle,
    FileText,
    Link2,
    Unlink,
    Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const SKILL_OPTIONS = [
    { value: "reading", label: "Reading" },
    { value: "listening", label: "Listening" },
    { value: "writing", label: "Writing" },
    { value: "speaking", label: "Speaking" },
];

const LEVEL_OPTIONS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
];

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
];

interface LessonBlock {
    _id: string;
    title: string;
    type: string;
    order: number;
    exercise: {
        _id: string;
        title: string;
    } | null;
}

interface LessonData {
    _id: string;
    title: string;
    description: string;
    skill: string;
    topic: string;
    level: string;
    status: string;
    duration_minutes: number;
    blocks: LessonBlock[];
    categoryId?: string;
}

export default function EditLessonPage() {
    const router = useRouter();
    const params = useParams();
    const lessonId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        skill: "reading",
        topic: "",
        level: "beginner",
        status: "draft",
        duration_minutes: 30,
    });

    // Quiz attachment dialog
    const [showQuizDialog, setShowQuizDialog] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [quizSearch, setQuizSearch] = useState("");
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [attachingQuiz, setAttachingQuiz] = useState(false);

    // Block attachment dialog
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [availableBlocks, setAvailableBlocks] = useState<any[]>([]);
    const [blockSearch, setBlockSearch] = useState("");
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const [addingBlock, setAddingBlock] = useState(false);

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            setLoading(true);
            const response = await lessonService.getDetailForEdit(lessonId);
            if (response.code === 200 && response.data) {
                const data = response.data;
                setLesson(data);
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    skill: data.skill || "reading",
                    topic: data.topic || "",
                    level: data.level || "beginner",
                    status: data.status || "draft",
                    duration_minutes: data.duration_minutes || 30,
                });
            } else {
                toast.error("Lesson not found");
                router.push("/admin/lessons");
            }
        } catch (error) {
            console.error("Error fetching lesson:", error);
            toast.error("Failed to load lesson");
            router.push("/admin/lessons");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        try {
            setLoadingQuizzes(true);
            const response = await quizAdminService.getAll({
                search: quizSearch,
                pageSize: 50,
            });
            if (response.code === 200) {
                setQuizzes(response.data);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Lesson title is required");
            return;
        }

        try {
            setSaving(true);
            const updateData: any = { ...formData };
            const response = await lessonService.update(lessonId, updateData);
            if (response.code === 200) {
                toast.success("Lesson updated successfully!");
                router.push("/admin/lessons");
            }
        } catch (error) {
            console.error("Error updating lesson:", error);
            toast.error("Failed to update lesson");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "duration_minutes" ? Number(value) : value,
        }));
    };

    // Open quiz attachment dialog
    const openQuizDialog = (blockId: string) => {
        setSelectedBlockId(blockId);
        setShowQuizDialog(true);
        fetchQuizzes();
    };

    // Attach quiz to block
    const handleAttachQuiz = async (quizId: string) => {
        if (!selectedBlockId) return;

        try {
            setAttachingQuiz(true);
            const response = await lessonService.attachQuiz({
                lessonId,
                quizId,
                blockId: selectedBlockId,
            });
            if (response.code === 200) {
                toast.success("Quiz attached successfully!");
                setShowQuizDialog(false);
                fetchLesson();
            } else {
                toast.error(response.message || "Failed to attach quiz");
            }
        } catch (error) {
            toast.error("Failed to attach quiz");
        } finally {
            setAttachingQuiz(false);
        }
    };

    // Detach quiz from block
    const handleDetachQuiz = async (quizId: string) => {
        if (!confirm("Are you sure you want to detach this quiz?")) return;

        try {
            const response = await lessonService.detachQuiz({
                lessonId,
                quizId,
            });
            if (response.code === 200) {
                toast.success("Quiz detached successfully!");
                fetchLesson();
            } else {
                toast.error(response.message || "Failed to detach quiz");
            }
        } catch (error) {
            toast.error("Failed to detach quiz");
        }
    };

    // Block management
    const fetchAvailableBlocks = async () => {
        try {
            setLoadingBlocks(true);
            const response = await blockService.getAllBlocks({
                search: blockSearch,
                pageSize: 50,
            });
            if ((response as any).code === 200) {
                setAvailableBlocks((response as any).data || []);
            }
        } catch (error) {
            console.error("Error fetching blocks:", error);
        } finally {
            setLoadingBlocks(false);
        }
    };

    const openBlockDialog = () => {
        setShowBlockDialog(true);
        fetchAvailableBlocks();
    };

    const handleAddBlock = async (blockId: string) => {
        try {
            setAddingBlock(true);
            const currentOrder = lesson?.blocks?.length ? lesson.blocks.length + 1 : 1;
            const response = await lessonService.assignBlockToLesson({
                lessonId,
                blockId,
                order: currentOrder,
            });
            if (response.code === 200) {
                toast.success("Block added successfully!");
                setShowBlockDialog(false);
                fetchLesson();
            } else {
                toast.error(response.message || "Failed to add block");
            }
        } catch (error) {
            toast.error("Failed to add block");
        } finally {
            setAddingBlock(false);
        }
    };

    const handleRemoveBlock = async (blockId: string) => {
        if (!confirm("Are you sure you want to remove this block from the lesson?")) return;

        try {
            const response = await lessonService.removeBlockFromLesson(blockId);
            if (response.code === 200) {
                toast.success("Block removed successfully!");
                fetchLesson();
            } else {
                toast.error(response.message || "Failed to remove block");
            }
        } catch (error) {
            toast.error("Failed to remove block");
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    if (!lesson) {
        return null;
    }

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lessons
                </Button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Lesson</h1>
                        <p className="text-gray-600">Update lesson information and manage blocks</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Lesson Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Introduction to Reading"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Skill <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="skill"
                                    value={formData.skill}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {SKILL_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Level <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {LEVEL_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Topic <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    placeholder="e.g., Daily Conversations"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Duration (minutes)
                                </label>
                                <Input
                                    type="number"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of this lesson"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Blocks Panel */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Lesson Blocks ({lesson.blocks?.length || 0})
                            </h3>
                            <p className="text-sm text-gray-500">Manage blocks and attach quizzes</p>
                        </div>
                        <Button
                            onClick={openBlockDialog}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Block
                        </Button>
                    </div>

                    <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                        {lesson.blocks && lesson.blocks.length > 0 ? (
                            lesson.blocks.map((block, idx) => (
                                <div
                                    key={block._id}
                                    className="p-4 bg-gray-50 rounded-lg border hover:border-blue-300 transition-colors relative group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                                    #{block.order || idx + 1}
                                                </span>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded capitalize">
                                                    {block.type}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {block.title}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBlock(block._id)}
                                            className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove Block"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Quiz attachment section */}
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        {block.exercise ? (
                                            <div className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                                                <div className="flex items-center gap-2">
                                                    <HelpCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-green-700 font-medium">
                                                        {block.exercise.title}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDetachQuiz(block.exercise!._id)}
                                                    className="p-1 hover:bg-red-100 rounded text-red-500"
                                                    title="Detach Quiz"
                                                >
                                                    <Unlink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openQuizDialog(block._id)}
                                                className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Link2 className="w-4 h-4" />
                                                <span className="text-sm">Attach Quiz</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>No blocks added yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quiz Attachment Dialog */}
            {showQuizDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Attach Quiz to Block</h2>
                                <p className="text-sm text-gray-500">Select a quiz to attach</p>
                            </div>
                            <button
                                onClick={() => setShowQuizDialog(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search quizzes..."
                                    value={quizSearch}
                                    onChange={(e) => {
                                        setQuizSearch(e.target.value);
                                        fetchQuizzes();
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loadingQuizzes ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                                </div>
                            ) : quizzes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No quizzes found
                                </div>
                            ) : (
                                quizzes.map((quiz) => (
                                    <button
                                        key={quiz._id}
                                        onClick={() => handleAttachQuiz(quiz._id)}
                                        disabled={attachingQuiz}
                                        className="w-full p-4 text-left bg-gray-50 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{quiz.title}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded capitalize">
                                                        {quiz.skill || "-"}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                                                        {quiz.questions?.length || 0} questions
                                                    </span>
                                                </div>
                                            </div>
                                            <Link2 className="w-5 h-5 text-blue-500" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setShowQuizDialog(false)}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Attachment Dialog */}
            {showBlockDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Add Block to Lesson</h2>
                                <p className="text-sm text-gray-500">Select a block to add</p>
                            </div>
                            <button
                                onClick={() => setShowBlockDialog(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search blocks..."
                                    value={blockSearch}
                                    onChange={(e) => {
                                        setBlockSearch(e.target.value);
                                        fetchAvailableBlocks();
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loadingBlocks ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                                </div>
                            ) : availableBlocks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No blocks found
                                </div>
                            ) : (
                                availableBlocks.map((block) => (
                                    <button
                                        key={block._id}
                                        onClick={() => handleAddBlock(block._id)}
                                        disabled={addingBlock}
                                        className="w-full p-4 text-left bg-gray-50 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{block.title}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded capitalize">
                                                        {block.type}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded capitalize">
                                                        {block.skill}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded capitalize">
                                                        {block.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                            <Plus className="w-5 h-5 text-blue-500" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setShowBlockDialog(false)}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
