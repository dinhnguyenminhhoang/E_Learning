"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuizQuestion, QuizAttempt, QuizAnswer } from "@/services/block.service";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface QuizModalProps {
    open: boolean;
    onClose: () => void;
    attempt: QuizAttempt | null;
    questions: QuizQuestion[];
    onSubmit: (answers: QuizAnswer[]) => Promise<void>;
}

export function QuizModal({ open, onClose, attempt, questions, onSubmit }: QuizModalProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string>>(new Map());
    const [questionStartTime, setQuestionStartTime] = useState<Map<string, number>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && questions.length > 0) {
            const questionId = questions[currentQuestionIndex]._id;
            if (!questionStartTime.has(questionId)) {
                setQuestionStartTime(new Map(questionStartTime.set(questionId, Date.now())));
            }
        }
    }, [currentQuestionIndex, open, questions]);

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion ? answers.get(currentQuestion._id) : undefined;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const allAnswered = questions.every(q => answers.has(q._id));

    const handleSelectAnswer = (answer: string) => {
        if (!currentQuestion) return;
        setAnswers(new Map(answers.set(currentQuestion._id, answer)));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!allAnswered || !attempt) return;

        setIsSubmitting(true);
        try {
            const quizAnswers: QuizAnswer[] = questions.map(question => {
                const startTime = questionStartTime.get(question._id) || Date.now();
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);

                return {
                    questionId: question._id,
                    selectedAnswer: answers.get(question._id) || "",
                    timeSpent,
                };
            });

            await onSubmit(quizAnswers);
            setAnswers(new Map());
            setQuestionStartTime(new Map());
            setCurrentQuestionIndex(0);
        } catch (error) {
            console.error("Error submitting quiz:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentQuestion) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {attempt?.quiz.title || "Quiz"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {answers.size} answered
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {currentQuestion.questionText}
                        </h3>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === option.text;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAnswer(option.text)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border-2 transition-all",
                                            isSelected
                                                ? "border-blue-500 bg-blue-100 shadow-md"
                                                : "border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                    isSelected
                                                        ? "border-blue-500 bg-blue-500"
                                                        : "border-gray-400"
                                                )}
                                            >
                                                {isSelected && (
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-base",
                                                isSelected ? "font-semibold text-blue-900" : "text-gray-700"
                                            )}>
                                                {option.text}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {!isLastQuestion ? (
                                <Button onClick={handleNext} disabled={!selectedAnswer}>
                                    Next Question
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!allAnswered || isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
