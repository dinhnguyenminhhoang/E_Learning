"use client";

import { useState } from "react";
import { Star, Bookmark, Edit, Trash2, BookmarkCheck, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Word, UserWord, UserWordBookmark } from "@/services/word.service";

interface WordCardProps {
    word: Word | UserWord;
    type: "system" | "custom" | "bookmarked";
    bookmark?: UserWordBookmark;
    isBookmarked?: boolean;
    onToggleBookmark?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function WordCard({
    word,
    type,
    bookmark,
    isBookmarked,
    onToggleBookmark,
    onEdit,
    onDelete,
}: WordCardProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const getWordText = () => {
        if ("word" in word) return word.word;
        return "";
    };

    const getMeaning = () => {
        if (type === "custom") {
            return (word as UserWord).meaningVi;
        }
        if (type === "bookmarked" && bookmark) {
            return bookmark.word.definitions?.[0]?.meaningVi || "";
        }
        if ("definitions" in word) {
            return word.definitions?.[0]?.meaningVi || "";
        }
        return "";
    };

    const getLevel = () => {
        if ("level" in word) return word.level;
        return "beginner";
    };

    const handleSpeak = () => {
        const text = getWordText();
        if (!text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const levelColors = {
        beginner: "bg-green-100 text-green-700",
        intermediate: "bg-blue-100 text-blue-700",
        advanced: "bg-purple-100 text-purple-700",
        expert: "bg-red-100 text-red-700",
    };

    return (
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{getWordText()}</h3>
                        <button
                            onClick={handleSpeak}
                            disabled={isSpeaking}
                            className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                isSpeaking
                                    ? "bg-blue-500 text-white animate-pulse scale-110 shadow-lg shadow-blue-500/50"
                                    : "bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600"
                            )}
                            title="Nghe phát âm"
                        >
                            <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-bounce")} />
                        </button>
                    </div>
                    {"pronunciation" in word && word.pronunciation && (
                        <p className="text-sm text-gray-500">{word.pronunciation}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {type === "system" && onToggleBookmark && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onToggleBookmark}
                            className={cn(isBookmarked && "text-yellow-500")}
                        >
                            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        </Button>
                    )}
                    {type === "bookmarked" && onToggleBookmark && (
                        <Button size="sm" variant="ghost" onClick={onToggleBookmark} className="text-yellow-500">
                            <BookmarkCheck className="w-5 h-5" />
                        </Button>
                    )}
                    {type === "custom" && (
                        <>
                            {onEdit && (
                                <Button size="sm" variant="ghost" onClick={onEdit}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Meaning */}
            <p className="text-gray-700 mb-3">{getMeaning()}</p>

            {/* Example */}
            {"example" in word && word.example && (
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm italic text-gray-700">&quot;{word.example}&quot;</p>
                    {"exampleVi" in word && word.exampleVi && (
                        <p className="text-xs text-gray-600 mt-1">{word.exampleVi}</p>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex gap-2">
                    <Badge className={cn("text-xs", levelColors[getLevel() as keyof typeof levelColors] || levelColors.beginner)}>
                        {getLevel()}
                    </Badge>
                    {type === "custom" && "type" in word && (
                        <Badge variant="outline" className="text-xs">
                            {word.type}
                        </Badge>
                    )}
                    {type === "bookmarked" && bookmark?.masteryLevel !== undefined && (
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-3 h-3",
                                        i < bookmark.masteryLevel ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {type === "custom" && "tags" in word && word.tags && word.tags.length > 0 && (
                    <div className="flex gap-1">
                        {word.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
