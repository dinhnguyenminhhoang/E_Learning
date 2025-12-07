"use client";

import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GrammarFormData {
    topic: string;
    explanation: string;
    examples: string[];
    videoUrl: string;
    sourceType: string;
}

interface GrammarFormProps {
    data: GrammarFormData;
    onChange: (data: Partial<GrammarFormData>) => void;
}

export function GrammarForm({ data, onChange }: GrammarFormProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Topic <span className="text-red-500">*</span>
                </label>
                <Input
                    value={data.topic}
                    onChange={(e) => onChange({ topic: e.target.value })}
                    placeholder="e.g., Present Perfect Tense"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">
                    Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={data.explanation}
                    onChange={(e) => onChange({ explanation: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    placeholder="Explain the grammar rule..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Examples</label>
                {data.examples.map((ex, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                        <Input
                            value={ex}
                            onChange={(e) => {
                                const newExamples = [...data.examples];
                                newExamples[idx] = e.target.value;
                                onChange({ examples: newExamples });
                            }}
                            placeholder={`Example ${idx + 1}`}
                        />
                        {data.examples.length > 1 && (
                            <button
                                onClick={() => {
                                    const newExamples = data.examples.filter((_, i) => i !== idx);
                                    onChange({ examples: newExamples });
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange({ examples: [...data.examples, ""] })}
                >
                    <Plus className="w-3 h-3 mr-1" /> Add Example
                </Button>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Video URL (optional)</label>
                <Input
                    value={data.videoUrl}
                    onChange={(e) => onChange({ videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                />
            </div>
        </div>
    );
}
