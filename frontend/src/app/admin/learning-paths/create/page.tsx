"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { learningPathAdminService } from "@/services/learningPathAdmin.service";
import { targetService } from "@/services/target.service";
import { TargetOption } from "@/types/target";
import { CreateLearningPathInput } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateLearningPathPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingTargets, setLoadingTargets] = useState(true);
    const [availableTargets, setAvailableTargets] = useState<TargetOption[]>([]);
    const [formData, setFormData] = useState<
        CreateLearningPathInput & { targetId: string }
    >({
        title: "",
        description: "",
        target: "",
        targetId: "",
        key: "",
        level: "beginner",
        status: "active",
    });

    useEffect(() => {
        fetchUnassignedTargets();
    }, []);

    const fetchUnassignedTargets = async () => {
        try {
            setLoadingTargets(true);
            const response = await targetService.getUnassignedTargets();
            if (response.code === 200) {
                setAvailableTargets(response.data);
            }
        } catch (error) {
            console.error("Error fetching targets:", error);
            toast.error("Failed to load targets");
        } finally {
            setLoadingTargets(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.key.trim()) {
            toast.error("Title and Key are required");
            return;
        }

        if (!formData.targetId) {
            toast.error("Please select a target");
            return;
        }

        try {
            setLoading(true);
            const response = await learningPathAdminService.create({
                ...formData,
                targetId: formData.targetId,
            });
            if (response.code === 200 || response.code === 201) {
                toast.success("Learning path created successfully!");
                router.push("/admin/learning-paths");
            }
        } catch (error: any) {
            console.error("Error creating path:", error);
            const errorMessage =
                error?.response?.data?.message || "Failed to create learning path";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Learning Paths
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create New Learning Path
                </h1>
                <p className="text-gray-600">Add a new structured learning journey</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Path Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., English for Beginners"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target <span className="text-red-500">*</span>
                            </label>
                            {loadingTargets ? (
                                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                    <span className="text-sm text-gray-600">
                                        Loading targets...
                                    </span>
                                </div>
                            ) : availableTargets.length === 0 ? (
                                <div className="px-4 py-3 border border-yellow-300 rounded-lg bg-yellow-50">
                                    <p className="text-sm text-yellow-800">
                                        No available targets. All targets are already assigned
                                        to learning paths.{" "}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push("/admin/targets/create")
                                            }
                                            className="underline font-medium hover:text-yellow-900"
                                        >
                                            Create a new target
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                <select
                                    name="targetId"
                                    value={formData.targetId}
                                    onChange={(e) => {
                                        const selectedTarget = availableTargets.find(
                                            (t) => t.key === e.target.value
                                        );
                                        setFormData((prev) => ({
                                            ...prev,
                                            targetId: e.target.value,
                                            target: selectedTarget?.value || "",
                                        }));
                                    }}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a target...</option>
                                    {availableTargets.map((target) => (
                                        <option key={target.key} value={target.key}>
                                            {target.value}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Choose the learning objective (IELTS, TOEIC, etc.)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Path Key <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="key"
                                value={formData.key}
                                onChange={handleChange}
                                placeholder="e.g., beginner-path"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Unique identifier (lowercase, no spaces)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of this learning path"
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
                                    Create Learning Path
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After creating the path, you can add levels and
                    assign lessons from the edit page.
                </p>
            </div>
        </div>
    );
}
