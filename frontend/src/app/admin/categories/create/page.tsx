"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoryService } from "@/services/category.service";
import { CreateCategoryInput } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateCategoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateCategoryInput>({
        name: "",
        nameVi: "",
        description: "",
        status: "active",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.nameVi.trim()) {
            toast.error("Name and Name (VI) are required");
            return;
        }

        try {
            setLoading(true);
            const response = await categoryService.create(formData);
            if (response.code === 200) {
                toast.success("Category created successfully!");
                router.push("/admin/categories");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error("Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Categories
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create New Category
                </h1>
                <p className="text-gray-600">Add a new category to organize words</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Name (EN) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category Name (EN) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Programming"
                                required
                                className="w-full"
                            />
                        </div>

                        {/* Category Name (VI) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category Name (VI) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="nameVi"
                                value={formData.nameVi}
                                onChange={handleChange}
                                placeholder="e.g., Lập trình"
                                required
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of this category"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Inactive categories won't be visible to users
                        </p>
                    </div>

                    {/* Actions */}
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
                                    Create Category
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Name (EN)</p>
                            <h4 className="font-semibold text-gray-900">
                                {formData.name || "Category Name"}
                            </h4>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Name (VI)</p>
                            <p className="text-sm text-gray-700">
                                {formData.nameVi || "Tên danh mục"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Description</p>
                            <p className="text-sm text-gray-600">
                                {formData.description || "No description"}
                            </p>
                        </div>
                        <div>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${formData.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {formData.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
