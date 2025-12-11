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
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Plus, Edit, Trash2, Search, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadExams();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, statusFilter]);

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

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Exams Management</h1>
                    <p className="text-muted-foreground">Create and manage exams with multiple sections</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/exams/create")}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exam
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Exams</p>
                            <p className="text-2xl font-bold">{total}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600" />
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Status" />
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
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead className="text-center">Sections</TableHead>
                                <TableHead className="text-center">Time Limit</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="space-y-2"><Skeleton className="h-4 w-[200px]" /><Skeleton className="h-3 w-[150px]" /></div></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : exams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                                            <p>No exams found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                exams.map((exam) => (
                                    <TableRow key={exam._id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{exam.title}</span>
                                                {exam.description && (
                                                    <span className="text-sm text-muted-foreground line-clamp-1">
                                                        {exam.description}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                                {exam.sections.length} section{exam.sections.length !== 1 ? "s" : ""}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(exam.totalTimeLimit)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={exam.status === "active" ? "default" : "secondary"}
                                                className={cn(
                                                    exam.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                                        exam.status === "draft" ? "bg-gray-100 text-gray-700 hover:bg-gray-200" :
                                                            "bg-red-100 text-red-700 hover:bg-red-200"
                                                )}
                                            >
                                                {exam.status === "active" ? (
                                                    <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</div>
                                                ) : exam.status === "draft" ? (
                                                    <div className="flex items-center gap-1"><FileText className="w-3 h-3" /> Draft</div>
                                                ) : (
                                                    <div className="flex items-center gap-1"><XCircle className="w-3 h-3" /> {exam.status}</div>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-gray-600">
                                            {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/exams/edit/${exam._id}`)}
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(exam._id)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <AdminPagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={limit}
                    onPageChange={setPage}
                    loading={loading}
                />
            </Card>

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
