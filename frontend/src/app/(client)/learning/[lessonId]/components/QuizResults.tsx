"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuizAttempt } from "@/services/block.service";
import { CheckCircle, XCircle, Award, TrendingUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizResultsProps {
    open: boolean;
    onClose: () => void;
    attempt: QuizAttempt | null;
    onRetry?: () => void;
    onContinue?: () => void;
}

export function QuizResults({ open, onClose, attempt, onRetry, onContinue }: QuizResultsProps) {
    if (!attempt) return null;

    const isPassed = attempt.percentage >= 65;
    const passingThreshold = 65;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">
                        Quiz Results
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className={cn(
                        "rounded-2xl p-8 text-center border-2",
                        isPassed
                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                            : "bg-gradient-to-br from-red-50 to-orange-50 border-red-300"
                    )}>
                        <div className={cn(
                            "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                            isPassed ? "bg-green-500" : "bg-red-500"
                        )}>
                            {isPassed ? (
                                <CheckCircle className="w-12 h-12 text-white" />
                            ) : (
                                <XCircle className="w-12 h-12 text-white" />
                            )}
                        </div>

                        <h3 className={cn(
                            "text-3xl font-bold mb-2",
                            isPassed ? "text-green-900" : "text-red-900"
                        )}>
                            {isPassed ? "Congratulations!" : "Keep Trying!"}
                        </h3>

                        <p className={cn(
                            "text-lg",
                            isPassed ? "text-green-700" : "text-red-700"
                        )}>
                            {isPassed
                                ? "You passed the quiz!"
                                : `You need ${passingThreshold}% to pass. Try again!`}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-600">Score</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {attempt.percentage.toFixed(0)}%
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-sm text-gray-600">Correct</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {attempt.correctAnswers}/{attempt.totalQuestions}
                            </p>
                        </div>
                    </div>

                    {isPassed && attempt.quiz.xpReward && (
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-300">
                            <div className="flex items-center justify-center gap-3">
                                <Award className="w-8 h-8 text-yellow-600" />
                                <div>
                                    <p className="text-sm text-yellow-700 font-semibold">XP Earned</p>
                                    <p className="text-2xl font-bold text-yellow-900">
                                        +{attempt.quiz.xpReward} XP
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center pt-4">
                        {!isPassed && onRetry && (
                            <Button
                                onClick={onRetry}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Retry Quiz
                            </Button>
                        )}

                        {isPassed && onContinue && (
                            <Button
                                onClick={onContinue}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Continue Learning
                            </Button>
                        )}

                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
