"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { VocabularyForm } from "./VocabularyForm";
import { GrammarForm } from "./GrammarForm";
import { QuizForm } from "./QuizForm";
import { MediaForm } from "./MediaForm";

interface EditBlockDialogProps {
    open: boolean;
    onClose: () => void;
    block: any;
    onChange: (updates: any) => void;
    onSubmit: () => void;
    cardDecks: any[];
}

export function EditBlockDialog({
    open,
    onClose,
    block,
    onChange,
    onSubmit,
    cardDecks,
}: EditBlockDialogProps) {
    if (!open || !block) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Edit Block</h2>
                        <span className="text-sm text-gray-500 capitalize">Type: {block.type}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Block Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={block.title || ""}
                            onChange={(e) => onChange({ title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                            value={block.description || ""}
                            onChange={(e) => onChange({ description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                        />
                    </div>

                    {/* Type-Specific Fields */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                            {block.type} Settings
                        </h3>

                        {block.type === "vocabulary" && (
                            <VocabularyForm
                                cardDeck={block.cardDeck?._id || block.cardDeck || ""}
                                cardDecks={cardDecks}
                                onChange={(cardDeck) => onChange({ cardDeck })}
                            />
                        )}

                        {block.type === "grammar" && (
                            <GrammarForm
                                data={{
                                    topic: block.topic || "",
                                    explanation: block.explanation || "",
                                    examples: block.examples || [""],
                                    videoUrl: block.videoUrl || "",
                                    sourceType: block.sourceType || "upload",
                                }}
                                onChange={(updates) => onChange(updates)}
                            />
                        )}

                        {block.type === "quiz" && (
                            <QuizForm
                                questions={block.questions || []}
                                onChange={(questions) => onChange({ questions })}
                            />
                        )}

                        {block.type === "media" && (
                            <MediaForm
                                data={{
                                    mediaType: block.mediaType || "video",
                                    sourceType: block.sourceType || "upload",
                                    sourceUrl: block.sourceUrl || "",
                                    transcript: block.transcript || "",
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
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
