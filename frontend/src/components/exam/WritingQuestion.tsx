"use client";

import { useState, useEffect } from "react";
import { Question, Answer } from "@/types/examAttempt.types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface WritingQuestionProps {
    question: Question;
    answer?: Answer;
    onChange: (answer: Answer) => void;
}

export function WritingQuestion({
    question,
    answer,
    onChange,
}: WritingQuestionProps) {
    const [text, setText] = useState(answer?.writingAnswer?.text || "");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange({
                questionId: question._id,
                writingAnswer: {
                    text,
                    wordCount,
                },
                timeSpent: answer?.timeSpent || 0,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [text]);

    return (
        <div className="space-y-4">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r">
                <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-orange-600 shrink-0 mt-1" />
                    <p className="text-lg font-medium text-gray-900">{question.questionText}</p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label htmlFor={`writing-${question._id}`} className="text-sm font-medium">
                        Your Essay:
                    </Label>
                    <span className="text-sm text-gray-600">
                        {wordCount} {wordCount === 1 ? "word" : "words"}
                    </span>
                </div>
                <Textarea
                    id={`writing-${question._id}`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your response here..."
                    rows={12}
                    className="resize-none"
                />
            </div>
        </div>
    );
}
