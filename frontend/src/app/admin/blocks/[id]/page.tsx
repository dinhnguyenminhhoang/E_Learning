"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { blockService } from "@/services/block.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { GrammarBlockForm, GrammarBlockFormData } from "@/components/admin/blocks/forms/GrammarBlockForm";
import { VocabularyBlockForm, VocabularyBlockFormData } from "@/components/admin/blocks/forms/VocabularyBlockForm";
import { MediaBlockForm, MediaBlockFormData } from "@/components/admin/blocks/forms/MediaBlockForm";
import { RefPicker } from "@/components/admin/blocks/shared/RefPicker";
import { SourceType } from "@/components/admin/blocks/shared/MediaUploader";

export type BlockType = "vocabulary" | "grammar" | "quiz" | "media";

interface BlockFormData {
    // Common fields
    type: BlockType;
    title: string;
    description: string;
    skill: string;
    difficulty: string;
    lessonId: string;
    status: string;
    duration?: number;
    order?: number;

    // Grammar specific
    grammar?: GrammarBlockFormData;

    // Vocabulary specific
    vocabulary?: VocabularyBlockFormData;

    // Media specific
    media?: MediaBlockFormData;
}

const SKILL_OPTIONS = [
    { value: "reading", label: "Reading" },
    { value: "writing", label: "Writing" },
    { value: "listening", label: "Listening" },
    { value: "speaking", label: "Speaking" },
];

const DIFFICULTY_OPTIONS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export default function EditBlockPage() {
    const router = useRouter();
    const params = useParams();
    const blockId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<BlockFormData>({
        type: "grammar",
        title: "",
        description: "",
        skill: "reading",
        difficulty: "beginner",
        lessonId: "",
        status: "active",
        duration: 0,
        grammar: {
            topic: "",
            explanation: "",
            examples: [],
            videoUrl: "",
            sourceType: "upload",
        },
        vocabulary: {
            cardDeck: "",
        },
        media: {
            mediaType: "video",
            sourceType: "upload",
            sourceUrl: "",
            transcript: "",
            tasks: [],
        },
    });

    useEffect(() => {
        if (blockId) {
            fetchBlock();
        }
    }, [blockId]);

    const fetchBlock = async () => {
        try {
            setLoading(true);
            const response = await blockService.getBlockById(blockId);

            if ((response as any).code === 200) {
                const block = (response as any).data;

                // Map block data to form data
                const mappedFormData: BlockFormData = {
                    type: block.type || "grammar",
                    title: block.title || "",
                    description: block.description || "",
                    skill: block.skill || "reading",
                    difficulty: block.difficulty || "beginner",
                    lessonId: block.lessonId?._id || block.lessonId || "",
                    status: block.status || "active",
                    order: block.order,
                    duration: block.type === "grammar" ? block.duration || 0 : undefined,
                };

                // Map type-specific data
                if (block.type === "grammar") {
                    mappedFormData.grammar = {
                        topic: block.topic || "",
                        explanation: block.explanation || "",
                        examples: block.examples || [],
                        videoUrl: block.videoUrl || "",
                        sourceType: (block.sourceType as SourceType) || "upload",
                        exercise: block.exercise?._id || block.exercise || "",
                    };
                } else if (block.type === "vocabulary") {
                    mappedFormData.vocabulary = {
                        cardDeck: block.cardDeck?._id || block.cardDeck || "",
                    };
                } else if (block.type === "media") {
                    mappedFormData.media = {
                        mediaType: block.mediaType || "video",
                        sourceType: (block.sourceType as SourceType) || "upload",
                        sourceUrl: block.sourceUrl || "",
                        transcript: block.transcript || "",
                        tasks: block.tasks || [],
                    };
                }

                setFormData(mappedFormData);
            } else {
                toast.error("Không tìm thấy block");
                router.push("/admin/blocks");
            }
        } catch (error: any) {
            console.error("Error fetching block:", error);
            toast.error("Không thể tải thông tin block");
            router.push("/admin/blocks");
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (newType: BlockType) => {
        setFormData((prev) => ({
            ...prev,
            type: newType,
        }));
    };

    const handleCommonFieldChange = (field: keyof BlockFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleGrammarChange = (updates: Partial<GrammarBlockFormData>) => {
        setFormData((prev) => ({
            ...prev,
            grammar: { ...prev.grammar!, ...updates },
        }));
    };

    const handleVocabularyChange = (updates: Partial<VocabularyBlockFormData>) => {
        setFormData((prev) => ({
            ...prev,
            vocabulary: { ...prev.vocabulary!, ...updates },
        }));
    };

    const handleMediaChange = (updates: Partial<MediaBlockFormData>) => {
        setFormData((prev) => ({
            ...prev,
            media: { ...prev.media!, ...updates },
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề block");
            return false;
        }

        if (!formData.lessonId) {
            toast.error("Vui lòng chọn bài học");
            return false;
        }

        // Type-specific validation
        if (formData.type === "grammar") {
            if (!formData.grammar?.topic?.trim()) {
                toast.error("Vui lòng nhập chủ đề ngữ pháp");
                return false;
            }
            if (!formData.grammar?.explanation?.trim()) {
                toast.error("Vui lòng nhập giải thích");
                return false;
            }
        }

        if (formData.type === "vocabulary") {
            if (!formData.vocabulary?.cardDeck) {
                toast.error("Vui lòng chọn bộ thẻ từ vựng");
                return false;
            }
        }

        if (formData.type === "media") {
            if (!formData.media?.sourceUrl?.trim()) {
                toast.error("Vui lòng cung cấp nguồn media");
                return false;
            }
        }

        return true;
    };

    const buildPayload = () => {
        const basePayload: any = {
            type: formData.type,
            title: formData.title,
            description: formData.description || "",
            skill: formData.skill,
            difficulty: formData.difficulty,
            lessonId: formData.lessonId,
            status: formData.status,
        };

        if (formData.order) {
            basePayload.order = formData.order;
        }

        // Add type-specific fields
        if (formData.type === "grammar" && formData.grammar) {
            basePayload.topic = formData.grammar.topic;
            basePayload.explanation = formData.grammar.explanation;
            basePayload.examples = formData.grammar.examples || [];
            if (formData.grammar.videoUrl) {
                basePayload.videoUrl = formData.grammar.videoUrl;
                basePayload.sourceType = formData.grammar.sourceType || "upload";
            }
            if (formData.grammar.exercise) {
                basePayload.exercise = formData.grammar.exercise;
            }
        }

        if (formData.type === "vocabulary" && formData.vocabulary) {
            basePayload.cardDeck = formData.vocabulary.cardDeck;
        }

        if (formData.type === "media" && formData.media) {
            basePayload.mediaType = formData.media.mediaType;
            basePayload.sourceType = formData.media.sourceType;
            basePayload.sourceUrl = formData.media.sourceUrl;
            if (formData.media.transcript) {
                basePayload.transcript = formData.media.transcript;
            }
            if (formData.media.tasks && formData.media.tasks.length > 0) {
                basePayload.tasks = formData.media.tasks;
            }
        }

        // Duration chỉ áp dụng cho grammar
        if (formData.type === "grammar" && formData.duration != null) {
            const parsed = Number(formData.duration);
            if (!Number.isNaN(parsed)) {
                basePayload.duration = parsed;
            }
        }

        return basePayload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            const payload = buildPayload();
            const response = await blockService.updateBlock(blockId, payload);

            if ((response as any).code === 200) {
                toast.success("Cập nhật block thành công!");
                router.push("/admin/blocks");
            } else {
                toast.error((response as any).message || "Không thể cập nhật block");
            }
        } catch (error: any) {
            console.error("Error updating block:", error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể cập nhật block";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải thông tin block...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Chỉnh sửa Block
                </h1>
                <p className="text-gray-600">Cập nhật thông tin block</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common Fields */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Thông tin chung
                    </h2>

                    {/* Block Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Loại Block <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value as BlockType)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            disabled
                        >
                            <option value="grammar">Grammar</option>
                            <option value="vocabulary">Vocabulary</option>
                            <option value="media">Media</option>
                            <option value="quiz">Quiz</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Không thể thay đổi loại block sau khi tạo
                        </p>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={formData.title}
                            onChange={(e) => handleCommonFieldChange("title", e.target.value)}
                            placeholder="Ví dụ: Grammar: Present Perfect Tense"
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleCommonFieldChange("description", e.target.value)}
                            rows={3}
                            placeholder="Mô tả ngắn gọn về block..."
                            className="resize-none cursor-pointer"
                        />
                    </div>

                    {/* Skill, Difficulty, Status (+Duration cho Grammar) */}
                    <div className={`grid grid-cols-1 ${formData.type === "grammar" ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kỹ năng <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.skill}
                                onChange={(e) => handleCommonFieldChange("skill", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            >
                                {SKILL_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Độ khó <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => handleCommonFieldChange("difficulty", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            >
                                {DIFFICULTY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleCommonFieldChange("status", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                    {/* Duration hiển thị trong GrammarBlockForm, không lặp lại ở đây */}
                    </div>

                    {/* Lesson */}
                    <div>
                        <RefPicker
                            type="lesson"
                            value={formData.lessonId}
                            onChange={(lessonId) => handleCommonFieldChange("lessonId", lessonId)}
                            label="Bài học"
                            required={true}
                        />
                    </div>
                </div>

                {/* Type-Specific Fields */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
                        Cài đặt {formData.type}
                    </h2>

                    {formData.type === "grammar" && formData.grammar && (
                        <GrammarBlockForm
                            data={formData.grammar}
                            onChange={handleGrammarChange}
                            lessonId={formData.lessonId}
                            duration={formData.duration}
                            onDurationChange={(d) => handleCommonFieldChange("duration", d)}
                        />
                    )}

                    {formData.type === "vocabulary" && formData.vocabulary && (
                        <VocabularyBlockForm
                            data={formData.vocabulary}
                            onChange={handleVocabularyChange}
                        />
                    )}

                    {formData.type === "media" && formData.media && (
                        <MediaBlockForm
                            data={formData.media}
                            onChange={handleMediaChange}
                        />
                    )}

                    {formData.type === "quiz" && (
                        <div className="text-center py-8 text-gray-500">
                            <p>Quiz blocks sẽ được quản lý riêng trong phần Quiz.</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="cursor-pointer"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

