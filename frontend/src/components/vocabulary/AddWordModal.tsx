"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { wordService, type UserWord } from "@/services/word.service";
import { toast } from "react-hot-toast";

interface AddWordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editWord?: UserWord | null;
}

export function AddWordModal({ isOpen, onClose, onSuccess, editWord }: AddWordModalProps) {
    const [formData, setFormData] = useState({
        word: editWord?.word || "",
        meaningVi: editWord?.meaningVi || "",
        pronunciation: editWord?.pronunciation || "",
        example: editWord?.example || "",
        exampleVi: editWord?.exampleVi || "",
        type: editWord?.type || "other",
        level: editWord?.level || "beginner",
        tags: editWord?.tags?.join(", ") || "",
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
            };

            if (editWord) {
                await wordService.updateCustomWord(editWord._id, data);
                toast.success("Cập nhật từ thành công!");
            } else {
                await wordService.createCustomWord(data);
                toast.success("Thêm từ mới thành công!");
            }

            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        {editWord ? "Chỉnh sửa từ" : "Thêm từ mới"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Từ (English) *</Label>
                            <Input
                                value={formData.word}
                                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                                placeholder="happiness"
                                required
                            />
                        </div>
                        <div>
                            <Label>Nghĩa (Tiếng Việt) *</Label>
                            <Input
                                value={formData.meaningVi}
                                onChange={(e) => setFormData({ ...formData, meaningVi: e.target.value })}
                                placeholder="sự hạnh phúc"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Phiên âm</Label>
                        <Input
                            value={formData.pronunciation}
                            onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                            placeholder="/ˈhæp.i.nəs/"
                        />
                    </div>

                    <div>
                        <Label>Ví dụ (English)</Label>
                        <Textarea
                            value={formData.example}
                            onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                            placeholder="Money can't buy happiness."
                            rows={2}
                        />
                    </div>

                    <div>
                        <Label>Ví dụ (Tiếng Việt)</Label>
                        <Textarea
                            value={formData.exampleVi}
                            onChange={(e) => setFormData({ ...formData, exampleVi: e.target.value })}
                            placeholder="Tiền không thể mua được hạnh phúc."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Loại từ</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="noun">Danh từ</SelectItem>
                                    <SelectItem value="verb">Động từ</SelectItem>
                                    <SelectItem value="adjective">Tính từ</SelectItem>
                                    <SelectItem value="adverb">Trạng từ</SelectItem>
                                    <SelectItem value="phrase">Cụm từ</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Cấp độ</Label>
                            <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Tags (phân cách bằng dấu phẩy)</Label>
                        <Input
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="emotion, feeling, common"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Đang xử lý..." : editWord ? "Cập nhật" : "Thêm từ"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
