"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Volume2, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SpellCheckPractice } from "./SpellCheckPractice";

interface FlashCard {
    word: string;
    pronunciation?: string;
    meaning: string;
    example?: string;
    image?: string;
}

interface FlashcardCarouselProps {
    cards: FlashCard[];
    onComplete?: () => void;
    enableSpellCheck?: boolean;
}

export function FlashcardCarousel({ cards, onComplete, enableSpellCheck = true }: FlashcardCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
    const [practiceMode, setPracticeMode] = useState<"flashcard" | "spell">("flashcard");
    const currentCard = cards[currentIndex];
    const progress = Math.round(((currentIndex + 1) / cards.length) * 100);

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            markCompleted();
        } else if (completedCards.size === cards.length && onComplete) {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const markCompleted = () => {
        setCompletedCards(prev => new Set([...prev, currentIndex]));
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">
                        Card {currentIndex + 1} of {cards.length}
                    </span>
                    <span className="font-semibold text-purple-600">
                        {completedCards.size}/{cards.length} completed
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Mode Toggle */}
            {enableSpellCheck && (
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setPracticeMode("flashcard")}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
                            practiceMode === "flashcard"
                                ? "bg-white shadow text-purple-600"
                                : "text-gray-600 hover:text-gray-900"
                        )}
                    >
                        🎴 Flashcards
                    </button>
                    <button
                        onClick={() => setPracticeMode("spell")}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
                            practiceMode === "spell"
                                ? "bg-white shadow text-purple-600"
                                : "text-gray-600 hover:text-gray-900"
                        )}
                    >
                        <PenTool className="w-4 h-4 inline mr-1" />
                        Spell Check
                    </button>
                </div>
            )}

            {/* Conditional Content: Flashcard or Spell Check */}
            {practiceMode === "spell" ? (
                <SpellCheckPractice
                    word={currentCard.word}
                    meaning={currentCard.meaning}
                    example={currentCard.example}
                    onComplete={handleNext}
                />
            ) : (
                <div className="perspective-1000">
                    <div
                        className={cn(
                            "relative w-full h-96 transition-transform duration-700 preserve-3d cursor-pointer",
                            isFlipped && "rotate-y-180"
                        )}
                        onClick={handleFlip}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {/* Front Side */}
                        <div
                            className={cn(
                                "absolute inset-0 backface-hidden rounded-3xl shadow-2xl",
                                "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500",
                                "flex flex-col items-center justify-center p-8"
                            )}
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <div className="text-center space-y-6">
                                <div className="inline-block">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur">
                                        <Volume2 className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                                    {currentCard.word}
                                </h2>

                                {currentCard.pronunciation && (
                                    <p className="text-xl text-white/90 font-medium">
                                        /{currentCard.pronunciation}/
                                    </p>
                                )}

                                <div className="pt-6">
                                    <p className="text-white/80 text-sm font-medium">
                                        Click to flip →
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Back Side */}
                        <div
                            className={cn(
                                "absolute inset-0 backface-hidden rounded-3xl shadow-2xl rotate-y-180",
                                "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500",
                                "flex flex-col items-center justify-center p-8"
                            )}
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                            <div className="text-center space-y-6 text-white">
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-bold drop-shadow-lg">
                                        Meaning
                                    </h3>
                                    <p className="text-2xl font-medium leading-relaxed">
                                        {currentCard.meaning}
                                    </p>
                                </div>

                                {currentCard.example && (
                                    <div className="pt-6 space-y-2">
                                        <h4 className="text-lg font-semibold opacity-90">
                                            Example:
                                        </h4>
                                        <p className="text-lg italic opacity-80 bg-white/10 rounded-2xl p-4 backdrop-blur">
                                            "{currentCard.example}"
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <p className="text-white/70 text-sm font-medium">
                                        Click to flip back ←
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex-1 md:flex-none"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleFlip}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                >
                    <RotateCw className="w-5 h-5 mr-2" />
                    Flip Card
                </Button>

                <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1 && completedCards.size < cards.length}
                    className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                    {currentIndex === cards.length - 1 ? "Complete" : "Next"}
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>

            {/* Helper Text */}
            <div className="text-center">
                <p className="text-sm text-gray-500">
                    💡 Tip: Click on the card to flip it and see the meaning
                </p>
            </div>

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}
