"use client";

import { Question, Answer } from "@/types/examAttempt.types";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrueFalseQuestionProps {
    question: Question;
    answer?: Answer;
    onChange: (answer: Answer) => void;
}

export function TrueFalseQuestion({
    question,
    answer,
    onChange,
}: TrueFalseQuestionProps) {
    const handleSelect = (value: "true" | "false") => {
        onChange({
            questionId: question._id,
            selectedAnswer: value,
            timeSpent: answer?.timeSpent || 0,
        });
    };

    const isTrue = answer?.selectedAnswer === "true";
    const isFalse = answer?.selectedAnswer === "false";

    return (
        <div className="space-y-4">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r">
                <p className="text-lg font-medium text-gray-900">{question.questionText}</p>
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={() => handleSelect("true")}
                    variant="outline"
                    className={cn(
                        "flex-1 h-20 text-lg",
                        isTrue && "border-green-500 bg-green-50 hover:bg-green-100"
                    )}
                >
                    <CheckCircle className={cn(
                        "w-6 h-6 mr-2",
                        isTrue ? "text-green-600" : "text-gray-400"
                    )} />
                    True
                </Button>

                <Button
                    onClick={() => handleSelect("false")}
                    variant="outline"
                    className={cn(
                        "flex-1 h-20 text-lg",
                        isFalse && "border-red-500 bg-red-50 hover:bg-red-100"
                    )}
                >
                    <XCircle className={cn(
                        "w-6 h-6 mr-2",
                        isFalse ? "text-red-600" : "text-gray-400"
                    )} />
                    False
                </Button>
            </div>
        </div>
    );
}
