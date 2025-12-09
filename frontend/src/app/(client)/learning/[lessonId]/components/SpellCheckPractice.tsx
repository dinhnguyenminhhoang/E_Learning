"use client";

import { useState } from "react";
import { Check, X, Lightbulb, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VoiceRecordModal } from "./VoiceRecordModal";

interface SpellCheckPracticeProps {
    word: string;
    meaning: string;
    example?: string;
    onComplete?: () => void;
}

export function SpellCheckPractice({
    word,
    meaning,
    example,
    onComplete
}: SpellCheckPracticeProps) {
    const [userInput, setUserInput] = useState("");
    const [showHint, setShowHint] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
    const [showVoiceModal, setShowVoiceModal] = useState(false);

    const handleVoiceSubmit = (text: string) => {
        setUserInput(text);
        setTimeout(() => {
            checkSpelling();
        }, 500);
    };

    const checkSpelling = () => {
        const isCorrect = userInput.toLowerCase().trim() === word.toLowerCase();
        setFeedback(isCorrect ? "correct" : "incorrect");
        setAttempts(attempts + 1);

        if (isCorrect && onComplete) {
            setTimeout(() => {
                onComplete();
            }, 1500);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && userInput.trim()) {
            checkSpelling();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
                {/* Instructions */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-2">
                        Spell the Word
                    </h3>
                    <p className="text-indigo-700 text-lg">
                        {meaning}
                    </p>
                </div>

                {/* Example sentence */}
                {example && (
                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 mb-6 border border-indigo-100">
                        <p className="text-sm text-gray-600 mb-1 font-semibold">Example:</p>
                        <p className="text-gray-800 italic">"{example}"</p>
                    </div>
                )}

                {/* Input Area */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => {
                            setUserInput(e.target.value);
                            setFeedback(null);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Type the word here..."
                        className={cn(
                            "w-full px-6 py-4 text-xl font-medium rounded-xl border-2 transition-all",
                            "focus:outline-none focus:ring-4",
                            feedback === "correct"
                                ? "border-green-500 bg-green-50 focus:ring-green-200"
                                : feedback === "incorrect"
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-indigo-300 bg-white focus:ring-indigo-200 focus:border-indigo-500"
                        )}
                        disabled={feedback === "correct"}
                    />

                    {/* Feedback Icon */}
                    {feedback && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {feedback === "correct" ? (
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                    <Check className="w-6 h-6 text-white" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-shake">
                                    <X className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Feedback Message */}
                {feedback && (
                    <div className={cn(
                        "text-center py-3 px-4 rounded-lg mb-4 font-semibold",
                        feedback === "correct"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    )}>
                        {feedback === "correct"
                            ? "🎉 Perfect! Moving to next word..."
                            : `❌ Try again! Attempt ${attempts}`
                        }
                    </div>
                )}

                {/* Hint Section */}
                {showHint && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                        <p className="text-yellow-900 font-medium">
                            💡 Hint: The word starts with "<span className="font-bold text-lg">{word[0].toUpperCase()}</span>"
                            and has {word.length} letters
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    <Button
                        onClick={() => setShowHint(!showHint)}
                        variant="outline"
                        className="border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                        disabled={feedback === "correct"}
                    >
                        <Lightbulb className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">{showHint ? "Hide" : "Show"} Hint</span>
                    </Button>

                    <Button
                        onClick={() => setShowVoiceModal(true)}
                        variant="outline"
                        className="border-pink-300 bg-pink-50 hover:bg-pink-100"
                        disabled={feedback === "correct"}
                    >
                        <Mic className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Voice</span>
                    </Button>

                    <Button
                        onClick={checkSpelling}
                        disabled={!userInput.trim() || feedback === "correct"}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        <Send className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Check</span>
                    </Button>
                </div>

                {/* Attempts Counter */}
                <div className="text-center mt-4 text-sm text-gray-500">
                    Attempts: {attempts}
                </div>
            </div>

            {/* Voice Recording Modal */}
            <VoiceRecordModal
                isOpen={showVoiceModal}
                onClose={() => setShowVoiceModal(false)}
                onSubmit={handleVoiceSubmit}
                targetWord={word}
            />

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
