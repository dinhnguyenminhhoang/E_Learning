"use client";

import { useState } from "react";
import { FileText, BookOpen, Languages, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabType = "transcript" | "summary" | "vocabulary";

interface VocabularyItem {
    word: string;
    meaning: string;
    example?: string;
}

interface VideoContentTabsProps {
    transcript?: string;
    summary?: string[];
    vocabulary?: VocabularyItem[];
}

export function VideoContentTabs({
    transcript = "",
    summary = [],
    vocabulary = []
}: VideoContentTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("transcript");
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = [
        { id: "transcript" as TabType, label: "Transcript", icon: Languages, count: transcript ? "1" : "0" },
        { id: "summary" as TabType, label: "Summary", icon: FileText, count: summary.length },
        { id: "vocabulary" as TabType, label: "Vocabulary", icon: BookOpen, count: vocabulary.length },
    ];

    return (
        <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-1 px-4 md:px-6 py-4 flex items-center justify-center gap-3 transition-all relative",
                                    "border-b-2 font-medium text-sm md:text-base",
                                    isActive
                                        ? "border-purple-600 text-purple-600 bg-white"
                                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                )}
                            >
                                <Icon className={cn(
                                    "w-4 h-4 md:w-5 md:h-5",
                                    isActive && "text-purple-600"
                                )} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                                    isActive
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-200 text-gray-600"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 min-h-[400px] max-h-[600px] overflow-y-auto">
                {activeTab === "transcript" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Languages className="w-5 h-5 text-purple-600" />
                                Vietnamese Transcript
                            </h3>
                            {transcript && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(transcript)}
                                    className="gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        {transcript ? (
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {transcript}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Languages className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">
                                    🤖 AI transcript will be generated here
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Vietnamese translation will appear automatically
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "summary" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Key Points Summary
                        </h3>

                        {summary.length > 0 ? (
                            <ul className="space-y-3">
                                {summary.map((point, index) => (
                                    <li
                                        key={index}
                                        className="flex gap-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                                    >
                                        <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-700 leading-relaxed flex-1">
                                            {point}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">
                                    🤖 AI summary will be generated here
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Key points will be extracted automatically
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "vocabulary" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            Vocabulary from Video
                        </h3>

                        {vocabulary.length > 0 ? (
                            <div className="grid gap-4">
                                {vocabulary.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-xl font-bold text-gray-900 mb-2">
                                                    {item.word}
                                                </h4>
                                                <p className="text-gray-700 mb-3">
                                                    {item.meaning}
                                                </p>
                                                {item.example && (
                                                    <div className="bg-white/60 rounded-lg p-3 border border-green-100">
                                                        <p className="text-sm text-gray-600 italic">
                                                            "{item.example}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white hover:bg-green-100 border-green-300"
                                            >
                                                Add to Deck
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">
                                    🤖 AI vocabulary extraction will appear here
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    New words will be identified automatically
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
