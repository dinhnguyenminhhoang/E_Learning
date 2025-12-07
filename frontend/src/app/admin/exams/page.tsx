"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { examService, Exam } from "@/services/exam.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

export default function ExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<string | null>(null);

    // Pagination & filters
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const loadExams = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit };

            if (search) params.search = search;
            if (statusFilter && statusFilter !== "all") params.status = statusFilter;

            const response = await examService.getExams(params);

            if (response.code === 200) {
                setExams(response.data.exams);
                setTotal(response.data.pagination.total);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error: any) {
            console.error("Error loading exams:", error);
            toast.error("Failed to load exams");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, [page, search, statusFilter]);

    const handleDelete = async () => {
        if (!examToDelete) return;

        try {
            const response = await examService.deleteExam(examToDelete);

            if (response.code === 200) {
                toast.success("Exam deleted successfully");
                loadExams();
            }
        } catch (error: any) {
            console.error("Error deleting exam:", error);
            toast.error(error?.response?.data?.message || "Failed to delete exam");
        } finally {
            setDeleteDialogOpen(false);
            setExamToDelete(null);
        }
    };

    const openDeleteDialog = (examId: string) => {
        setExamToDelete(examId);
        setDeleteDialogOpen(true);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500">Active</Badge>;
            case "draft":
                return <Badge className="bg-gray-500">Draft</Badge>;
            case "deleted":
                return <Badge className="bg-red-500">Deleted</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="p-8 mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Exams Management</h1>
                    <p className="text-gray-600 mt-1">Create and manage exams with multiple sections</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/exams/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exam
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search exams..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No exams found. Create your first exam to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Sections</TableHead>
                                    <TableHead>Time Limit</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.map((exam) => (
                                    <TableRow key={exam._id}>
                                        <TableCell className="font-medium">
                                            {exam.title}
                                            {exam.description && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {exam.description.substring(0, 60)}
                                                    {exam.description.length > 60 ? "..." : ""}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {exam.sections.length} section{exam.sections.length !== 1 ? "s" : ""}
                                        </TableCell>
                                        <TableCell>{formatTime(exam.totalTimeLimit)}</TableCell>
                                        <TableCell>{getStatusBadge(exam.status)}</TableCell>
                                        <TableCell>
                                            {exam.createdAt
                                                ? new Date(exam.createdAt).toLocaleDateString()
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/admin/exams/edit/${exam._id}`)
                                                    }
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(exam._id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} exams
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <Button
                                        key={i}
                                        variant={page === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPage(pageNum)}
                                        className="w-8"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this exam? This action cannot be undone.
                            {" "}The exam will be marked as deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
