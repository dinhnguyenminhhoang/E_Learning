"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lessonService } from "@/services/lesson.service";
import { Lesson } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    FileText,
    Video,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    Grid,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { STATUS } from "@/constants/status";
import { AdminPagination } from "@/components/admin/AdminPagination";

const SKILL_COLORS = {
    reading: "bg-blue-100 text-blue-700 border-blue-200",
    writing: "bg-purple-100 text-purple-700 border-purple-200",
    listening: "bg-green-100 text-green-700 border-green-200",
    speaking: "bg-orange-100 text-orange-700 border-orange-200",
};

const DIFFICULTY_COLORS = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
};

export default function LessonsPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [skillFilter, setSkillFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState<{
        total: number;
        totalPages: number;
    } | null>(null);

    useEffect(() => {
        fetchLessons();
    }, [currentPage, searchTerm, skillFilter, statusFilter]);

    // Reset to page 1 when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, skillFilter, statusFilter]);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const response = await lessonService.getAll({
                pageNum: currentPage,
                pageSize,
                search: searchTerm,
                skill: skillFilter,
                status: statusFilter,
            });
            if (response.code === 200) {
                setLessons(response.data);
                if (response.pagination) {
                    setPagination({
                        total: response.pagination.total,
                        totalPages: response.pagination.totalPages,
                    });
                }
            }
        } catch (error) {
            console.error("Lỗi tải bài học:", error);
            toast.error("Không thể tải danh sách bài học");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;

        try {
            const response = await lessonService.delete(id);
            if (response.code === 200) {
                toast.success("Đã xóa bài học thành công");
                fetchLessons();
            }
        } catch (error) {
            toast.error("Không thể xóa bài học");
        }
    };

    const displayLessons = lessons;

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Quản lý bài học
                </h1>
                <p className="text-gray-600">Tạo và quản lý nội dung bài học</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm bài học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <select
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tất cả kỹ năng</option>
                        <option value="reading">Đọc</option>
                        <option value="writing">Viết</option>
                        <option value="listening">Nghe</option>
                        <option value="speaking">Nói</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Nháp</option>
                        <option value="archived">Lưu trữ</option>
                    </select>
                </div>

                <Button
                    onClick={() => router.push("/admin/lessons/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm bài học
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push("/admin/blocks")}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                    Quản lý nội dung bài học
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tổng số bài học</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {lessons?.length || 0}
                            </p>
                        </div>
                        <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Đã xuất bản</p>
                            <p className="text-2xl font-bold text-green-600">
                                {(lessons || []).filter((l) => l.status === STATUS.ACTIVE).length}
                            </p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Nháp</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {(lessons || []).filter((l) => l.status === STATUS.DRAFT).length}
                            </p>
                        </div>
                        <FileText className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tổng số block</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {(lessons || []).reduce((sum, l) => sum + (l.blocks?.length || 0), 0)}
                            </p>
                        </div>
                        <Grid className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Bài học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Chủ đề / Kỹ năng
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Độ khó
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Số block
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                                        </div>
                                    </td>
                                </tr>
                            ) : displayLessons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-gray-500">
                                            No lessons found matching your criteria
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                displayLessons.map((lesson) => (
                                    <tr
                                        key={lesson._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {lesson.title}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                    {lesson.description || "Chưa có mô tả"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">{lesson.topic}</p>
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium border",
                                                        SKILL_COLORS[lesson.skill]
                                                    )}
                                                >
                                                    {lesson.skill}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    DIFFICULTY_COLORS[lesson.difficulty]
                                                )}
                                            >
                                                {lesson.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {lesson.blocks?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    lesson.status === STATUS.ACTIVE
                                                        ? "bg-green-100 text-green-700"
                                                        : lesson.status === STATUS.DRAFT
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-700"
                                                )}
                                            >
                                                {lesson.status === STATUS.ACTIVE
                                                    ? "Đã xuất bản"
                                                    : lesson.status === STATUS.DRAFT
                                                        ? "Nháp"
                                                        : "Lưu trữ"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/admin/lessons/${lesson._id}`)
                                                    }
                                                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(lesson._id)}
                                                    className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {pagination && (
                    <AdminPagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}
