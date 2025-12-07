"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { examAttemptService } from "@/services/examAttempt.service";
import { Question, Answer, ExamAttempt, SectionAttempt } from "@/Types/examAttempt.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Clock,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    Lock,
    AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { MultipleChoiceQuestion } from "@/components/exam/MultipleChoiceQuestion";
import { FillBlankQuestion } from "@/components/exam/FillBlankQuestion";
import { TrueFalseQuestion } from "@/components/exam/TrueFalseQuestion";
import { WritingQuestion } from "@/components/exam/WritingQuestion";

interface PageProps {
    params: Promise<{ examId: string }>;
}

export default function ExamTakingPage({ params }: PageProps) {
    const { examId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attemptId");

    const [examAttempt, setExamAttempt] = useState<ExamAttempt | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sectionStartTime] = useState(Date.now());

    useEffect(() => {
        if (attemptId && examAttempt) {
            loadSectionQuestions();
        }
    }, [currentSectionIndex, attemptId, examAttempt]);

    useEffect(() => {
        if (attemptId) {
            loadExamAttempt();
        }
    }, [attemptId]);

    const loadExamAttempt = async () => {
        if (!attemptId) return;

        try {
            const response = await examAttemptService.getExamResult(attemptId);
            if (response.code === 200) {
                setExamAttempt(response.data);
            }
        } catch (error) {
            console.error("Error loading exam attempt:", error);
            toast.error("Failed to load exam");
        }
    };

    const loadSectionQuestions = async () => {
        if (!attemptId || !examAttempt) return;

        const currentSection = examAttempt.sections[currentSectionIndex];
        if (!currentSection) return;

        try {
            setLoading(true);
            const response = await examAttemptService.getSectionQuestions(
                attemptId,
                currentSection.sectionId
            );

            if (response.code === 200) {
                setQuestions(response.data.questions);
            }
        } catch (error) {
            console.error("Error loading questions:", error);
            toast.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (answer: Answer) => {
        setAnswers(new Map(answers.set(answer.questionId, answer)));
    };

    const handleSubmitSection = async () => {
        if (!attemptId || !examAttempt) return;

        const currentSection = examAttempt.sections[currentSectionIndex];
        const answersArray = Array.from(answers.values());
        const timeSpent = Math.floor((Date.now() - sectionStartTime) / 1000);

        const unanswered = questions.filter(q => !answers.has(q._id));
        if (unanswered.length > 0) {
            toast.error(`Please answer all questions (${unanswered.length} remaining)`);
            return;
        }

        try {
            setSubmitting(true);
            const response = await examAttemptService.submitSection(
                attemptId,
                currentSection.sectionId,
                {
                    answers: answersArray,
                    timeSpent,
                }
            );

            if (response.code === 200) {
                toast.success("Section submitted successfully!");
                setAnswers(new Map());

                if (response.data.hasMoreSections) {
                    setCurrentSectionIndex(currentSectionIndex + 1);
                } else {
                    await handleCompleteExam();
                }
            }
        } catch (error: any) {
            console.error("Error submitting section:", error);
            toast.error(error?.response?.data?.message || "Failed to submit section");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteExam = async () => {
        if (!attemptId) return;

        try {
            const response = await examAttemptService.completeExam(attemptId);
            if (response.code === 200) {
                toast.success("Exam completed! Calculating results...");
                router.push(`/exams/results/${attemptId}`);
            }
        } catch (error) {
            console.error("Error completing exam:", error);
            toast.error("Failed to complete exam");
        }
    };

    const renderQuestion = (question: Question) => {
        const answer = answers.get(question._id);

        switch (question.type) {
            case "multiple_choice":
                return (
                    <MultipleChoiceQuestion
                        question={question}
                        answer={answer}
                        onChange={handleAnswerChange}
                    />
                );
            case "fill_blank":
                return (
                    <FillBlankQuestion
                        question={question}
                        answer={answer}
                        onChange={handleAnswerChange}
                    />
                );
            case "true_false":
                return (
                    <TrueFalseQuestion
                        question={question}
                        answer={answer}
                        onChange={handleAnswerChange}
                    />
                );
            case "writing":
                return (
                    <WritingQuestion
                        question={question}
                        answer={answer}
                        onChange={handleAnswerChange}
                    />
                );
            default:
                return <p className="text-gray-500">Unsupported question type</p>;
        }
    };

    if (!attemptId || !examAttempt) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Invalid exam attempt</p>
                </div>
            </div>
        );
    }

    const currentSection = examAttempt.sections[currentSectionIndex];
    const progress = ((currentSectionIndex + 1) / examAttempt.sections.length) * 100;
    const answeredCount = answers.size;

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Exam Progress</h2>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Section {currentSectionIndex + 1} of {examAttempt.sections.length}</span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                        {examAttempt.sections.map((section, index) => {
                            const isActive = index === currentSectionIndex;
                            const isCompleted = section.status === "completed";
                            const isLocked = index > currentSectionIndex;

                            return (
                                <button
                                    key={section.sectionId}
                                    disabled={isLocked}
                                    className={cn(
                                        "w-full text-left p-4 rounded-lg transition-all",
                                        isActive && "bg-blue-50 border-2 border-blue-500",
                                        isCompleted && "bg-green-50 border-2 border-green-500",
                                        isLocked && "opacity-50 cursor-not-allowed bg-gray-100",
                                        !isActive && !isCompleted && !isLocked && "border-2 border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            isActive && "bg-blue-500 text-white",
                                            isCompleted && "bg-green-500 text-white",
                                            isLocked && "bg-gray-300 text-gray-600",
                                            !isActive && !isCompleted && !isLocked && "bg-gray-200 text-gray-600"
                                        )}>
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : isLocked ? (
                                                <Lock className="w-4 h-4" />
                                            ) : (
                                                <span className="font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-semibold text-sm truncate",
                                                isActive && "text-blue-900",
                                                isCompleted && "text-green-900"
                                            )}>
                                                Section {index + 1}
                                            </p>
                                            <p className="text-xs text-gray-600 capitalize">
                                                {section.status}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Section {currentSectionIndex + 1}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {answeredCount} of {questions.length} answered
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-5 h-5" />
                            <span className="font-mono text-lg">--:--</span>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8">
                            {questions.map((question, index) => (
                                <Card key={question._id} className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            {renderQuestion(question)}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="bg-white border-t border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                            disabled={currentSectionIndex === 0 || submitting}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous Section
                        </Button>

                        <Button
                            onClick={handleSubmitSection}
                            disabled={submitting || answeredCount < questions.length}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="lg"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Submitting...
                                </>
                            ) : currentSectionIndex === examAttempt.sections.length - 1 ? (
                                "Finish Exam"
                            ) : (
                                <>
                                    Submit & Continue
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
