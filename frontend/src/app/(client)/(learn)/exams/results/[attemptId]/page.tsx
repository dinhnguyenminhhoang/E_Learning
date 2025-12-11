"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { examAttemptService } from "@/services/examAttempt.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    Award,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { QuestionReview } from "@/components/exam/QuestionReview";
import { WritingReviewCard } from "@/components/exam/WritingReviewCard";
import { List } from "lucide-react";

interface PageProps {
    params: Promise<{ attemptId: string }>;
}

export default function ExamResultsPage({ params }: PageProps) {
    const { attemptId } = use(params);
    const router = useRouter();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        try {
            setLoading(true);
            const response = await examAttemptService.getExamResult(attemptId);
            if (response.code === 200) {
                setResult(response.data);
            }
        } catch (error) {
            console.error("Error loading results:", error);
            toast.error("Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600 bg-green-100";
        if (percentage >= 75) return "text-blue-600 bg-blue-100";
        if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
        return "text-red-600 bg-red-100";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Results not found</p>
                </div>
            </div>
        );
    }

    const isPassed = result.totalPercentage >= 65;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <div className="mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/exams")}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Exams
                </Button>

                <Card className="mb-8 border-none shadow-2xl bg-gradient-to-br from-white to-blue-50">
                    <CardContent className="p-12 text-center">
                        <div className="mb-6">
                            {isPassed ? (
                                <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
                            ) : (
                                <Award className="w-24 h-24 text-gray-400 mx-auto" />
                            )}
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {isPassed ? "Congratulations!" : "Exam Completed"}
                        </h1>

                        <p className="text-xl text-gray-600 mb-8">
                            {isPassed
                                ? "You've successfully passed the exam!"
                                : "Keep practicing and try again!"}
                        </p>

                        <div className="flex items-center justify-center gap-12">
                            <div>
                                <p className="text-gray-600 mb-2">Total Score</p>
                                <div className={`text-6xl font-bold ${getGradeColor(result.totalPercentage)}`}>
                                    {Math.round(result.totalPercentage)}%
                                </div>
                            </div>

                            <div className="h-24 w-px bg-gray-300" />

                            <div>
                                <p className="text-gray-600 mb-2">Points Earned</p>
                                <div className="text-5xl font-bold text-blue-600">
                                    {result.totalScore}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-6 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>Time: {formatTime(result.totalTimeSpent || 0)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isPassed ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span>{isPassed ? "Passed" : "Not Passed"} (Required: 65%)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-6 h-6" />
                            Section Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {result.sections?.map((section: any, index: number) => (
                                <div
                                    key={section.sectionId}
                                    className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg capitalize">
                                                    {section.skill || `Section ${index + 1}`}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {section.timeSpent ? formatTime(section.timeSpent) : "--"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <Badge className={getGradeColor(section.percentage || 0)}>
                                                {Math.round(section.percentage || 0)}%
                                            </Badge>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Score: {section.score || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed Questions Review */}
                                    {section.detailedQuestions && section.detailedQuestions.length > 0 && (
                                        <div className="mt-6 space-y-4">
                                            <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                                <List className="w-5 h-5" />
                                                Question Review
                                            </h4>
                                            {section.detailedQuestions.map((question: any, qIndex: number) => (
                                                <QuestionReview
                                                    key={question.questionId}
                                                    question={question}
                                                    index={qIndex}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="mt-8 flex justify-center gap-4">
                    <Button
                        onClick={() => router.push("/exams")}
                        variant="outline"
                        size="lg"
                    >
                        View All Exams
                    </Button>
                    {!isPassed && (
                        <Button
                            onClick={() => router.push("/exams")}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="lg"
                        >
                            Try Again
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
