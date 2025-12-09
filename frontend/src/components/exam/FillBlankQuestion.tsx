"use client";

import { Question, Answer } from "@/types/examAttempt.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FillBlankQuestionProps {
    question: Question;
    answer?: Answer;
    onChange: (answer: Answer) => void;
}

export function FillBlankQuestion({
    question,
    answer,
    onChange,
}: FillBlankQuestionProps) {
    const handleChange = (value: string) => {
        onChange({
            questionId: question._id,
            selectedAnswer: value,
            timeSpent: answer?.timeSpent || 0,
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                <p className="text-lg font-medium text-gray-900">{question.questionText}</p>
            </div>

            <div>
                <Label htmlFor={`answer-${question._id}`} className="text-sm font-medium">
                    Your Answer:
                </Label>
                <Input
                    id={`answer-${question._id}`}
                    value={answer?.selectedAnswer || ""}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="mt-2"
                />
            </div>
        </div>
    );
}
