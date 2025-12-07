"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wordService, Word } from "@/services/word.service";
import { categoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditWordPage() {
    const router = useRouter();
    const params = useParams();
    const wordId = params.id as string;
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Word>>({
        word: "",
        pronunciation: "",
        partOfSpeech: "noun",
        level: "beginner",
        definitions: [{ meaning: "", meaningVi: "", examples: [] }],
        categories: [],
    });

    // Fetch word data
    const { data: wordData, isLoading } = useQuery({
        queryKey: ["word", wordId],
        queryFn: async () => {
            const response = await wordService.getWordById(wordId);
            return response?.data || null;
        },
        enabled: !!wordId,
    });

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getAll(),
    });

    // Update form when word data loads
    useEffect(() => {
        if (wordData) {
            setFormData({
                word: wordData.word || "",
                pronunciation: wordData.pronunciation || "",
                partOfSpeech: wordData.partOfSpeech || "noun",
                level: wordData.level || "beginner",
                definitions: wordData.definitions || [{ meaning: "", meaningVi: "", examples: [] }],
                categories: wordData.categories?.map((c: any) => c._id || c) || [],
            });
        }
    }, [wordData]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<Word>) => wordService.updateWord(wordId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["words"] });
            toast.success("Word updated successfully!");
            router.push("/admin/words");
        },
        onError: () => {
            toast.error("Failed to update word");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.word?.trim()) {
            toast.error("Word is required");
            return;
        }
        // Filter out empty categories
        const dataToSubmit = {
            ...formData,
            categories: formData.categories?.filter(c => c && c.trim() !== '') || [],
        };
        updateMutation.mutate(dataToSubmit);
    };

    const categories = categoriesData?.data || [];
    const levels = ["beginner", "intermediate", "advanced"];
    const partsOfSpeech = ["noun", "verb", "adj", "adv", "prep", "conj", "pron", "interj"];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Word</h1>
                    <p className="text-gray-500">Update word information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="p-6 space-y-6">
                    {/* Word */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Word <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={formData.word}
                            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                            placeholder="Enter word"
                        />
                    </div>

                    {/* Pronunciation */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Pronunciation</label>
                        <Input
                            value={formData.pronunciation}
                            onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                            placeholder="/pronunciation/"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Part of Speech */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Part of Speech</label>
                            <Select
                                value={formData.partOfSpeech}
                                onValueChange={(v) => setFormData({ ...formData, partOfSpeech: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {partsOfSpeech.map((pos) => (
                                        <SelectItem key={pos} value={pos}>
                                            {pos}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Level</label>
                            <Select
                                value={formData.level}
                                onValueChange={(v) => setFormData({ ...formData, level: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {levels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Definitions */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Definitions</label>
                        {formData.definitions?.map((def, index) => (
                            <div key={index} className="p-4 border rounded-lg mb-3 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Definition {index + 1}</span>
                                    {formData.definitions!.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newDefs = [...formData.definitions!];
                                                newDefs.splice(index, 1);
                                                setFormData({ ...formData, definitions: newDefs });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    placeholder="Meaning (English)"
                                    value={def.meaning}
                                    onChange={(e) => {
                                        const newDefs = [...formData.definitions!];
                                        newDefs[index].meaning = e.target.value;
                                        setFormData({ ...formData, definitions: newDefs });
                                    }}
                                />
                                <Input
                                    placeholder="Meaning (Vietnamese)"
                                    value={def.meaningVi}
                                    onChange={(e) => {
                                        const newDefs = [...formData.definitions!];
                                        newDefs[index].meaningVi = e.target.value;
                                        setFormData({ ...formData, definitions: newDefs });
                                    }}
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setFormData({
                                    ...formData,
                                    definitions: [...formData.definitions!, { meaning: "", meaningVi: "", examples: [] }],
                                });
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Definition
                        </Button>
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Categories</label>
                        <Select
                            value={formData.categories?.[0] || ""}
                            onValueChange={(v) => setFormData({ ...formData, categories: [v] })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat: any) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
}
