"use client";

import { BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";

interface GrammarContentProps {
    title: string;
    description?: string;
    topic?: string;
    explanation?: string;
    examples?: string[];
}

export function GrammarContent({
    title,
    description,
    topic,
    explanation,
    examples = []
}: GrammarContentProps) {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
                        {description && (
                            <p className="text-xl text-white/90 leading-relaxed">{description}</p>
                        )}
                        {topic && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur">
                                <span className="text-sm font-semibold">Topic:</span>
                                <span className="text-sm">{topic}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Explanation Section */}
            {explanation && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                        <div className="flex items-center gap-3 text-white">
                            <Lightbulb className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Explanation</h2>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                                {explanation}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Examples Section */}
            {examples.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                        <div className="flex items-center gap-3 text-white">
                            <CheckCircle2 className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Examples</h2>
                            <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                                {examples.length} examples
                            </span>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="grid gap-4">
                            {examples.map((example, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-300 hover:shadow-lg transition-all"
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                            <span className="text-white font-bold text-lg">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <p className="flex-1 text-gray-800 text-lg leading-relaxed font-medium">
                                            {example}
                                        </p>
                                    </div>

                                    {/* Decorative corner */}
                                    <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!explanation && examples.length === 0 && (
                <div className="bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No content available
                    </h3>
                    <p className="text-gray-500">
                        Grammar content will be displayed here
                    </p>
                </div>
            )}
        </div>
    );
}
