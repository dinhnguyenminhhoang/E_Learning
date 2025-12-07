"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lessonService } from "@/services/lesson.service";
import { CreateLessonInput } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateLessonPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateLessonInput>({
        title: "",
        description: "",
        topic: "",
        skill: "reading",
        difficulty: "beginner",
        status: "draft",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Lesson title is required");
            return;
        }

        try {
            setLoading(true);
            const response = await lessonService.create(formData);
            if (response.code === 201) {
                toast.success("Lesson created successfully!");
                router.push("/admin/lessons");
            }
        } catch (error) {
            console.error("Error creating lesson:", error);
            toast.error("Failed to create lesson");
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
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lessons
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create New Lesson
                </h1>
                <p className="text-gray-600">Add a new lesson to your curriculum</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                                    Create Lesson
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After creating the lesson, you can add blocks
                    (media, grammar, vocabulary, quizzes) from the edit page.
                </p>
            </div>
        </div>
    );
}
