"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { targetService } from "@/services/target.service";
import { CreateTargetInput } from "@/types/target";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateTargetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateTargetInput>({
        name: "",
        description: "",
        key: "",
        tag: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim() || !formData.key.trim() || !formData.tag.trim()) {
            toast.error("Name, Key, and Tag are required");
            return;
        }

        // Validate key format (uppercase, A-Z and numbers only)
        const keyRegex = /^[A-Z0-9_]+$/;
        const upperKey = formData.key.toUpperCase();
        if (!keyRegex.test(upperKey)) {
            toast.error("Key must contain only uppercase letters, numbers, and underscores");
            return;
        }

        try {
            setLoading(true);
            const response = await targetService.createTarget({
                ...formData,
                key: upperKey,
            });
            if (response.code === 200) {
                toast.success("Target created successfully!");
                router.push("/admin/targets");
            }
        } catch (error: any) {
            console.error("Error creating target:", error);
            const errorMessage =
                error?.response?.data?.message || "Failed to create target";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Targets
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create New Target
                </h1>
                <p className="text-gray-600">
                    Add a new learning target (e.g., IELTS, TOEIC, Business English)
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., IELTS Preparation"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Key <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="key"
                                value={formData.key}
                                onChange={(e) => {
                                    // Auto-convert to uppercase
                                    const value = e.target.value.toUpperCase();
                                    setFormData((prev) => ({ ...prev, key: value }));
                                }}
                                placeholder="e.g., IELTS_PREP"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Uppercase letters, numbers, and underscores only
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tags <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="tag"
                                value={formData.tag}
                                onChange={handleChange}
                                placeholder="e.g., ielts, exam, beginner"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Multiple tags separated by commas. Will be stored as lowercase.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of this target"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create Target
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The key must be unique and will be used to
                    identify this target in the system. Tags can be multiple values
                    separated by commas (e.g., "ielts, exam, beginner") and will be
                    stored as an array. Once created, you can assign this target to learning paths.
                </p>
            </div>
        </div>
    );
}
