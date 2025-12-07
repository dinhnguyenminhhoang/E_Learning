"use client";

import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuizQuestion {
    q: string;
    options: string[];
    answer: string;
}

interface QuizFormProps {
    questions: QuizQuestion[];
    onChange: (questions: QuizQuestion[]) => void;
}

export function QuizForm({ questions, onChange }: QuizFormProps) {
    const updateQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
        const newQuestions = [...questions];
        newQuestions[idx] = { ...newQuestions[idx], ...updates };
        onChange(newQuestions);
    };

    const removeQuestion = (idx: number) => {
        onChange(questions.filter((_, i) => i !== idx));
    };

    const addQuestion = () => {
        onChange([...questions, { q: "", options: ["", "", "", ""], answer: "" }]);
    };

    return (
        <div className="space-y-4">
            {questions.map((question, qIdx) => (
                <div key={qIdx} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                        <span className="font-medium text-sm">Question {qIdx + 1}</span>
                        {questions.length > 1 && (
                            <button
                                onClick={() => removeQuestion(qIdx)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Input
                        value={question.q}
                        onChange={(e) => updateQuestion(qIdx, { q: e.target.value })}
                        placeholder="Enter question..."
                        className="mb-3"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {question.options.map((opt, optIdx) => (
                            <Input
                                key={optIdx}
                                value={opt}
                                onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optIdx] = e.target.value;
                                    updateQuestion(qIdx, { options: newOptions });
                                }}
                                placeholder={`Option ${optIdx + 1}`}
                            />
                        ))}
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Correct Answer</label>
                        <select
                            value={question.answer}
                            onChange={(e) => updateQuestion(qIdx, { answer: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="">-- Select --</option>
                            {question.options.map((opt, i) => (
                                <option key={i} value={opt} disabled={!opt}>
                                    {opt || `(Option ${i + 1})`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-3 h-3 mr-1" /> Add Question
            </Button>
        </div>
    );
}
