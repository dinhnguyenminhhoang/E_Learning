"use client";

import { QuestionReview as QuestionReviewType } from "@/types/examAttempt.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WritingReviewCard } from "./WritingReviewCard";

interface QuestionReviewProps {
    question: QuestionReviewType;
    index: number;
}

export function QuestionReview({ question, index }: QuestionReviewProps) {
    const isCorrect = question.isCorrect;
    const hasAnswer = question.userAnswer.selectedAnswer || question.userAnswer.writingAnswer;

    return (
        <Card
            className={cn(
                "p-6 transition-all",
                isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}
        >
            <div className="flex items-start gap-4">
                {/* Question Number & Status */}
                <div className="flex items-center gap-3 shrink-0">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                            isCorrect
                                ? "bg-green-500 text-white"
                                : hasAnswer
                                ? "bg-red-500 text-white"
                                : "bg-gray-400 text-white"
                        )}
                    >
                        {index + 1}
                    </div>
                    {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : hasAnswer ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                    ) : (
                        <AlertCircle className="w-6 h-6 text-gray-400" />
                    )}
                </div>

                {/* Question Content */}
                <div className="flex-1 space-y-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {question.questionText}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {question.questionType}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs",
                                    isCorrect ? "text-green-700 border-green-300" : "text-red-700 border-red-300"
                                )}
                            >
                                {isCorrect ? "Correct" : hasAnswer ? "Incorrect" : "Not Answered"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                Points: {question.pointsEarned || 0} / {question.points || 0}
                            </Badge>
                        </div>
                    </div>

                    {/* Answer Display */}
                    <div className="space-y-2">
                        {question.questionType === "multiple_choice" ||
                        question.questionType === "true_false" ||
                        question.questionType === "fill_blank" ? (
                            <>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                                    <p
                                        className={cn(
                                            "text-base font-medium",
                                            isCorrect ? "text-green-700" : "text-red-700"
                                        )}
                                    >
                                        {question.userAnswer.selectedAnswer || "N/A"}
                                    </p>
                                </div>
                                {!isCorrect && question.correctAnswer?.text && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                                        <p className="text-base font-medium text-green-700">
                                            {question.correctAnswer.text}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : question.questionType === "matching" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Your Matches:</p>
                                    {question.userAnswer.matches && question.userAnswer.matches.length > 0 ? (
                                        <ul className="space-y-1">
                                            {question.userAnswer.matches.map((match: any, idx: number) => {
                                                const isMatchCorrect = question.correctAnswer?.matches?.some(
                                                    (cm: any) => cm.key === match.key && cm.value === match.value
                                                );
                                                return (
                                                    <li key={idx} className="text-sm text-gray-700">
                                                        <span className="font-medium">{match.key}</span> -{" "}
                                                        <span
                                                            className={cn(
                                                                isMatchCorrect ? "text-green-600" : "text-red-600"
                                                            )}
                                                        >
                                                            {match.value}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No matches made.</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Correct Matches:</p>
                                    {question.correctAnswer?.matches && question.correctAnswer.matches.length > 0 ? (
                                        <ul className="space-y-1">
                                            {question.correctAnswer.matches.map((match: any, idx: number) => (
                                                <li key={idx} className="text-sm text-green-600">
                                                    <span className="font-medium">{match.key}</span> - {match.value}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No correct matches defined.</p>
                                    )}
                                </div>
                            </div>
                        ) : question.questionType === "writing" ? (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                                <div className="p-3 bg-white border border-gray-200 rounded-md text-gray-800 whitespace-pre-wrap">
                                    {question.userAnswer.writingAnswer?.text || question.userAnswer.selectedAnswer || "N/A"}
                                </div>
                                {question.writingGrading && (
                                    <div className="mt-4">
                                        <WritingReviewCard
                                            userAnswer={
                                                question.userAnswer.writingAnswer?.text ||
                                                question.userAnswer.selectedAnswer ||
                                                ""
                                            }
                                            grading={question.writingGrading.grading}
                                            grammarErrors={question.writingGrading.grammar_errors || []}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">Unsupported question type for review.</p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

