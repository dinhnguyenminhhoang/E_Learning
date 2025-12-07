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
        'EASY': { label: 'Easy', className: 'bg-green-100 text-green-700' },
        'MEDIUM': { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
        'HARD': { label: 'Hard', className: 'bg-red-100 text-red-700' },
        'beginner': { label: 'Beginner', className: 'bg-green-100 text-green-700' },
        'intermediate': { label: 'Intermediate', className: 'bg-yellow-100 text-yellow-700' },
        'advanced': { label: 'Advanced', className: 'bg-red-100 text-red-700' },
    };
    return map[difficulty] || { label: difficulty, className: 'bg-gray-100 text-gray-700' };
};

const getStatusDisplay = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
        'active': { label: 'Active', className: 'bg-green-100 text-green-700' },
        'draft': { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
        'archived': { label: 'Archived', className: 'bg-gray-100 text-gray-700' },
        'DRAFT': { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
        'ACTIVE': { label: 'Active', className: 'bg-green-100 text-green-700' },
        'ARCHIVED': { label: 'Archived', className: 'bg-gray-100 text-gray-700' },
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
            console.error("Error fetching quizzes:", error);
            toast.error("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const response = await quizAdminService.delete(id);
            if (response.code === 200) {
                toast.success("Quiz deleted successfully");
                fetchQuizzes();
            }
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Quizzes Management
                </h1>
                <p className="text-gray-600">Create and manage assessment quizzes</p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search quizzes..."
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
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <Button
                    onClick={() => router.push("/admin/quizzes/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Quiz
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
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
                            <p className="text-sm text-gray-600 mb-1">Active</p>
                            <p className="text-2xl font-bold text-green-600">
                                {quizzes.filter((q) => q.status === "active").length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total XP</p>
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
                                    Skill
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Difficulty
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Questions
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    XP Reward
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
                                            No quizzes found
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
                                                            Attached to: {quiz.attachedTo.kind}
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
                                Showing{" "}
                                <span className="font-medium">
                                    {(pagination.pageNum - 1) * pagination.pageSize + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        pagination.pageNum * pagination.pageSize,
                                        pagination.total
                                    )}
                                </span>{" "}
                                of <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => fetchQuizzes(pagination.pageNum - 1)}
                                disabled={pagination.pageNum === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => fetchQuizzes(pagination.pageNum + 1)}
                                disabled={pagination.pageNum === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
