"use client";

import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
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
    const [aiLoading, setAiLoading] = useState(false);

    if (!isOpen) return null;

    const handleAIGenerate = async () => {
        if (!formData.word.trim()) {
            toast.error("Vui lòng nhập từ tiếng Anh trước!");
            return;
        }

        setAiLoading(true);
        try {
            const result = await wordService.generateWordWithAI(formData.word.trim());

            setFormData(prev => ({
                ...prev,
                pronunciation: result.pronunciation || prev.pronunciation,
                meaningVi: result.meaningVi || prev.meaningVi,
                type: (result.type as typeof prev.type) || prev.type,
                example: result.example || prev.example,
                exampleVi: result.exampleVi || prev.exampleVi,
                level: (result.level as typeof prev.level) || prev.level,
            }));

            toast.success("🪄 AI đã sinh thông tin thành công!");
        } catch (error: any) {
            console.error("AI generation error:", error);
            toast.error(error?.message || "Không thể sinh thông tin từ AI");
        } finally {
            setAiLoading(false);
        }
    };

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
                    <div>
                        <Label>Từ (English) *</Label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.word}
                                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                                placeholder="happiness"
                                required
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAIGenerate}
                                disabled={aiLoading || !formData.word.trim()}
                                className="shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                            >
                                {aiLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang sinh...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        AI Sinh
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Nhập từ rồi bấm AI Sinh để tự động điền các trường
                        </p>
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
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as typeof formData.type })}>
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
                            <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v as typeof formData.level })}>
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
                        <Button type="submit" disabled={loading || aiLoading} className="flex-1">
                            {loading ? "Đang xử lý..." : editWord ? "Cập nhật" : "Thêm từ"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading || aiLoading}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
