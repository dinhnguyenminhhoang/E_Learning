"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, MessageSquareText, AlertTriangle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WritingReviewCardProps {
    userAnswer: string;
    grading: {
        score: number;
        level: string;
        overall_comment: string;
        suggestions: string[];
    };
    grammarErrors: Array<{
        message: string;
        shortMessage: string;
        replacements: Array<{ value: string }>;
        offset: number;
        length: number;
    }>;
}

export function WritingReviewCard({
    userAnswer,
    grading,
    grammarErrors,
}: WritingReviewCardProps) {
    const { score, level, overall_comment, suggestions } = grading;

    const getLevelColor = (lvl: string) => {
        switch (lvl.toUpperCase()) {
            case "A1":
            case "A2":
                return "bg-red-100 text-red-800";
            case "B1":
            case "B2":
                return "bg-yellow-100 text-yellow-800";
            case "C1":
            case "C2":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Function to highlight grammar errors
    const highlightGrammarErrors = (text: string, errors: any[]) => {
        if (!text) return null;
        const parts = [];
        let lastIndex = 0;

        errors.sort((a, b) => a.offset - b.offset).forEach((error, index) => {
            // Add text before the error
            if (error.offset > lastIndex) {
                parts.push(<span key={`text-before-${index}`}>{text.substring(lastIndex, error.offset)}</span>);
            }

            // Add the error part with tooltip
            const errorText = text.substring(error.offset, error.offset + error.length);
            parts.push(
                <TooltipProvider key={`error-${index}`}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="bg-red-200 text-red-800 cursor-help underline decoration-red-500 decoration-dotted">
                                {errorText}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm text-gray-700">
                            <p className="font-semibold mb-1">{error.message}</p>
                            {error.replacements && error.replacements.length > 0 && (
                                <p className="mt-1">
                                    Gợi ý:{" "}
                                    <span className="font-medium text-blue-600">
                                        {error.replacements.map((r: any) => r.value).join(", ")}
                                    </span>
                                </p>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
            lastIndex = error.offset + error.length;
        });

        // Add any remaining text after the last error
        if (lastIndex < text.length) {
            parts.push(<span key="text-after-last">{text.substring(lastIndex)}</span>);
        }

        return <>{parts}</>;
    };

    return (
        <Card className="border-orange-300 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5" /> AI Writing Feedback
                </CardTitle>
                <Badge className={getLevelColor(level)}>{level}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                    <div className="p-3 bg-white border border-gray-200 rounded-md text-gray-800">
                        {highlightGrammarErrors(userAnswer, grammarErrors) || userAnswer}
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Score:</p>
                    <div className="flex items-center gap-2">
                        <Progress value={score} className="w-full h-2" />
                        <span className="text-sm font-semibold text-orange-700">{score}%</span>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Overall Comment:</p>
                    <p className="text-gray-800 italic">{overall_comment}</p>
                </div>

                {suggestions && suggestions.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Lightbulb className="w-4 h-4 text-blue-500" /> Suggestions:
                        </p>
                        <ul className="list-disc list-inside text-gray-800 space-y-1">
                            {suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {grammarErrors && grammarErrors.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" /> Grammar Errors:
                        </p>
                        <ul className="list-disc list-inside text-gray-800 space-y-1">
                            {grammarErrors.map((error, i) => (
                                <li key={i}>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-help underline decoration-dotted">
                                                    {error.message}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm text-gray-700">
                                                <p className="font-semibold mb-1">{error.message}</p>
                                                {error.replacements && error.replacements.length > 0 && (
                                                    <p className="mt-1">
                                                        Gợi ý:{" "}
                                                        <span className="font-medium text-blue-600">
                                                            {error.replacements.map((r: any) => r.value).join(", ")}
                                                        </span>
                                                    </p>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

