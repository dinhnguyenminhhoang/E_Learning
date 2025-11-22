"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const categoryId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [category, setCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        nameVi: "",
        slug: "",
        description: "",
        status: "active" as "active" | "inactive",
    });

    useEffect(() => {
        fetchCategory();
    }, [categoryId]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getById(categoryId);
            if (response.code === 200 && response.data) {
                setCategory(response.data);
                setFormData({
                    name: response.data.name,
                    nameVi: response.data.nameVi,
                    slug: response.data.slug,
                    description: response.data.description || "",
                    status: response.data.status,
                });
            } else {
                toast.error("Category not found");
                router.push("/admin/categories");
            }
        } catch (error) {
            console.error("Error fetching category:", error);
            toast.error("Failed to load category");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.nameVi.trim() || !formData.slug.trim()) {
            toast.error("Name, Name (VI), and Slug are required");
            return;
        }

        try {
            setSaving(true);
            const response = await categoryService.update(categoryId, formData);
            if (response.code === 200) {
                toast.success("Category updated successfully!");
                router.push("/admin/categories");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Failed to update category");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const response = await categoryService.delete(categoryId);
            if (response.code === 200) {
                toast.success("Category deleted successfully!");
                router.push("/admin/categories");
            }
        } catch (error) {
            toast.error("Failed to delete category");
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

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    if (!category) {
        return null;
    }

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
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Edit Category
                        </h1>
                        <p className="text-gray-600">
                            Update category information and settings
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Category ID (Read-only) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category ID
                        </label>
                        <Input
                            type="text"
                            value={category._id}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>

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

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Slug <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="e.g., programming"
                            required
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            URL-friendly identifier
                        </p>
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

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Created At
                            </label>
                            <p className="text-sm text-gray-900">
                                {new Date(category.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Last Updated
                            </label>
                            <p className="text-sm text-gray-900">
                                {new Date(category.updatedAt).toLocaleString()}
                            </p>
                        </div>

                    </div>

                    {/* Actions */}
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
                            <p className="text-xs text-gray-500">Slug</p>
                            <p className="text-sm font-mono text-blue-600">
                                {formData.slug || "category-slug"}
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
