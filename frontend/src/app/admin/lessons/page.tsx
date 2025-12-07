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
            console.error("Error fetching lessons:", error);
            toast.error("Failed to load lessons");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;

        try {
            const response = await lessonService.delete(id);
            if (response.code === 200) {
                toast.success("Lesson deleted successfully");
                fetchLessons();
            }
        } catch (error) {
            toast.error("Failed to delete lesson");
        }
    };

    const displayLessons = lessons;

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Lessons Management
                </h1>
                <p className="text-gray-600">Create and manage lesson content</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search lessons..."
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
                        <option value="all">All Skills</option>
                        <option value="reading">Reading</option>
                        <option value="writing">Writing</option>
                        <option value="listening">Listening</option>
                        <option value="speaking">Speaking</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <Button
                    onClick={() => router.push("/admin/lessons/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
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
                            <p className="text-sm text-gray-600 mb-1">Published</p>
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
                            <p className="text-sm text-gray-600 mb-1">Drafts</p>
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
                            <p className="text-sm text-gray-600 mb-1">Total Blocks</p>
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
                                    Lesson
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Topic/Skill
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Difficulty
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Blocks
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Actions
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
                                                    {lesson.description || "No description"}
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
                                                {lesson.status}
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
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t pt-4 px-6">
                        <div className="text-sm text-gray-600">
                            Showing page {currentPage} of {pagination.totalPages} ({pagination.total} total lessons)
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show first, last, current, and pages around current
                                    return page === 1 ||
                                        page === pagination!.totalPages ||
                                        Math.abs(page - currentPage) <= 1;
                                })
                                .map((page, idx, arr) => {
                                    // Add ellipsis if there's a gap
                                    const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                                    return (
                                        <div key={page} className="flex items-center gap-2">
                                            {showEllipsisBefore && <span className="px-2 text-gray-400">...</span>}
                                            <Button
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className={page === currentPage ? "bg-blue-600 text-white" : ""}
                                            >
                                                {page}
                                            </Button>
                                        </div>
                                    );
                                })}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(pagination!.totalPages, prev + 1))}
                                disabled={currentPage === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
