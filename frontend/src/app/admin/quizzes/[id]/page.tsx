"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { quizAdminService } from "@/services/quizAdmin.service";
import { Quiz } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditQuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        skill: "",
        difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
        timeLimit: 0,
        passingScore: 70,
        status: "draft" as "draft" | "published",
    });

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await quizAdminService.getById(quizId);
            if (response.code === 200 && response.data) {
                setQuiz(response.data);
                setFormData({
                    title: response.data.title,
                    description: response.data.description || "",
                    skill: response.data.skill,
                    difficulty: response.data.difficulty,
                    timeLimit: response.data.timeLimit || 0,
                    passingScore: response.data.passingScore,
                    status: response.data.status,
                });
            } else {
                toast.error("Quiz not found");
                router.push("/admin/quizzes");
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            toast.error("Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Quiz title is required");
            return;
        }

        try {
            setSaving(true);
            const response = await quizAdminService.update(quizId, formData);
            if (response.code === 200) {
                toast.success("Quiz updated successfully!");
                router.push("/admin/quizzes");
            }
        } catch (error) {
            console.error("Error updating quiz:", error);
            toast.error("Failed to update quiz");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const response = await quizAdminService.delete(quizId);
            if (response.code === 200) {
                toast.success("Quiz deleted successfully!");
                router.push("/admin/quizzes");
            }
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "timeLimit" || name === "passingScore" ? Number(value) : value,
        }));
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

    if (!quiz) {
        return null;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Quizzes
                </Button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Quiz</h1>
                        <p className="text-gray-600">Update quiz information and questions</p>
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
                            Quiz ID
                        </label>
                        <Input type="text" value={quiz._id} disabled className="bg-gray-50" />
                    </div>

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
                                placeholder="e.g., grammar"
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

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Questions</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-blue-600"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Question
                            </Button>
                        </div>
                        {quiz.questions && quiz.questions.length > 0 ? (
                            <div className="space-y-2">
                                {quiz.questions.map((question, idx) => (
                                    <div
                                        key={question._id}
                                        className="p-4 bg-gray-50 rounded-lg border"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 mb-1">
                                                    {idx + 1}. {question.question}
                                                </p>
                                                <div className="flex gap-2 text-xs">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                        {question.type}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                                        {question.points} pts
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                                No questions added yet. Questions can be managed separately.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Created At
                            </label>
                            <p className="text-sm text-gray-900">
                                {new Date(quiz.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Last Updated
                            </label>
                            <p className="text-sm text-gray-900">
                                {new Date(quiz.updatedAt).toLocaleString()}
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
