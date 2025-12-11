"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { blockService } from "@/services/block.service";
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
    Brain,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/components/admin/AdminPagination";

const TYPE_ICONS: Record<string, any> = {
    vocabulary: BookOpen,
    grammar: Brain,
    quiz: FileText,
    media: Video,
};

const TYPE_COLORS: Record<string, string> = {
    vocabulary: "bg-blue-100 text-blue-700 border-blue-200",
    grammar: "bg-purple-100 text-purple-700 border-purple-200",
    quiz: "bg-green-100 text-green-700 border-green-200",
    media: "bg-orange-100 text-orange-700 border-orange-200",
};

const SKILL_COLORS: Record<string, string> = {
    reading: "bg-blue-100 text-blue-700",
    writing: "bg-purple-100 text-purple-700",
    listening: "bg-green-100 text-green-700",
    speaking: "bg-orange-100 text-orange-700",
};

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
};

export default function BlocksPage() {
    const router = useRouter();
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [skillFilter, setSkillFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pageNum, setPageNum] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    useEffect(() => {
        fetchBlocks();
    }, [searchTerm, typeFilter, skillFilter, statusFilter, pageNum]);

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            const filters: any = { pageNum, pageSize };
            if (searchTerm) filters.search = searchTerm;
            if (typeFilter !== "all") filters.type = typeFilter;
            if (skillFilter !== "all") filters.skill = skillFilter;
            if (statusFilter !== "all") filters.status = statusFilter;

            const response = await blockService.getAllBlocks(filters);
            if ((response as any).code === 200) {
                setBlocks((response as any).data || []);
                setTotal((response as any).pagination?.total || 0);
            }
        } catch (error) {
            console.error("Error fetching blocks:", error);
            toast.error("Không thể tải danh sách block");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa block này?")) return;

        try {
            const response = await blockService.deleteBlock(id);
            if ((response as any).code === 200) {
                toast.success("Xóa block thành công");
                fetchBlocks();
            }
        } catch (error) {
            toast.error("Không thể xóa block");
        }
    };

    const typeCount = (type: string) =>
        blocks.filter((b) => b.type === type).length;

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Quản lý Block
                </h1>
                <p className="text-gray-600">Quản lý tất cả các block nội dung trong bài học</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm block..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPageNum(1);
                            }}
                            className="pl-10 cursor-pointer"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPageNum(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="vocabulary">Vocabulary</option>
                        <option value="grammar">Grammar</option>
                        <option value="quiz">Quiz</option>
                        <option value="media">Media</option>
                    </select>

                    <select
                        value={skillFilter}
                        onChange={(e) => {
                            setSkillFilter(e.target.value);
                            setPageNum(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="all">Tất cả kỹ năng</option>
                        <option value="reading">Reading</option>
                        <option value="writing">Writing</option>
                        <option value="listening">Listening</option>
                        <option value="speaking">Speaking</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPageNum(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <Button
                    onClick={() => router.push("/admin/blocks/create")}
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Block
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {["vocabulary", "grammar", "quiz", "media"].map((type) => {
                    const Icon = TYPE_ICONS[type];
                    return (
                        <div
                            key={type}
                            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 capitalize">
                                        {type}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {typeCount(type)}
                                    </p>
                                </div>
                                <Icon className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Block
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Loại
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Kỹ năng
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Độ khó
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Bài học
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
                            ) : blocks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                                        <p className="text-lg font-medium text-gray-400">
                                            Không tìm thấy block nào
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                blocks.map((block) => (
                                    <tr
                                        key={block._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {block.title || "Chưa có tiêu đề"}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                    {block.description || "Không có mô tả"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border",
                                                    TYPE_COLORS[block.type]
                                                )}
                                            >
                                                {block.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    SKILL_COLORS[block.skill]
                                                )}
                                            >
                                                {block.skill}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    DIFFICULTY_COLORS[block.difficulty]
                                                )}
                                            >
                                                {block.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {typeof block.lessonId === "object" && block.lessonId ? (
                                                <span className="text-sm text-gray-700">
                                                    {block.lessonId.title}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">
                                                    Chưa gán
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/admin/blocks/${block._id}`)
                                                    }
                                                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 cursor-pointer"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(block._id)}
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
                    currentPage={pageNum}
                    totalPages={Math.ceil(total / pageSize)}
                    totalItems={total}
                    pageSize={pageSize}
                    onPageChange={setPageNum}
                    loading={loading}
                />
            </div>
        </div>
    );
}
