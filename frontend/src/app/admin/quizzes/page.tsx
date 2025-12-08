"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quizAdminService } from "@/services/quizAdmin.service";
import { Quiz } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    HelpCircle,
    Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const getDifficultyDisplay = (difficulty: string) => {
    const map: Record<string, { label: string; className: string }> = {
        'EASY': { label: 'Dễ', className: 'bg-green-100 text-green-700' },
        'MEDIUM': { label: 'Trung bình', className: 'bg-yellow-100 text-yellow-700' },
        'HARD': { label: 'Khó', className: 'bg-red-100 text-red-700' },
        'beginner': { label: 'Cơ bản', className: 'bg-green-100 text-green-700' },
        'intermediate': { label: 'Trung cấp', className: 'bg-yellow-100 text-yellow-700' },
        'advanced': { label: 'Nâng cao', className: 'bg-red-100 text-red-700' },
    };
    return map[difficulty] || { label: difficulty, className: 'bg-gray-100 text-gray-700' };
};

const getStatusDisplay = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
        'active': { label: 'Đang hoạt động', className: 'bg-green-100 text-green-700' },
        'draft': { label: 'Nháp', className: 'bg-yellow-100 text-yellow-700' },
        'archived': { label: 'Lưu trữ', className: 'bg-gray-100 text-gray-700' },
        'DRAFT': { label: 'Nháp', className: 'bg-yellow-100 text-yellow-700' },
        'ACTIVE': { label: 'Đang hoạt động', className: 'bg-green-100 text-green-700' },
        'ARCHIVED': { label: 'Lưu trữ', className: 'bg-gray-100 text-gray-700' },
    };
    return map[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
};

export default function QuizzesPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [pagination, setPagination] = useState({
        pageNum: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuizzes(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    const fetchQuizzes = async (page = pagination.pageNum) => {
        try {
            setLoading(true);
            const response = await quizAdminService.getAll({
                search: searchTerm,
                status: statusFilter !== "all" ? statusFilter : undefined,
                pageNum: page,
                pageSize: pagination.pageSize,
            });
            if (response.code === 200) {
                setQuizzes(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error("Lỗi tải quiz:", error);
            toast.error("Không thể tải danh sách quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa quiz này?")) return;

        try {
            const response = await quizAdminService.delete(id);
            if (response.code === 200) {
                toast.success("Đã xóa quiz thành công");
                fetchQuizzes();
            }
        } catch (error) {
            toast.error("Không thể xóa quiz");
        }
    };

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Quản lý Quiz
                </h1>
                <p className="text-gray-600">Tạo và quản lý các bài kiểm tra</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm quiz..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="draft">Nháp</option>
                        <option value="archived">Lưu trữ</option>
                    </select>
                </div>

                <Button
                    onClick={() => router.push("/admin/quizzes/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Quiz
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
                            <p className="text-sm text-gray-600 mb-1">Tổng số Quiz</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {quizzes.length}
                            </p>
                        </div>
                        <HelpCircle className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-green-600">
                                {quizzes.filter((q) => q.status === "active").length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tổng số câu hỏi</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tổng XP</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {quizzes.reduce((sum, q) => sum + (q.xpReward || 0), 0)}
                            </p>
                        </div>
                        <Award className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Quiz
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Kỹ năng
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Độ khó
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Số câu hỏi
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    XP thưởng
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
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                                        </div>
                                    </td>
                                </tr>
                            ) : quizzes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                                        <p className="text-lg font-medium text-gray-400">
                                            Không tìm thấy quiz
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                quizzes.map((quiz) => {
                                    const diffDisplay = getDifficultyDisplay(quiz.difficulty);
                                    const statusDisplay = getStatusDisplay(quiz.status);
                                    return (
                                        <tr
                                            key={quiz._id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {quiz.title}
                                                    </p>
                                                    {quiz.attachedTo && (
                                                        <p className="text-xs text-gray-500">
                                                            Gắn với: {quiz.attachedTo.kind}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700 capitalize">
                                                    {quiz.skill || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                        diffDisplay.className
                                                    )}
                                                >
                                                    {diffDisplay.label}
                                                </span>
                                            </td>
                                                <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {quiz.questions?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1 text-sm text-orange-600 font-medium">
                                                    <Award className="w-4 h-4" />
                                                    {quiz.xpReward || 0} XP
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                        statusDisplay.className
                                                    )}
                                                >
                                                    {statusDisplay.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.push(`/admin/quizzes/${quiz._id}`)
                                                        }
                                                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(quiz._id)}
                                                        className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm mt-4">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Hiển thị{" "}
                                <span className="font-medium">
                                    {(pagination.pageNum - 1) * pagination.pageSize + 1}
                                </span>{" "}
                                đến{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        pagination.pageNum * pagination.pageSize,
                                        pagination.total
                                    )}
                                </span>{" "}
                                trong tổng số{" "}
                                <span className="font-medium">{pagination.total}</span> kết quả
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => fetchQuizzes(pagination.pageNum - 1)}
                                disabled={pagination.pageNum === 1}
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => fetchQuizzes(pagination.pageNum + 1)}
                                disabled={pagination.pageNum === pagination.totalPages}
                            >
                                Tiếp
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
