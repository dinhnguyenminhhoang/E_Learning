"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Loader2, Database, RefreshCw, Plus, Edit, Trash2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiClient } from "@/config/api.config";
import adminWritingTemplateService, { CreateTemplateData } from "@/services/adminWritingTemplate.service";

interface WritingTemplate {
    _id: string;
    title: string;
    titleVi?: string;
    prompt: string;
    promptVi?: string;
    level: "easy" | "medium" | "hard";
    type: "essay" | "email" | "story" | "description" | "opinion";
    category?: string;
    minWords: number;
    maxWords: number;
    sampleAnswer?: string;
    hints?: string[];
    order: number;
}

interface Stats {
    total: number;
    byLevel: {
        easy: number;
        medium: number;
        hard: number;
    };
    byType: {
        essay: number;
        email: number;
        story: number;
        description: number;
        opinion: number;
    };
}

export default function WritingTemplatesAdminPage() {
    const [templates, setTemplates] = useState<WritingTemplate[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Dialog states
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WritingTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<WritingTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form states
    const [formData, setFormData] = useState<CreateTemplateData>({
        title: "",
        titleVi: "",
        prompt: "",
        promptVi: "",
        level: "easy",
        type: "essay",
        category: "",
        minWords: 100,
        maxWords: 300,
        sampleAnswer: "",
        hints: [],
        order: 0,
    });

    // AI Generation states
    const [aiFormData, setAiFormData] = useState({
        count: 5,
        level: "medium" as "easy" | "medium" | "hard",
        type: "essay" as "essay" | "email" | "story" | "description" | "opinion",
    });

    useEffect(() => {
        loadTemplates();
        loadStats();
    }, [page]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const result = await adminWritingTemplateService.getAll({ page, limit: 20 });
            setTemplates(result.data || []);
            setTotalPages(result.pagination?.totalPages || 1);
        } catch (error) {
            console.error("Error loading templates:", error);
            toast.error("Không thể tải danh sách templates");
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await apiClient.get("/v1/api/writing-templates/stats");
            setStats(response.metadata);
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const handleSeedData = async () => {
        try {
            setSeeding(true);
            const response = await apiClient.post("/v1/api/writing-templates/seed");

            if (response.code === 200) {
                toast.success(`Đã seed ${response.metadata?.count || 100} writing templates thành công!`);
                await loadTemplates();
                await loadStats();
            } else {
                toast.error(response.message || "Seed thất bại");
            }
        } catch (error: any) {
            console.error("Error seeding data:", error);
            toast.error(error?.response?.data?.message || "Không thể seed data");
        } finally {
            setSeeding(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setEditingTemplate(null);
        setFormData({
            title: "",
            titleVi: "",
            prompt: "",
            promptVi: "",
            level: "easy",
            type: "essay",
            category: "",
            minWords: 100,
            maxWords: 300,
            sampleAnswer: "",
            hints: [],
            order: 0,
        });
        setIsFormDialogOpen(true);
    };

    const handleOpenEditDialog = (template: WritingTemplate) => {
        setEditingTemplate(template);
        setFormData({
            title: template.title,
            titleVi: template.titleVi || "",
            prompt: template.prompt,
            promptVi: template.promptVi || "",
            level: template.level,
            type: template.type,
            category: template.category || "",
            minWords: template.minWords,
            maxWords: template.maxWords,
            sampleAnswer: template.sampleAnswer || "",
            hints: template.hints || [],
            order: template.order,
        });
        setIsFormDialogOpen(true);
    };

    const handleCloseFormDialog = () => {
        setIsFormDialogOpen(false);
        setEditingTemplate(null);
    };

    const handleSaveTemplate = async () => {
        if (!formData.title.trim() || !formData.prompt.trim()) {
            toast.error("Title và Prompt là bắt buộc");
            return;
        }

        try {
            setIsSaving(true);
            if (editingTemplate) {
                await adminWritingTemplateService.update(editingTemplate._id, formData);
                toast.success("Cập nhật template thành công");
            } else {
                await adminWritingTemplateService.create(formData);
                toast.success("Tạo template thành công");
            }
            handleCloseFormDialog();
            await loadTemplates();
            await loadStats();
        } catch (error: any) {
            console.error("Error saving template:", error);
            toast.error(error?.response?.data?.message || "Không thể lưu template");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDeleteDialog = (template: WritingTemplate) => {
        setDeletingTemplate(template);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setDeletingTemplate(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingTemplate) return;

        try {
            await adminWritingTemplateService.delete(deletingTemplate._id);
            toast.success("Xóa template thành công");
            handleCloseDeleteDialog();
            await loadTemplates();
            await loadStats();
        } catch (error: any) {
            console.error("Error deleting template:", error);
            toast.error(error?.response?.data?.message || "Không thể xóa template");
        }
    };

    const handleOpenAiDialog = () => {
        setIsAiDialogOpen(true);
    };

    const handleCloseAiDialog = () => {
        setIsAiDialogOpen(false);
    };

    const handleAiGenerate = async () => {
        try {
            setIsGenerating(true);
            const result = await adminWritingTemplateService.aiGenerate(aiFormData);
            toast.success(`AI đã tạo ${result.count} templates thành công!`);
            handleCloseAiDialog();
            await loadTemplates();
            await loadStats();
        } catch (error: any) {
            console.error("Error generating templates:", error);
            toast.error(error?.response?.data?.message || "Không thể tạo templates bằng AI");
        } finally {
            setIsGenerating(false);
        }
    };

    const getLevelBadgeColor = (level: string) => {
        switch (level) {
            case "easy":
                return "bg-green-100 text-green-700";
            case "medium":
                return "bg-yellow-100 text-yellow-700";
            case "hard":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case "essay":
                return "bg-blue-100 text-blue-700";
            case "email":
                return "bg-purple-100 text-purple-700";
            case "story":
                return "bg-pink-100 text-pink-700";
            case "description":
                return "bg-indigo-100 text-indigo-700";
            case "opinion":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <PenTool className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Writing Templates Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý các chủ đề luyện viết
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleOpenCreateDialog}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo mới
                        </Button>
                        <Button
                            onClick={handleOpenAiDialog}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Generate
                        </Button>
                        <Button
                            onClick={handleSeedData}
                            disabled={seeding || (stats?.total || 0) > 0}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                        >
                            {seeding ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang seed...
                                </>
                            ) : (
                                <>
                                    <Database className="w-4 h-4 mr-2" />
                                    Seed 100 Templates
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                loadTemplates();
                                loadStats();
                            }}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Tổng số Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Theo Level
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Easy:</span>
                                    <span className="font-semibold">{stats.byLevel.easy}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-yellow-600">Medium:</span>
                                    <span className="font-semibold">{stats.byLevel.medium}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Hard:</span>
                                    <span className="font-semibold">{stats.byLevel.hard}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Theo Type (1/2)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600">Essay:</span>
                                    <span className="font-semibold">{stats.byType.essay}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-purple-600">Email:</span>
                                    <span className="font-semibold">{stats.byType.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-pink-600">Story:</span>
                                    <span className="font-semibold">{stats.byType.story}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Theo Type (2/2)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-indigo-600">Description:</span>
                                    <span className="font-semibold">{stats.byType.description}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-600">Opinion:</span>
                                    <span className="font-semibold">{stats.byType.opinion}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Templates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Templates</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12">
                            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                                Chưa có templates nào. Hãy seed dữ liệu mẫu!
                            </p>
                            <Button
                                onClick={handleSeedData}
                                disabled={seeding}
                                className="bg-gradient-to-r from-blue-500 to-purple-500"
                            >
                                {seeding ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang seed...
                                    </>
                                ) : (
                                    <>
                                        <Database className="w-4 h-4 mr-2" />
                                        Seed 100 Templates Ngay
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[350px]">Title</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Words</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.map((template) => (
                                        <TableRow key={template._id}>
                                            <TableCell className="font-medium">
                                                {template.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getLevelBadgeColor(template.level)}>
                                                    {template.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getTypeBadgeColor(template.type)}>
                                                    {template.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {template.category || "-"}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {template.minWords} - {template.maxWords}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEditDialog(template)}
                                                        className="hover:bg-blue-50"
                                                    >
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDeleteDialog(template)}
                                                        className="hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? "Chỉnh sửa Template" : "Tạo Template mới"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title (EN) *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter title in English"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="titleVi">Title (VI)</Label>
                                <Input
                                    id="titleVi"
                                    value={formData.titleVi}
                                    onChange={(e) => setFormData({ ...formData, titleVi: e.target.value })}
                                    placeholder="Nhập tiêu đề tiếng Việt"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prompt">Prompt (EN) *</Label>
                            <Textarea
                                id="prompt"
                                value={formData.prompt}
                                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                placeholder="Enter writing prompt in English"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="promptVi">Prompt (VI)</Label>
                            <Textarea
                                id="promptVi"
                                value={formData.promptVi}
                                onChange={(e) => setFormData({ ...formData, promptVi: e.target.value })}
                                placeholder="Nhập yêu cầu viết tiếng Việt"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="level">Level</Label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                                >
                                    <SelectTrigger id="level">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="essay">Essay</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="story">Story</SelectItem>
                                        <SelectItem value="description">Description</SelectItem>
                                        <SelectItem value="opinion">Opinion</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., Education"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minWords">Min Words</Label>
                                <Input
                                    id="minWords"
                                    type="number"
                                    value={formData.minWords}
                                    onChange={(e) => setFormData({ ...formData, minWords: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxWords">Max Words</Label>
                                <Input
                                    id="maxWords"
                                    type="number"
                                    value={formData.maxWords}
                                    onChange={(e) => setFormData({ ...formData, maxWords: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sampleAnswer">Sample Answer</Label>
                            <Textarea
                                id="sampleAnswer"
                                value={formData.sampleAnswer}
                                onChange={(e) => setFormData({ ...formData, sampleAnswer: e.target.value })}
                                placeholder="Enter sample answer (optional)"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseFormDialog}
                            disabled={isSaving}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSaveTemplate}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                editingTemplate ? "Cập nhật" : "Tạo mới"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-600">
                            Bạn có chắc chắn muốn xóa template <span className="font-semibold">"{deletingTemplate?.title}"</span>?
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseDeleteDialog}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
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
                                Sử dụng GPT để tự động tạo writing templates chất lượng cao với nội dung đa dạng và hấp dẫn.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ai-count">Số lượng templates (1-10)</Label>
                            <Input
                                id="ai-count"
                                type="number"
                                min={1}
                                max={10}
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
                                    <SelectItem value="easy">Easy (A2-B1)</SelectItem>
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
                                    <SelectItem value="essay">Essay</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="story">Story</SelectItem>
                                    <SelectItem value="description">Description</SelectItem>
                                    <SelectItem value="opinion">Opinion</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseAiDialog}
                            disabled={isGenerating}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleAiGenerate}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            {isGenerating ? (
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
        </div>
    );
}
