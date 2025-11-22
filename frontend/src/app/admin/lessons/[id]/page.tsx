"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { lessonService } from "@/services/lesson.service";
import { Lesson } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditLessonPage() {
    const router = useRouter();
    const params = useParams();
    const lessonId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        topic: "",
        skill: "reading" as "reading" | "writing" | "listening" | "speaking",
        difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
        status: "draft" as "draft" | "published" | "archived",
    });

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            setLoading(true);
            const response = await lessonService.getById(lessonId);
            if (response.code === 200 && response.data) {
                setLesson(response.data);
                setFormData({
                    title: response.data.title,
                    description: response.data.description || "",
                    topic: response.data.topic,
                    skill: response.data.skill,
                    difficulty: response.data.difficulty,
                    status: response.data.status,
                });
            } else {
                toast.error("Lesson not found");
                router.push("/admin/lessons");
            }
        } catch (error) {
            console.error("Error fetching lesson:", error);
            toast.error("Failed to load lesson");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Lesson title is required");
            return;
        }

        try {
            setSaving(true);
            const response = await lessonService.update(lessonId, formData);
            if (response.code === 200) {
                toast.success("Lesson updated successfully!");
                router.push("/admin/lessons");
            }
        } catch (error) {
            console.error("Error updating lesson:", error);
            toast.error("Failed to update lesson");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;

        try {
            const response = await lessonService.delete(lessonId);
            if (response.code === 200) {
                toast.success("Lesson deleted successfully!");
                router.push("/admin/lessons");
            }
        } catch (error) {
            toast.error("Failed to delete lesson");
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

    if (!lesson) {
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
                    Back to Lessons
                </Button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Edit Lesson
                        </h1>
                        <p className="text-gray-600">Update lesson information</p>
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

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lesson ID
                        </label>
                        <Input type="text" value={lesson._id} disabled className="bg-gray-50" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Difficulty <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
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
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
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
                                placeholder="Brief description of this lesson"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-3">Lesson Blocks</h3>
                        {lesson.blocks && lesson.blocks.length > 0 ? (
                            <div className="space-y-2">
                                {lesson.blocks.map((block, idx) => (
                                    <div
                                        key={block._id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-500">
                                                {idx + 1}.
                                            </span>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {block.title}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {block.type}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No blocks added yet. Blocks can be managed separately.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Created At
                            </label>
                            <p className="text-sm text-gray-900">
                                {new Date(lesson.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Last Updated
                            </label>
                            <p className="text-sm text-gray-900">
                                {new Date(lesson.updatedAt).toLocaleString()}
                            </p>
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
