"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessonService } from "@/services/lesson.service";
import { flashcardAdminService } from "@/services/flashcardAdmin.service";
import { quizAdminService } from "@/services/quizAdmin.service";
import { toast } from "react-hot-toast";

export type RefType = "lesson" | "cardDeck" | "quiz";

interface RefItem {
    _id: string;
    title?: string;
    name?: string;
    description?: string;
    skill?: string;
    level?: string;
    status?: string;
}

interface RefPickerProps {
    type: RefType;
    value: string;
    onChange: (id: string) => void;
    label?: string;
    required?: boolean;
    className?: string;
}

export function RefPicker({
    type,
    value,
    onChange,
    label,
    required = false,
    className,
}: RefPickerProps) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<RefItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedItem, setSelectedItem] = useState<RefItem | null>(null);

    const pageSize = 10;
    const searchDebounceMs = 400;

    // Load items when dialog opens or page changes
    useEffect(() => {
        if (open) {
            loadItems();
        }
    }, [open, page, type]);

    // Load selected item info when value changes
    useEffect(() => {
        if (value && !selectedItem) {
            loadSelectedItem();
        }
    }, [value]);

    const loadSelectedItem = async () => {
        if (!value) return;
        try {
            let response: any;
            switch (type) {
                case "lesson":
                    response = await lessonService.getById(value);
                    if (response.data) setSelectedItem(response.data);
                    break;
                case "cardDeck":
                    response = await flashcardAdminService.getById(value);
                    if (response.data) setSelectedItem(response.data);
                    break;
                case "quiz":
                    response = await quizAdminService.getById(value);
                    if (response.data) {
                        setSelectedItem({
                            _id: response.data._id,
                            title: response.data.title,
                            description: response.data.description,
                            skill: response.data.skill,
                            level: response.data.difficulty,
                            status: response.data.status,
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error loading selected ${type}:`, error);
        }
    };

    const loadItems = async () => {
        try {
            setLoading(true);
            let response: any;

            switch (type) {
                case "lesson":
                    response = await lessonService.getAll({
                        pageNum: page,
                        pageSize,
                        search: search || undefined,
                    });
                    setItems(response.data || []);
                    setTotalPages(response.pagination?.totalPages || 1);
                    break;

                case "cardDeck":
                    response = await flashcardAdminService.getAll({
                        pageNum: page,
                        pageSize,
                        search: search || undefined,
                    });
                    setItems(response.data || []);
                    setTotalPages(response.pagination?.totalPages || 1);
                    break;

                case "quiz":
                    response = await quizAdminService.getAll({
                        pageNum: page,
                        pageSize,
                        search: search || undefined,
                    });
                    const quizItems = (response.data || []).map((quiz: any) => ({
                        _id: quiz._id,
                        title: quiz.title,
                        description: quiz.description,
                        skill: quiz.skill,
                        level: quiz.difficulty,
                        status: quiz.status,
                    }));
                    setItems(quizItems);
                    setTotalPages(response.pagination?.totalPages || 1);
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${type}s:`, error);
            toast.error(`Không thể tải danh sách ${getTypeLabel()}`);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm: string) => {
        setSearch(searchTerm);
        setPage(1);
        // Debounce search - reload after user stops typing
        setTimeout(() => {
            if (open) {
                loadItems();
            }
        }, searchDebounceMs);
    };

    const handleSelect = (item: RefItem) => {
        onChange(item._id);
        setSelectedItem(item);
        setOpen(false);
        setSearch("");
    };

    const handleClear = () => {
        onChange("");
        setSelectedItem(null);
    };

    const getTypeLabel = () => {
        switch (type) {
            case "lesson":
                return "bài học";
            case "cardDeck":
                return "bộ thẻ";
            case "quiz":
                return "bài tập";
            default:
                return "";
        }
    };

    const getTypeLabelCapitalized = () => {
        switch (type) {
            case "lesson":
                return "Bài học";
            case "cardDeck":
                return "Bộ thẻ";
            case "quiz":
                return "Bài tập";
            default:
                return "";
        }
    };

    const displayName = (item: RefItem) => item.title || item.name || "Không có tên";

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Selected Item Display */}
            {selectedItem ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">
                            {displayName(selectedItem)}
                        </p>
                        {selectedItem.description && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                                {selectedItem.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(true)}
                            className="cursor-pointer"
                        >
                            Thay đổi
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="cursor-pointer"
                        >
                            Xóa
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="w-full justify-start cursor-pointer"
                >
                    Chọn {getTypeLabelCapitalized()}
                </Button>
            )}

            {/* Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Chọn {getTypeLabelCapitalized()}</DialogTitle>
                    </DialogHeader>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={`Tìm kiếm ${getTypeLabel()}...`}
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto min-h-[300px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <p className="text-lg font-medium mb-2">
                                    Không tìm thấy {getTypeLabel()}
                                </p>
                                <p className="text-sm">
                                    {search
                                        ? "Thử tìm kiếm với từ khóa khác"
                                        : `Chưa có ${getTypeLabel()} nào`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <button
                                        key={item._id}
                                        onClick={() => handleSelect(item)}
                                        className={cn(
                                            "w-full p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer",
                                            value === item._id && "bg-blue-100 border-blue-400"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 mb-1">
                                                    {displayName(item)}
                                                </p>
                                                {item.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {item.skill && (
                                                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                                            {item.skill}
                                                        </span>
                                                    )}
                                                    {item.level && (
                                                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                                            {item.level}
                                                        </span>
                                                    )}
                                                    {item.status && (
                                                        <span
                                                            className={cn(
                                                                "text-xs px-2 py-1 rounded",
                                                                item.status === "active"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                            )}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {value === item._id && (
                                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-sm text-gray-600">
                                Trang {page} / {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1 || loading}
                                    className="cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages || loading}
                                    className="cursor-pointer"
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

