"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { learningPathAdminService } from "@/services/learningPathAdmin.service";
import { LearningPath } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    GraduationCap,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/components/admin/AdminPagination";

export default function LearningPathsPage() {
    const router = useRouter();
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("all");

    useEffect(() => {
        fetchPaths();
    }, []);

    const fetchPaths = async () => {
        try {
            setLoading(true);
            const response = await learningPathAdminService.getAll();
            if (response.code === 200) {
                setPaths(response.data);
            }
        } catch (error) {
            console.error("Error fetching paths:", error);
            toast.error("Không thể tải lộ trình học");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa lộ trình học này?"))
            return;

        try {
            const response = await learningPathAdminService.delete(id);
            if (response.code === 200) {
                toast.success("Xóa lộ trình học thành công");
                fetchPaths();
            }
        } catch (error) {
            toast.error("Không thể xóa lộ trình học");
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filteredPaths = paths.filter((path) => {
        const matchesSearch = path.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === "all" || path.level?.toLowerCase() === levelFilter;
        return matchesSearch && matchesLevel;
    });

    // Client-side pagination
    const totalPages = Math.ceil(filteredPaths.length / pageSize);
    const paginatedPaths = filteredPaths.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, levelFilter]);

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Quản lý Lộ trình học
                </h1>
                <p className="text-gray-600">
                    Tạo và quản lý các hành trình học tập có cấu trúc
                </p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm lộ trình..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="all">Tất cả cấp độ</option>
                        <option value="beginner">Sơ cấp</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                    </select>
                </div>

                <Button
                    onClick={() => router.push("/admin/learning-paths/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Lộ trình học
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tổng Lộ trình</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {paths.length}
                            </p>
                        </div>
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-green-600">
                                {paths.filter((p) => p.status === "active").length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tổng Cấp độ</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {paths.reduce((sum, p) => sum + (p.levels?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Lộ trình học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Mục tiêu / Mã
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Cấp độ
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Số cấp độ
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
                            ) : paginatedPaths.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                                        <p className="text-lg font-medium text-gray-400">
                                            Không tìm thấy lộ trình học
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPaths.map((path) => (
                                    <tr
                                        key={path._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {path.title}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                    {path.description || "Không có mô tả"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    {typeof path.target === 'object' ? path.target?.name : path.target || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {path.key}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    path.level?.toLowerCase() === "beginner"
                                                        ? "bg-green-100 text-green-700"
                                                        : path.level?.toLowerCase() === "intermediate"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                )}
                                            >
                                                {path.level?.toLowerCase() === "beginner" ? "Sơ cấp" : path.level?.toLowerCase() === "intermediate" ? "Trung cấp" : "Nâng cao"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {path.levels?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    path.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                )}
                                            >
                                                {path.status === "active" ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Hoạt động
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Không hoạt động
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/admin/learning-paths/${path._id}`)
                                                    }
                                                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 cursor-pointer"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(path._id)}
                                                    className="hover:bg-red-50 hover:text-red-700 hover:border-red-300 cursor-pointer"
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
                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredPaths.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    loading={loading}
                />
            </div>
        </div>
    );
}
