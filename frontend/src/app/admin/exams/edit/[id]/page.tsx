"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { examService, UpdateExamRequest, Exam } from "@/services/exam.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import { QuizPicker } from "@/components/admin/QuizPicker";

export default function EditExamPage() {
    const router = useRouter();
    const params = useParams();
    const examId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [quizCache, setQuizCache] = useState<Record<string, any>>({});

    const form = useForm<UpdateExamRequest>({
        defaultValues: {
            title: "",
            description: "",
            totalTimeLimit: 3600,
            sections: [],
            status: "draft",
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "sections",
    });

    useEffect(() => {
        loadExam();
    }, [examId]);

    const loadExam = async () => {
        try {
            setLoading(true);
            const response = await examService.getExamById(examId);

            if (response.code === 200) {
                const exam = response.data;
                form.setValue("title", exam.title);
                form.setValue("description", exam.description || "");
                form.setValue("totalTimeLimit", exam.totalTimeLimit);
                form.setValue("status", (exam.status || "draft") as "draft" | "active" | "inactive");

                // Store quiz objects in cache
                const cache: Record<string, any> = {};

                // Map sections to form format
                const sections = exam.sections.map((section) => {
                    const quizId = typeof section.quiz === 'object' ? section.quiz._id : section.quiz;

                    // Cache the full quiz object if populated
                    if (typeof section.quiz === 'object') {
                        cache[quizId] = section.quiz;
                    }

                    return {
                        title: section.title,
                        skill: section.skill,
                        quiz: quizId,
                        order: section.order,
                        timeLimit: section.timeLimit || 0,
                    };
                });

                setQuizCache(cache);
                replace(sections);
            }
        } catch (error: any) {
            console.error("Error loading exam:", error);
            toast.error("Failed to load exam");
            router.push("/admin/exams");
        } finally {
            setLoading(false);
        }
    };

    const addSection = () => {
        append({
            title: "",
            skill: "reading",
            quiz: "",
            order: fields.length + 1,
            timeLimit: 0,
        });
    };

    const onSubmit = async (data: UpdateExamRequest) => {
        try {
            setSubmitting(true);

            const sectionsWithOrder = data.sections!.map((section, index) => ({
                ...section,
                order: index + 1,
            }));

            const response = await examService.updateExam(examId, {
                ...data,
                sections: sectionsWithOrder,
            });

            if (response.code === 200) {
                toast.success("Exam updated successfully!");
                router.push("/admin/exams");
            }
        } catch (error: any) {
            console.error("Error updating exam:", error);
            toast.error(error?.response?.data?.message || "Failed to update exam");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimeToSeconds = (hours: number, minutes: number) => {
        return hours * 3600 + minutes * 60;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-8 mx-auto">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Edit Exam</h1>
                <p className="text-gray-600 mt-1">
                    Update exam information and sections
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">
                                Exam Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                {...form.register("title", { required: true, minLength: 3 })}
                                placeholder="e.g., TOEIC Practice Test A"
                            />
                            {form.formState.errors.title && (
                                <p className="text-red-500 text-sm mt-1">
                                    Title is required (min 3 characters)
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...form.register("description")}
                                placeholder="Brief description of the exam..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.watch("status") || "draft"}
                                onValueChange={(value: any) =>
                                    form.setValue("status", value)
                                }
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-500 mt-1">
                                Draft exams are not visible to students
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="totalTimeLimit">
                                Total Time Limit <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Hours"
                                        min={0}
                                        defaultValue={Math.floor(form.watch("totalTimeLimit") / 3600)}
                                        onChange={(e) => {
                                            const hours = parseInt(e.target.value) || 0;
                                            const minutes =
                                                Math.floor((form.watch("totalTimeLimit") % 3600) / 60) || 0;
                                            form.setValue("totalTimeLimit", formatTimeToSeconds(hours, minutes));
                                        }}
                                    />
                                    <span className="text-xs text-gray-500">Hours</span>
                                </div>
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Minutes"
                                        min={0}
                                        max={59}
                                        defaultValue={Math.floor((form.watch("totalTimeLimit") % 3600) / 60)}
                                        onChange={(e) => {
                                            const minutes = parseInt(e.target.value) || 0;
                                            const hours =
                                                Math.floor(form.watch("totalTimeLimit") / 3600) || 0;
                                            form.setValue("totalTimeLimit", formatTimeToSeconds(hours, minutes));
                                        }}
                                    />
                                    <span className="text-xs text-gray-500">Minutes</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Total time: {Math.floor(form.watch("totalTimeLimit") / 3600)}h{" "}
                                {Math.floor((form.watch("totalTimeLimit") % 3600) / 60)}m
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Exam Sections</CardTitle>
                        <Button type="button" onClick={addSection} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Section
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No sections added yet. Click "Add Section" to create one.</p>
                            </div>
                        ) : (
                            fields.map((field, index) => {
                                const currentQuizId = form.watch(`sections.${index}.quiz`);
                                const currentSkill = form.watch(`sections.${index}.skill`);

                                return (
                                    <Card key={field.id} className="border-2">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-8">
                                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                                            {index + 1}
                                                        </span>
                                                        <div className="flex-1">
                                                            <Label>Section Title</Label>
                                                            <Input
                                                                {...form.register(`sections.${index}.title`, {
                                                                    required: true,
                                                                })}
                                                                placeholder="e.g., Listening Comprehension"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Skill</Label>
                                                            <Select
                                                                value={currentSkill}
                                                                onValueChange={(value: any) =>
                                                                    form.setValue(`sections.${index}.skill`, value)
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="listening">Listening</SelectItem>
                                                                    <SelectItem value="reading">Reading</SelectItem>
                                                                    <SelectItem value="writing">Writing</SelectItem>
                                                                    <SelectItem value="speaking">Speaking</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <Label>Time Limit (optional)</Label>
                                                            <Input
                                                                type="number"
                                                                {...form.register(`sections.${index}.timeLimit`, {
                                                                    valueAsNumber: true,
                                                                })}
                                                                placeholder="Seconds"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label>
                                                            Quiz <span className="text-red-500">*</span>
                                                        </Label>
                                                        <QuizPicker
                                                            value={currentQuizId}
                                                            onChange={(quizId) =>
                                                                form.setValue(`sections.${index}.quiz`, quizId)
                                                            }
                                                            skill={currentSkill}
                                                            initialQuiz={currentQuizId && quizCache[currentQuizId]}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
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
                        disabled={submitting || fields.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Update Exam
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
