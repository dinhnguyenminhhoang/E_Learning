"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { targetService } from "@/services/target.service";
import { Target, UpdateTargetInput } from "@/types/target";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditTargetPage() {
    const router = useRouter();
    const params = useParams();
    const targetId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [target, setTarget] = useState<Target | null>(null);
    const [formData, setFormData] = useState<UpdateTargetInput>({
        name: "",
        description: "",
        key: "",
        tag: "",
    });

    useEffect(() => {
        fetchTarget();
    }, [targetId]);

    const fetchTarget = async () => {
        try {
            setLoading(true);
            // Fetch all targets and find the one we need
            const response = await targetService.getAllTargets({});
            if (response.code === 200) {
                const foundTarget = response.data.find((t) => t._id === targetId);
                if (foundTarget) {
                    setTarget(foundTarget);
                    setFormData({
                        name: foundTarget.name,
                        description: foundTarget.description || "",
                        key: foundTarget.key,
                        // Join all tags with commas
                        tag: foundTarget.tags.join(", "),
                    });
                } else {
                    toast.error("Target not found");
                    router.push("/admin/targets");
                }
            }
        } catch (error) {
            console.error("Error fetching target:", error);
            toast.error("Failed to load target");
            router.push("/admin/targets");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim() || !formData.key?.trim() || !formData.tag?.trim()) {
            toast.error("Name, Key, and Tag are required");
            return;
        }

        // Validate key format
        const keyRegex = /^[A-Z0-9_]+$/;
        const upperKey = formData.key!.toUpperCase();
        if (!keyRegex.test(upperKey)) {
            toast.error("Key must contain only uppercase letters, numbers, and underscores");
            return;
        }

        try {
            setSaving(true);
            const response = await targetService.updateTarget(targetId, {
                ...formData,
                key: upperKey,
            });
            if (response.code === 200) {
                toast.success("Target updated successfully!");
                router.push("/admin/targets");
            }
        } catch (error: any) {
            console.error("Error updating target:", error);
            const errorMessage =
                error?.response?.data?.message || "Failed to update target";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    if (!target) {
        return null;
    }

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
                    Edit Target
                </h1>
                <p className="text-gray-600">Update target information</p>
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
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
