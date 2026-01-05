"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lessonService } from "@/services/lesson.service";
// Giả sử bạn đã export categoryService từ file service tương ứng
import { categoryService } from "@/services/category.service"; 
import { CreateLessonInput } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

// Interface Category bạn cung cấp
export interface Category {
  _id: string;
  name: string;
  nameVi: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export default function CreateLessonPage() {
    const router = useRouter();
    
    // Loading state cho việc submit form
    const [submitting, setSubmitting] = useState(false);
    
    // State lưu danh sách Category fetched từ API
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<CreateLessonInput>({
        title: "",
        description: "",
        topic: "",
        skill: "reading",
        level: "beginner",
        categoryId: "", // Mặc định rỗng, user bắt buộc phải chọn
        duration_minutes: 30,
        prerequisites: []
    });

    // Fetch Categories khi component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll();
                // Tùy vào cấu trúc trả về của API service bên bạn
                // Nếu response là array: setCategories(response)
                // Nếu response có dạng { data: [...] }: setCategories(response.data)
                
                // Ở đây tôi giả định response trả về mảng hoặc object chứa data
                // Bạn hãy log response ra để chắc chắn nhé
                if (Array.isArray(response)) {
                    setCategories(response);
                } else if (response.data && Array.isArray(response.data)) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                toast.error("Could not load categories list");
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Lesson title is required");
            return;
        }
        if (!formData.categoryId) {
            toast.error("Please select a category");
            return;
        }

        try {
            setSubmitting(true);
            const response = await lessonService.create(formData);
                toast.success(response.message || "Lesson created successfully");
                router.push("/admin/lessons");
        
        } catch (error: any) {
            console.error("Error creating lesson:", error);
            const msg = error?.response?.data?.message || "Failed to create lesson";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        
        setFormData((prev) => {
            const newValue = name === 'duration_minutes' ? (parseInt(value) || 0) : value;
            return { 
                ...prev, 
                [name]: newValue 
            } as CreateLessonInput;
        });
    };

    return (
        <div className="p-6 mx-auto">
            {/* Header section (Giữ nguyên) */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lessons
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Lesson</h1>
                <p className="text-gray-600">Add a new lesson to your curriculum</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Title Input (Giữ nguyên) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Lesson Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Irregular Plural Nouns"
                                required
                            />
                        </div>

                        {/* --- CATEGORY SELECT (UPDATED) --- */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            
                            {loadingCategories ? (
                                // Skeleton loading state đơn giản
                                <div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg border border-gray-200"></div>
                            ) : (
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">-- Select a Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {/* Hiển thị cả tên Anh và Việt cho rõ ràng */}
                                            {cat.name} ({cat.nameVi}) 
                                        </option>
                                    ))}
                                </select>
                            )}
                            
                            {/* Helper text */}
                            {!loadingCategories && categories.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">
                                    No categories found. Please create a category first.
                                </p>
                            )}
                        </div>

                        {/* Topic Input (Giữ nguyên) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Topic <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                placeholder="e.g., Grammar"
                                required
                            />
                        </div>

                        {/* Duration Input (Giữ nguyên) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <Input
                                type="number"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>

                        {/* Skill Select (Giữ nguyên) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Skill <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="skill"
                                value={formData.skill}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="reading">Reading</option>
                                <option value="writing">Writing</option>
                                <option value="listening">Listening</option>
                                <option value="speaking">Speaking</option>
                            </select>
                        </div>

                        {/* Level Select (Giữ nguyên) */}
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

                        {/* Description (Giữ nguyên) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of this lesson"
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
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create Lesson
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}