"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { learningPathAdminService } from "@/services/learningPathAdmin.service";
import { lessonService } from "@/services/lesson.service";
import { targetService } from "@/services/target.service";
import { examService } from "@/services/exam.service";
import { TargetOption } from "@/types/target";
import { CreateLearningPathInput } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Save,
    Plus,
    X,
    Search,
    BookOpen,
    Trash2,
    ChevronRight,
    Edit2,
    ChevronUp,
    ChevronDown,
    FileQuestion,
    Link2,
    Unlink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { LessonPickerDialog, LevelDialogs } from "@/components/admin/learning-paths";

export default function EditLearningPathPage() {
    const router = useRouter();
    const params = useParams();
    const pathId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingTargets, setLoadingTargets] = useState(true);
    const [availableTargets, setAvailableTargets] = useState<TargetOption[]>([]);
    const [pathData, setPathData] = useState<any>(null);
    const [formData, setFormData] = useState<
        CreateLearningPathInput & { targetId: string }
    >({
        title: "",
        description: "",
        target: "",
        targetId: "",
        key: "",
        level: "beginner",
        status: "active",
    });

    // Lesson management states
    const [showAddLessonDialog, setShowAddLessonDialog] = useState(false);
    const [selectedLevelForLesson, setSelectedLevelForLesson] = useState<number | null>(
        null
    );
    const [availableLessons, setAvailableLessons] = useState<any[]>([]);
    const [lessonSearch, setLessonSearch] = useState("");
    const [lessonPage, setLessonPage] = useState(1);
    const [lessonTotalPages, setLessonTotalPages] = useState(1);
    const [loadingLessons, setLoadingLessons] = useState(false);

    const [showEditLevelDialog, setShowEditLevelDialog] = useState(false);
    const [showDeleteLevelDialog, setShowDeleteLevelDialog] = useState(false);
    const [showCreateLevelDialog, setShowCreateLevelDialog] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<any>(null);
    const [editLevelData, setEditLevelData] = useState({ title: "" });
    const [newLevelTitle, setNewLevelTitle] = useState("");

    // Exam attachment states
    const [showExamDialog, setShowExamDialog] = useState(false);
    const [selectedLevelForExam, setSelectedLevelForExam] = useState<number | null>(null);
    const [availableExams, setAvailableExams] = useState<any[]>([]);
    const [examSearch, setExamSearch] = useState("");
    const [loadingExams, setLoadingExams] = useState(false);

    useEffect(() => {
        if (pathId) {
            loadPath();
            fetchAllTargets();
        }
    }, [pathId]);

    const loadPath = async () => {
        try {
            setLoadingData(true);
            // Use getDetailForEdit for full details (levels, lessons with blocks)
            const response = await learningPathAdminService.getDetailForEdit(pathId);
            if (response.code === 200 && response.data) {
                const path = response.data;
                setPathData(path);
                setFormData({
                    title: path.title,
                    description: path.description || "",
                    target: path.target && typeof path.target === "object" ? path.target.name : path.target || "",
                    targetId:
                        path.target && typeof path.target === "object" ? path.target._id : path.target || "",
                    key: path.key,
                    level: path.level,
                    status: path.status,
                });
            }
        } catch (error) {
            console.error("Error loading path:", error);
            toast.error("Không thể tải lộ trình học");
            router.push("/admin/learning-paths");
        } finally {
            setLoadingData(false);
        }
    };

    const fetchAllTargets = async () => {
        try {
            setLoadingTargets(true);
            const response = await targetService.getUnassignedTargets();
            if (response.code === 200) {
                setAvailableTargets(response.data);
            }
        } catch (error) {
            console.error("Error fetching targets:", error);
        } finally {
            setLoadingTargets(false);
        }
    };

    const fetchAvailableLessons = async (page = 1, search = "") => {
        try {
            setLoadingLessons(true);
            const response = await lessonService.getAll({
                pageNum: page,
                pageSize: 10,
                search: search || undefined,
            });
            if (response.code === 200) {
                setAvailableLessons(response.data || []);
                setLessonTotalPages(response.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching lessons:", error);
        } finally {
            setLoadingLessons(false);
        }
    };

    // Debounce search - wait 400ms after user stops typing
    useEffect(() => {
        if (!showAddLessonDialog) return;

        const timer = setTimeout(() => {
            setLessonPage(1);
            fetchAvailableLessons(1, lessonSearch);
        }, 400);

        return () => clearTimeout(timer);
    }, [lessonSearch, showAddLessonDialog]);

    // Fetch available exams for attachment
    const fetchAvailableExams = async (search = "") => {
        try {
            setLoadingExams(true);
            const response = await examService.getExams({
                search: search || undefined,
                limit: 50,
            });
            if (response.code === 200) {
                setAvailableExams(response.data?.exams || response.data || []);
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
        } finally {
            setLoadingExams(false);
        }
    };

    // Debounce exam search
    useEffect(() => {
        if (!showExamDialog) return;

        const timer = setTimeout(() => {
            fetchAvailableExams(examSearch);
        }, 400);

        return () => clearTimeout(timer);
    }, [examSearch, showExamDialog]);

    // Attach exam to level
    const handleAttachExam = async (examId: string) => {
        if (selectedLevelForExam === null) return;

        try {
            const response = await learningPathAdminService.attachQuizToLevel({
                learningPathId: pathId,
                levelOrder: selectedLevelForExam,
                quizId: examId,
            });
            if (response.code === 200) {
                toast.success("Exam attached to level!");
                setShowExamDialog(false);
                setSelectedLevelForExam(null);
                loadPath();
            } else {
                toast.error(response.message || "Failed to attach exam");
            }
        } catch (error) {
            toast.error("Không thể gắn bài kiểm tra");
        }
    };

    // Detach exam from level
    const handleDetachExam = async (levelOrder: number) => {
        if (!confirm("Xóa bài kiểm tra này khỏi cấp độ?")) return;

        try {
            const response = await learningPathAdminService.removeQuizFromLevel({
                learningPathId: pathId,
                levelOrder,
            });
            if (response.code === 200) {
                toast.success("Đã xóa bài kiểm tra khỏi cấp độ!");
                loadPath();
            } else {
                toast.error(response.message || "Không thể xóa bài kiểm tra");
            }
        } catch (error) {
            toast.error("Không thể xóa bài kiểm tra");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.key.trim()) {
            toast.error("Tiêu đề và Mã là bắt buộc");
            return;
        }

        if (!formData.targetId) {
            toast.error("Vui lòng chọn mục tiêu");
            return;
        }

        try {
            setLoading(true);
            const response = await learningPathAdminService.update(pathId, {
                title: formData.title,
                description: formData.description,
                key: formData.key,
                level: formData.level,
                status: formData.status,
                targetId: formData.targetId,
            });
            if (response.code === 200) {
                toast.success("Cập nhật lộ trình học thành công!");
                loadPath();
            }
        } catch (error: any) {
            console.error("Error updating path:", error);
            toast.error("Không thể cập nhật lộ trình học");
        } finally {
            setLoading(false);
        }
    };

    const handleAddLessonToLevel = async (lessonId: string) => {
        if (selectedLevelForLesson === null) return;

        try {
            const response = await learningPathAdminService.assignLessonToPath({
                learningPathId: pathId,
                levelOrder: selectedLevelForLesson,
                lessonId,
            });
            if (response.code === 200 || response.code === 201) {
                toast.success("Đã thêm bài học vào cấp độ!");
                setShowAddLessonDialog(false);
                setSelectedLevelForLesson(null);
                loadPath();
            }
        } catch (error) {
            toast.error("Không thể thêm bài học");
        }
    };

    const handleRemoveLessonFromLevel = async (levelOrder: number, lessonId: string) => {
        if (!confirm("Xóa bài học này khỏi cấp độ?")) return;

        try {
            const response = await learningPathAdminService.removeLessonFromPath({
                learningPathId: pathId,
                levelOrder,
                lessonId,
            });
            if (response.code === 200) {
                toast.success("Đã xóa bài học!");
                loadPath();
            }
        } catch (error) {
            toast.error("Không thể xóa bài học");
        }
    };

    const handleEditLevel = (level: any) => {
        setSelectedLevel(level);
        setEditLevelData({ title: level.title });
        setShowEditLevelDialog(true);
    };

    const handleSaveEditLevel = async () => {
        if (!selectedLevel || !editLevelData.title.trim()) {
            toast.error("Level title is required");
            return;
        }

        try {
            const response = await learningPathAdminService.updateLevel(
                pathId,
                selectedLevel.order,
                { title: editLevelData.title.trim() }
            );
            if (response.code === 200) {
                toast.success("Cập nhật cấp độ thành công");
                setShowEditLevelDialog(false);
                loadPath();
            } else {
                toast.error("Failed to update level");
            }
        } catch (error) {
            toast.error("Failed to update level");
        }
    };

    const handleDeleteLevel = (level: any) => {
        setSelectedLevel(level);
        setShowDeleteLevelDialog(true);
    };

    const handleConfirmDeleteLevel = async () => {
        if (!selectedLevel) return;

        try {
            const response = await learningPathAdminService.deleteLevel(
                pathId,
                selectedLevel.order
            );
            if (response.code === 200) {
                toast.success("Xóa cấp độ thành công");
                setShowDeleteLevelDialog(false);
                loadPath();
            } else {
                toast.error("Failed to delete level");
            }
        } catch (error) {
            toast.error("Failed to delete level");
        }
    };

    const handleReorderLevel = async (currentOrder: number, direction: "up" | "down") => {
        if (!pathData?.levels) return;

        const currentIndex = pathData.levels.findIndex((l: any) => l.order === currentOrder);
        if (currentIndex === -1) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= pathData.levels.length) return;

        const newLevelOrders = [...pathData.levels].map((l: any) => l.order);
        [newLevelOrders[currentIndex], newLevelOrders[targetIndex]] = [
            newLevelOrders[targetIndex],
            newLevelOrders[currentIndex],
        ];

        try {
            const response = await learningPathAdminService.reorderLevels(pathId, newLevelOrders);
            if (response.code === 200) {
                toast.success("Đã sắp xếp lại cấp độ");
                loadPath();
            } else {
                toast.error("Failed to reorder levels");
            }
        } catch (error) {
            toast.error("Failed to reorder levels");
        }
    };



    const handleCreateLevel = async () => {
        if (!newLevelTitle.trim()) {
            toast.error("Level title is required");
            return;
        }

        try {
            const response = await learningPathAdminService.createLevel(pathId, {
                title: newLevelTitle.trim(),
            });
            if (response.code === 200) {
                toast.success("Tạo cấp độ thành công");
                setShowCreateLevelDialog(false);
                setNewLevelTitle("");
                loadPath();
            } else {
                toast.error(response.message || "Không thể tạo cấp độ");
            }
        } catch (error) {
            toast.error("Không thể tạo cấp độ");
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };



    if (loadingData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6  mx-auto">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại Lộ trình học
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Chỉnh sửa Lộ trình học
                </h1>
                <p className="text-gray-600">
                    Cập nhật thông tin lộ trình và quản lý cấp độ & bài học
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Path Info */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Thông tin Lộ trình</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tiêu đề Lộ trình <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mục tiêu <span className="text-red-500">*</span>
                                    </label>
                                    {loadingTargets ? (
                                        <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-50">
                                            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                            <span className="text-sm text-gray-600">
                                                Đang tải mục tiêu...
                                            </span>
                                        </div>
                                    ) : (
                                        <select
                                            name="targetId"
                                            value={formData.targetId}
                                            onChange={(e) => {
                                                const selectedTarget = availableTargets.find(
                                                    (t) => t.key === e.target.value
                                                );
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    targetId: e.target.value,
                                                    target: selectedTarget?.value || "",
                                                }));
                                            }}
                                            required
                                            className="w-full px-4 py-2 border rounded-lg"
                                        >
                                            <option value="">Chọn mục tiêu...</option>
                                            {formData.targetId &&
                                                !availableTargets.find(
                                                    (t) => t.key === formData.targetId
                                                ) && (
                                                    <option value={formData.targetId}>
                                                        {formData.target} (Hiện tại)
                                                    </option>
                                                )}
                                            {availableTargets.map((target) => (
                                                <option key={target.key} value={target.key}>
                                                    {target.value}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mã Lộ trình <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="key"
                                        value={formData.key}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cấp độ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg cursor-pointer"
                                    >
                                        <option value="beginner">Sơ cấp</option>
                                        <option value="intermediate">Trung cấp</option>
                                        <option value="advanced">Nâng cao</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trạng thái <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg cursor-pointer"
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border rounded-lg resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Cập nhật Lộ trình
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Levels & Lessons */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold">Cấp độ & Bài học</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Quản lý bài học trong từng cấp độ của lộ trình này
                                </p>
                            </div>
                            <Button onClick={() => setShowCreateLevelDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm Cấp độ
                            </Button>
                        </div>

                        <div className="p-6">
                            {pathData?.levels && pathData.levels.length > 0 ? (
                                <div className="space-y-6">
                                    {pathData.levels.map((level: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="border border-gray-200 rounded-lg overflow-hidden"
                                        >
                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg">
                                                            {level.title || `Cấp độ ${idx + 1}`}
                                                        </h3>
                                                        <p className="text-sm text-blue-100">
                                                            {level.lessons?.length || 0} bài học
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleReorderLevel(level.order, "up")}
                                                            disabled={idx === 0}
                                                            className="p-1 hover:bg-blue-400 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                            title="Di chuyển lên"
                                                        >
                                                            <ChevronUp className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReorderLevel(level.order, "down")}
                                                            disabled={idx === pathData.levels.length - 1}
                                                            className="p-1 hover:bg-blue-400 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                            title="Di chuyển xuống"
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditLevel(level)}
                                                            className="p-1 hover:bg-blue-400 rounded cursor-pointer"
                                                            title="Chỉnh sửa cấp độ"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLevel(level)}
                                                            className="p-1 hover:bg-red-500 rounded cursor-pointer"
                                                            title="Xóa cấp độ"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedLevelForLesson(level.order);
                                                                setLessonSearch("");
                                                                setLessonPage(1);
                                                                setShowAddLessonDialog(true);
                                                            }}
                                                            size="sm"
                                                            className="bg-white text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Thêm Bài học
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                {level.lessons && level.lessons.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {level.lessons.map(
                                                            (lessonInfo: any, lessonIdx: number) => {
                                                                // API returns { lesson: {...}, order } structure
                                                                const lessonData = lessonInfo.lesson || lessonInfo;
                                                                const lessonId = lessonData?._id || lessonInfo._id || lessonInfo;

                                                                return (
                                                                    <div
                                                                        key={lessonIdx}
                                                                        className="group flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                                                    >
                                                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                                            {lessonIdx + 1}
                                                                        </span>
                                                                        <BookOpen className="w-4 h-4 text-gray-600" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm text-gray-900">
                                                                                {lessonData?.title || "Lesson"}
                                                                            </p>
                                                                            {lessonData?.skill && (
                                                                                <p className="text-xs text-gray-500 capitalize">
                                                                                    {lessonData.skill} • {lessonData.level || lessonData.difficulty}
                                                                                    {lessonData.blockCount !== undefined && (
                                                                                        <span className="ml-2 text-blue-600">
                                                                                            • {lessonData.blockCount} khối
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleRemoveLessonFromLevel(
                                                                                    level.order,
                                                                                    lessonId
                                                                                )
                                                                            }
                                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity cursor-pointer"
                                                                            title="Xóa bài học"
                                                                        >
                                                                            <Trash2 className="w-3 h-3 text-red-600" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                                        <p className="text-sm text-gray-500">
                                                            Chưa có bài học trong cấp độ này
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Nhấn "Thêm Bài học" để bắt đầu
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Exam Section */}
                                            <div className="p-4 pt-0">
                                                <div className="border-t border-gray-200 pt-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <FileQuestion className="w-4 h-4" />
                                                            Bài kiểm tra cuối
                                                        </span>
                                                    </div>
                                                    {level.finalQuiz ? (
                                                        <div className="flex items-center justify-between bg-purple-50 rounded-lg p-3 border border-purple-200">
                                                            <div className="flex items-center gap-2">
                                                                <FileQuestion className="w-4 h-4 text-purple-600" />
                                                                <span className="text-sm text-purple-700 font-medium">
                                                                    {level.finalQuiz.title || "Đã gắn bài kiểm tra"}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDetachExam(level.order)}
                                                                className="p-1.5 hover:bg-red-100 rounded text-red-500 transition-colors cursor-pointer"
                                                                title="Xóa Bài kiểm tra"
                                                            >
                                                                <Unlink className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLevelForExam(level.order);
                                                                setExamSearch("");
                                                                setShowExamDialog(true);
                                                            }}
                                                            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors cursor-pointer"
                                                        >
                                                            <Link2 className="w-4 h-4" />
                                                            <span className="text-sm">Gắn Bài kiểm tra cuối</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">
                                        Chưa có cấp độ nào. Cấp độ nên được tạo qua backend.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6 p-6">
                        <h3 className="font-semibold mb-4">Thống kê Lộ trình</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-gray-600">Tổng Cấp độ</span>
                                <span className="font-bold text-blue-600">
                                    {pathData?.levels?.length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span className="text-sm text-gray-600">Tổng Bài học</span>
                                <span className="font-bold text-green-600">
                                    {pathData?.levels?.reduce(
                                        (sum: number, l: any) =>
                                            sum + (l.lessons?.length || 0),
                                        0
                                    ) || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">Trạng thái</span>
                                <span
                                    className={cn(
                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                        formData.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                    )}
                                >
                                    {formData.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Lesson Dialog */}
            <LessonPickerDialog
                open={showAddLessonDialog}
                onClose={() => {
                    setShowAddLessonDialog(false);
                    setSelectedLevelForLesson(null);
                }}
                levelOrder={selectedLevelForLesson}
                lessons={availableLessons}
                loading={loadingLessons}
                search={lessonSearch}
                onSearchChange={setLessonSearch}
                onSelectLesson={handleAddLessonToLevel}
                page={lessonPage}
                totalPages={lessonTotalPages}
                onPageChange={(newPage) => {
                    setLessonPage(newPage);
                    fetchAvailableLessons(newPage, lessonSearch);
                }}
            />

            {/* Level Dialogs */}
            <LevelDialogs
                showCreateDialog={showCreateLevelDialog}
                onCloseCreate={() => setShowCreateLevelDialog(false)}
                newLevelTitle={newLevelTitle}
                onNewLevelTitleChange={setNewLevelTitle}
                onCreateLevel={handleCreateLevel}
                showEditDialog={showEditLevelDialog}
                onCloseEdit={() => setShowEditLevelDialog(false)}
                editLevelTitle={editLevelData.title}
                onEditLevelTitleChange={(title) => setEditLevelData({ title })}
                onSaveEdit={handleSaveEditLevel}
                showDeleteDialog={showDeleteLevelDialog}
                onCloseDelete={() => setShowDeleteLevelDialog(false)}
                levelToDelete={selectedLevel}
                onConfirmDelete={handleConfirmDeleteLevel}
            />

            {/* Exam Picker Dialog */}
            {showExamDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Gắn Bài kiểm tra vào Cấp độ</h2>
                                <p className="text-sm text-gray-500">
                                    Cấp độ {selectedLevelForExam}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowExamDialog(false);
                                    setSelectedLevelForExam(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm bài kiểm tra..."
                                    value={examSearch}
                                    onChange={(e) => setExamSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loadingExams ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                                </div>
                            ) : availableExams.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Không tìm thấy bài kiểm tra
                                </div>
                            ) : (
                                availableExams.map((exam: any) => (
                                    <button
                                        key={exam._id}
                                        onClick={() => handleAttachExam(exam._id)}
                                        className="w-full p-4 text-left bg-gray-50 rounded-lg border hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {exam.title}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                                                        {exam.sections?.length || 0} phần
                                                    </span>
                                                    {exam.totalTimeLimit && (
                                                        <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                                                            {Math.floor(exam.totalTimeLimit / 60)} min
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link2 className="w-5 h-5 text-purple-500" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowExamDialog(false);
                                    setSelectedLevelForExam(null);
                                }}
                                className="w-full"
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
