"use client";

import { Question, Answer } from "@/Types/examAttempt.types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MultipleChoiceQuestionProps {
    question: Question;
    answer?: Answer;
    onChange: (answer: Answer) => void;
}

export function MultipleChoiceQuestion({
    question,
    answer,
    onChange,
}: MultipleChoiceQuestionProps) {
    const handleSelect = (optionText: string) => {
        onChange({
            questionId: question._id,
            selectedAnswer: optionText,
            timeSpent: answer?.timeSpent || 0,
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                <p className="text-lg font-medium text-gray-900">{question.questionText}</p>
            </div>

            <div className="space-y-3">
                {question.options?.map((option, index) => {
                    const isSelected = answer?.selectedAnswer === option.text;

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(option.text)}
                            className={cn(
                                "w-full text-left p-4 rounded-lg border-2 transition-all",
                                isSelected
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                        isSelected
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-gray-400"
                                    )}
                                >
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
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
    );
}
