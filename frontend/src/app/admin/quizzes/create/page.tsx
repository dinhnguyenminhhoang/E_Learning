"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { quizAdminService } from "@/services/quizAdmin.service";
import { CreateQuizInput } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateQuizPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateQuizInput>({
        title: "",
        description: "",
        skill: "grammar",
        difficulty: "beginner",
        timeLimit: 600,
        passingScore: 70,
        status: "draft",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Quiz title is required");
            return;
        }

        try {
            setLoading(true);
            const response = await quizAdminService.create(formData);
            if (response.code === 201) {
                toast.success("Quiz created successfully!");
                router.push("/admin/quizzes");
            }
        } catch (error) {
            console.error("Error creating quiz:", error);
            toast.error("Failed to create quiz");
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
        setFormData((prev) => ({
            ...prev,
            [name]: name === "timeLimit" || name === "passingScore" ? Number(value) : value,
        }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Quizzes
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
                <p className="text-gray-600">Add a new assessment quiz</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quiz Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Grammar Basics Quiz"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Skill <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="skill"
                                value={formData.skill}
                                onChange={handleChange}
                                placeholder="e.g., grammar, vocabulary"
                                required
                            />
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
                                Time Limit (seconds)
                            </label>
                            <Input
                                type="number"
                                name="timeLimit"
                                value={formData.timeLimit || ""}
                                onChange={handleChange}
                                placeholder="600"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty for no time limit
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Passing Score (%) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                name="passingScore"
                                value={formData.passingScore}
                                onChange={handleChange}
                                placeholder="70"
                                min="0"
                                max="100"
                                required
                            />
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
                                placeholder="Brief description of this quiz"
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
                                    Create Quiz
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After creating the quiz, you can add questions
                    from the edit page.
                </p>
            </div>
        </div>
    );
}
