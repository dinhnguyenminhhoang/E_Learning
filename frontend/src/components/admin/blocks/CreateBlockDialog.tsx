"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { VocabularyForm } from "./VocabularyForm";
import { GrammarForm } from "./GrammarForm";
import { QuizForm, QuizQuestion } from "./QuizForm";
import { MediaForm } from "./MediaForm";

export type BlockType = "vocabulary" | "grammar" | "quiz" | "media";

export interface BlockFormData {
    title: string;
    description: string;
    type: BlockType;
    skill: string;
    difficulty: string;
    // Type-specific
    cardDeck: string;
    topic: string;
    explanation: string;
    examples: string[];
    videoUrl: string;
    sourceType: "upload" | "youtube";
    mediaType: "video" | "audio";
    sourceUrl: string;
    transcript: string;
    questions: QuizQuestion[];
}

interface CreateBlockDialogProps {
    open: boolean;
    onClose: () => void;
    data: BlockFormData;
    onChange: (updates: Partial<BlockFormData>) => void;
    onSubmit: () => void;
    cardDecks: any[];
    onTypeChange: (type: BlockType) => void;
}

export function CreateBlockDialog({
    open,
    onClose,
    data,
    onChange,
    onSubmit,
    cardDecks,
    onTypeChange,
}: CreateBlockDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">Create New Block</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Common Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold mb-2">
                                Block Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={data.title}
                                onChange={(e) => onChange({ title: e.target.value })}
                                placeholder="e.g., Vocabulary: Common Verbs"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Block Type</label>
                            <select
                                value={data.type}
                                onChange={(e) => onTypeChange(e.target.value as BlockType)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="vocabulary">Vocabulary</option>
                                <option value="grammar">Grammar</option>
                                <option value="quiz">Quiz</option>
                                <option value="media">Media</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Difficulty</label>
                            <select
                                value={data.difficulty}
                                onChange={(e) => onChange({ difficulty: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => onChange({ description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                        />
                    </div>

                    {/* Type-Specific Fields */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                            {data.type} Settings
                        </h3>

                        {data.type === "vocabulary" && (
                            <VocabularyForm
                                cardDeck={data.cardDeck}
                                cardDecks={cardDecks}
                                onChange={(cardDeck) => onChange({ cardDeck })}
                            />
                        )}

                        {data.type === "grammar" && (
                            <GrammarForm
                                data={{
                                    topic: data.topic,
                                    explanation: data.explanation,
                                    examples: data.examples,
                                    videoUrl: data.videoUrl,
                                    sourceType: data.sourceType,
                                }}
                                onChange={(updates) => onChange(updates)}
                            />
                        )}

                        {data.type === "quiz" && (
                            <QuizForm
                                questions={data.questions}
                                onChange={(questions) => onChange({ questions })}
                            />
                        )}

                        {data.type === "media" && (
                            <MediaForm
                                data={{
                                    mediaType: data.mediaType,
                                    sourceType: data.sourceType,
                                    sourceUrl: data.sourceUrl,
                                    transcript: data.transcript,
                                }}
                                onChange={(updates) => onChange(updates)}
                            />
                        )}
                    </div>
                </div>

                <div className="p-4 border-t flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Create Block
                    </Button>
                </div>
            </div>
        </div>
    );
}
