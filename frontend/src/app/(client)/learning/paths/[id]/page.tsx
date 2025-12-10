"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { learningPathService } from "@/services/learningPath.service";
import { userLearningPathService } from "@/services/userLearningPath.service";
import {
    GraduationCap,
    BookOpen,
    CheckCircle,
    Lock,
    Play,
    Target,
    ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Level {
    order: number;
    title: string;
    lessons: Array<{
        lesson: string | { _id: string; title: string };
        order: number;
        title?: string;
    }>;
    finalQuiz?: string;
}

interface LearningPathDetail {
    _id: string;
    title: string;
    description?: string;
    level: string;
    target?: {
        _id: string;
        name: string;
    };
    levels: Level[];
}

export default function LearningPathDetailPage() {
    const router = useRouter();
    const params = useParams();
    const pathId = params.id as string;

    const [path, setPath] = useState<LearningPathDetail | null>(null);
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        if (pathId) {
            fetchPathDetail();
        }
    }, [pathId]);

    const fetchPathDetail = async () => {
        try {
            setLoading(true);

            // Fetch path basic info
            const pathResponse = await learningPathService.getAllPath();
            if (pathResponse && (pathResponse as any).code === 200) {
                const foundPath = (pathResponse as any).data.find(
                    (p: any) => p._id === pathId
                );
                if (foundPath) {
                    setPath(foundPath);
                }
            }

            // Fetch levels hierarchy
            const levelsResponse = await learningPathService.getLearningPathHierarchy({
                learningPathId: pathId,
                isLevel: true,
            });
            if (levelsResponse && (levelsResponse as any).code === 200) {
                setLevels((levelsResponse as any).data);
            }

            // Check if user is enrolled (you may need to implement this API)
            // For now, we'll assume not enrolled
            setIsEnrolled(false);
        } catch (error) {
            console.error("Error fetching path detail:", error);
            toast.error("Failed to load learning path details");
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            // TODO: Implement enrollment API call
            // await userLearningPathService.enroll(pathId);
            toast.success("Successfully enrolled in learning path!");
            setIsEnrolled(true);
        } catch (error) {
            console.error("Error enrolling:", error);
            toast.error("Failed to enroll in learning path");
        } finally {
            setEnrolling(false);
        }
    };

    const handleStartLearning = () => {
        // Navigate to first lesson of first level
        if (levels.length > 0 && levels[0].lessons.length > 0) {
            const firstLesson = levels[0].lessons[0];
            const lessonId =
                typeof firstLesson.lesson === "string"
                    ? firstLesson.lesson
                    : firstLesson.lesson._id;
            router.push(`/learning/${lessonId}`);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "beginner":
                return "bg-green-100 text-green-700";
            case "intermediate":
                return "bg-yellow-100 text-yellow-700";
            case "advanced":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!path) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Learning Path Not Found
                    </h2>
                    <button
                        onClick={() => router.push("/learning/paths")}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Learning Paths
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Learning Paths</span>
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getLevelColor(
                                        path.level
                                    )}`}
                                >
                                    {path.level}
                                </span>
                                {path.target?.name && (
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full">
                                        <Target className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {path.target.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-4xl font-bold mb font-bold mb-4">{path.title}</h1>
                            <p className="text-lg text-white/90 max-w-3xl">
                                {path.description || "No description available"}
                            </p>

                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    <span className="font-medium">
                                        {levels.length} Levels
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    <span className="font-medium">
                                        {levels.reduce(
                                            (sum, level) => sum + level.lessons.length,
                                            0
                                        )}{" "}
                                        Lessons
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <GraduationCap className="w-16 h-16" />
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-8">
                        {isEnrolled ? (
                            <button
                                onClick={handleStartLearning}
                                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                <span>Continue Learning</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {enrolling ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                                        <span>Enrolling...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Enroll Now</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Levels Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Course Content
                </h2>

                <div className="space-y-4">
                    {levels.map((level, idx) => (
                        <div
                            key={level.order}
                            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                        >
                            {/* Level Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {level.order}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {level.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {level.lessons.length} lessons
                                                {level.finalQuiz && " + 1 quiz"}
                                            </p>
                                        </div>
                                    </div>
                                    {!isEnrolled && idx > 0 && (
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="divide-y divide-gray-100">
                                {level.lessons.map((lesson, lessonIdx) => {
                                    const lessonTitle =
                                        lesson.title ||
                                        (typeof lesson.lesson === "object"
                                            ? lesson.lesson.title
                                            : `Lesson ${lessonIdx + 1}`);
                                    const lessonId =
                                        typeof lesson.lesson === "string"
                                            ? lesson.lesson
                                            : lesson.lesson._id;

                                    return (
                                        <div
                                            key={lessonIdx}
                                            className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
                                            onClick={() => {
                                                if (isEnrolled || idx === 0) {
                                                    router.push(`/learning/${lessonId}`);
                                                } else {
                                                    toast.error(
                                                        "Please enroll to access this lesson"
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <BookOpen className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-700 font-medium">
                                                    {lessonTitle}
                                                </span>
                                            </div>
                                            {!isEnrolled && idx > 0 && (
                                                <Lock className="w-4 h-4 text-gray-300" />
                                            )}
                                        </div>
                                    );
                                })}

                                {level.finalQuiz && (
                                    <div className="px-6 py-4 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-purple-600" />
                                            <span className="text-purple-900 font-medium">
                                                Final Quiz
                                            </span>
                                        </div>
                                        {!isEnrolled && idx > 0 && (
                                            <Lock className="w-4 h-4 text-purple-300" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
