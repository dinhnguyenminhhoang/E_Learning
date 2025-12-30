"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSpeakingTemplateService } from "@/services/adminSpeakingTemplate.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Mic,
    Type,
    MessageSquare,
    Database,
    Sparkles,
    Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPagination } from "@/components/admin/AdminPagination";

interface FormData {
    text: string;
    textVi: string;
    level: "easy" | "medium" | "hard";
    type: "word" | "sentence";
    category: string;
}

const defaultFormData: FormData = {
    text: "",
    textVi: "",
    level: "easy",
    type: "sentence",
    category: "",
};

export default function SpeakingTemplatesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [aiFormData, setAiFormData] = useState({
        count: 10,
        level: "medium" as "easy" | "medium" | "hard",
        type: "sentence" as "word" | "sentence",
    });
    const pageSize = 15;

    const { data: templatesData, isLoading } = useQuery({
        queryKey: ["speaking-templates", searchQuery, levelFilter, typeFilter, currentPage],
        queryFn: async () => {
            const params: any = {
                page: currentPage,
                limit: pageSize,
            };
            if (levelFilter !== "all") params.level = levelFilter;
            if (typeFilter !== "all") params.type = typeFilter;

            return await adminSpeakingTemplateService.getAll(params);
        },
    });

    const { data: stats } = useQuery({
        queryKey: ["speaking-templates-stats"],
        queryFn: () => adminSpeakingTemplateService.getStats(),
    });

    const createMutation = useMutation({
        mutationFn: (data: FormData) => adminSpeakingTemplateService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["speaking-templates"] });
            queryClient.invalidateQueries({ queryKey: ["speaking-templates-stats"] });
            toast.success("Tạo mẫu thành công!");
            setIsCreateOpen(false);
            setFormData(defaultFormData);
        },
        onError: () => {
            toast.error("Không thể tạo mẫu");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
            adminSpeakingTemplateService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["speaking-templates"] });
            toast.success("Cập nhật thành công!");
            setEditingId(null);
            setFormData(defaultFormData);
        },
        onError: () => {
            toast.error("Không thể cập nhật");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminSpeakingTemplateService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["speaking-templates"] });
            queryClient.invalidateQueries({ queryKey: ["speaking-templates-stats"] });
            toast.success("Xóa thành công!");
            setDeleteId(null);
        },
        onError: () => {
            toast.error("Không thể xóa");
        },
    });

    const seedMutation = useMutation({
        mutationFn: () => adminSpeakingTemplateService.seedTemplates(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["speaking-templates"] });
            queryClient.invalidateQueries({ queryKey: ["speaking-templates-stats"] });
            toast.success(`Đã seed ${data.count} mẫu luyện nói thành công!`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể seed data");
        },
    });

    const aiGenerateMutation = useMutation({
        mutationFn: (params: { count: number; level: string; type: string }) =>
            adminSpeakingTemplateService.aiGenerate(params),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["speaking-templates"] });
            queryClient.invalidateQueries({ queryKey: ["speaking-templates-stats"] });
            toast.success(`AI đã tạo ${data.count} mẫu thành công!`);
            setIsAiDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể tạo bằng AI");
        },
    });

    const handleEdit = (template: any) => {
        setFormData({
            text: template.text,
            textVi: template.textVi || "",
            level: template.level,
            type: template.type,
            category: template.category || "",
        });
        setEditingId(template._id);
    };

    const handleSubmit = () => {
        if (!formData.text.trim()) {
            toast.error("Vui lòng nhập nội dung");
            return;
        }

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const levels = ["easy", "medium", "hard"];
    const types = ["word", "sentence"];
    const templates = templatesData?.data || [];
    const pagination = templatesData?.pagination || { total: 0, page: 1, limit: pageSize, totalPages: 0 };

    const getLevelBadge = (level: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            easy: "default",
            medium: "secondary",
            hard: "destructive",
        };
        const labels: Record<string, string> = {
            easy: "Dễ",
            medium: "Trung bình",
            hard: "Khó",
        };
        return <Badge variant={variants[level]}>{labels[level]}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        return (
            <Badge variant="outline" className="gap-1">
                {type === "word" ? <Type className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                {type === "word" ? "Từ" : "Câu"}
            </Badge>
        );
    };

    const filteredTemplates = searchQuery
        ? templates.filter((t: any) =>
            t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.textVi?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : templates;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Mic className="h-8 w-8 text-blue-500" />
                        Quản lý Mẫu Luyện Nói
                    </h1>
                    <p className="text-gray-500">Quản lý các từ và câu mẫu cho luyện nói</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mẫu
                    </Button>
                    <Button
                        onClick={() => setIsAiDialogOpen(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        {aiGenerateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                AI đang tạo...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                AI Generate
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending || (stats?.total || 0) > 0}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                        {seedMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang seed...
                            </>
                        ) : (
                            <>
                                <Database className="mr-2 h-4 w-4" />
                                Seed 100 Mẫu
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-gray-500">Tổng số</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.byLevel?.easy || 0}</div>
                        <div className="text-sm text-gray-500">Dễ</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.byLevel?.medium || 0}</div>
                        <div className="text-sm text-gray-500">Trung bình</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.byLevel?.hard || 0}</div>
                        <div className="text-sm text-gray-500">Khó</div>
                    </Card>
                    <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {stats.byType?.word || 0} / {stats.byType?.sentence || 0}
                        </div>
                        <div className="text-sm text-gray-500">Từ / Câu</div>
                    </Card>
                </div>
            )}

            <Card className="p-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả độ khó" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả độ khó</SelectItem>
                            <SelectItem value="easy">Dễ</SelectItem>
                            <SelectItem value="medium">Trung bình</SelectItem>
                            <SelectItem value="hard">Khó</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả loại" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            <SelectItem value="word">Từ vựng</SelectItem>
                            <SelectItem value="sentence">Câu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Nội dung</TableHead>
                            <TableHead className="w-[25%]">Nghĩa tiếng Việt</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Độ khó</TableHead>
                            <TableHead>Chủ đề</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : filteredTemplates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Không tìm thấy mẫu nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTemplates.map((template: any) => (
                                <TableRow key={template._id}>
                                    <TableCell className="font-medium">{template.text}</TableCell>
                                    <TableCell className="text-gray-600">{template.textVi || "-"}</TableCell>
                                    <TableCell>{getTypeBadge(template.type)}</TableCell>
                                    <TableCell>{getLevelBadge(template.level)}</TableCell>
                                    <TableCell>
                                        {template.category && (
                                            <Badge variant="outline">{template.category}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(template)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(template._id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    loading={isLoading}
                />
            </Card>

            <Dialog
                open={isCreateOpen || !!editingId}
                onOpenChange={() => {
                    setIsCreateOpen(false);
                    setEditingId(null);
                    setFormData(defaultFormData);
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Chỉnh sửa mẫu" : "Thêm mẫu mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingId ? "Cập nhật thông tin mẫu luyện nói" : "Thêm từ hoặc câu mới để luyện nói"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="text">Nội dung (English) *</Label>
                            <Input
                                id="text"
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder="Hello, how are you?"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="textVi">Nghĩa tiếng Việt</Label>
                            <Input
                                id="textVi"
                                value={formData.textVi}
                                onChange={(e) => setFormData({ ...formData, textVi: e.target.value })}
                                placeholder="Xin chào, bạn khỏe không?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Loại</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="word">Từ vựng</SelectItem>
                                        <SelectItem value="sentence">Câu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Độ khó</Label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(v) => setFormData({ ...formData, level: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Dễ</SelectItem>
                                        <SelectItem value="medium">Trung bình</SelectItem>
                                        <SelectItem value="hard">Khó</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Chủ đề</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="Greetings, Travel, Work..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateOpen(false);
                                setEditingId(null);
                                setFormData(defaultFormData);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingId ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Generation Dialog */}
            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            AI Generate Templates
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-purple-800">
                                Sử dụng GPT để tự động tạo speaking templates (từ vựng và câu) chất lượng cao.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-count">Số lượng templates (1-20)</Label>
                            <Input
                                id="ai-count"
                                type="number"
                                min={1}
                                max={20}
                                value={aiFormData.count}
                                onChange={(e) => setAiFormData({ ...aiFormData, count: parseInt(e.target.value) || 1 })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-level">Level</Label>
                            <Select
                                value={aiFormData.level}
                                onValueChange={(value: any) => setAiFormData({ ...aiFormData, level: value })}
                            >
                                <SelectTrigger id="ai-level">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy (A1-A2)</SelectItem>
                                    <SelectItem value="medium">Medium (B1-B2)</SelectItem>
                                    <SelectItem value="hard">Hard (B2-C1)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-type">Type</Label>
                            <Select
                                value={aiFormData.type}
                                onValueChange={(value: any) => setAiFormData({ ...aiFormData, type: value })}
                            >
                                <SelectTrigger id="ai-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="word">Word (Từ vựng)</SelectItem>
                                    <SelectItem value="sentence">Sentence (Câu)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAiDialogOpen(false)}
                            disabled={aiGenerateMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={() => aiGenerateMutation.mutate(aiFormData)}
                            disabled={aiGenerateMutation.isPending}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            {aiGenerateMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo bằng AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Tạo ngay
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa mẫu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa mẫu này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
