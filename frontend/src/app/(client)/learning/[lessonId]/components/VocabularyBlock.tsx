"use client";

import { useState, useEffect, useRef } from "react";
import { CardDeckInfo, Flashcard } from "@/types/block.types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Volume2, BookOpen, CheckCircle, X, FileText, Sparkles, Mic, MicOff, Loader2, TestTube2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ttsService } from "@/services/tts.service";
import { sttService, type PronunciationResult } from "@/services/stt.service";
import { toast } from "react-hot-toast";
import { AudioTestModal } from "@/components/audio/AudioTestModal";

interface VocabularyBlockProps {
    cardDeck: CardDeckInfo;
    flashcards: Flashcard[];
    onPrevious?: () => void;
    onNext?: () => void;
    onStartQuiz?: () => void;
    onContinue?: () => void;
    onAllLearnedChange?: (allLearned: boolean) => void;
    showStartQuizButton?: boolean;
    showContinueButton?: boolean;
    canGoPrevious?: boolean;
    canGoNext?: boolean;
}

export function VocabularyBlock({
    cardDeck,
    flashcards,
    onPrevious,
    onNext,
    onStartQuiz,
    onContinue,
    onAllLearnedChange,
    showStartQuizButton = false,
    showContinueButton = false,
    canGoPrevious = true,
    canGoNext = true,
}: VocabularyBlockProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [learnedCards, setLearnedCards] = useState<Set<string>>(new Set());
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Pronunciation recording states
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Audio test modal state
    const [isAudioTestModalOpen, setIsAudioTestModalOpen] = useState(false);

    // Add custom styles for 3D flip animation - only on client side after mount
    useEffect(() => {
        if (typeof document !== "undefined") {
            const style = document.createElement("style");
            style.textContent = `
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `;
            if (!document.head.querySelector("style[data-vocabulary-flip]")) {
                style.setAttribute("data-vocabulary-flip", "true");
                document.head.appendChild(style);
            }
        }
    }, []);

    const currentCard = flashcards[currentIndex];
    const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
    const learnedCount = learnedCards.size;
    const allCardsLearned = learnedCount === flashcards.length && flashcards.length > 0;

    useEffect(() => {
        if (onAllLearnedChange) {
            onAllLearnedChange(allCardsLearned);
        }
    }, [allCardsLearned, onAllLearnedChange]);

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
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

    const handleLearned = (cardId: string) => {
        if (!cardId) return;

        setLearnedCards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };

    const handleSpeak = (text?: string) => {
        if (!text) return;
        ttsService.speakWithLoading(text, setIsSpeaking, "en");
    };

    // Start recording for pronunciation practice
    const startRecording = async () => {
        try {
            setPronunciationResult(null);
            const stream = await sttService.requestMicrophonePermission();
            const recorder = sttService.createRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach(track => track.stop());

                // Process the recording
                await processRecording(audioBlob);
            };

            recorder.start();
            setIsRecording(true);
            toast.success("Đang ghi âm... Hãy đọc từ vựng!");
        } catch (error) {
            console.error("[Recording] Error:", error);
            toast.error("Không thể truy cập microphone");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Process the recorded audio
    const processRecording = async (audioBlob: Blob) => {
        const targetWord = word?.word || currentCard.frontText;
        if (!targetWord) return;

        setIsProcessing(true);
        try {
            const result = await sttService.checkPronunciation(audioBlob, targetWord);
            setPronunciationResult(result);

            if (result.isCorrect) {
                toast.success(`Tuyệt vời! Độ chính xác: ${result.accuracy}%`);
            } else {
                toast("Hãy thử lại nhé!", { icon: "🎯" });
            }
        } catch (error) {
            console.error("[STT] Error:", error);
            toast.error("Không thể xử lý giọng nói");
        } finally {
            setIsProcessing(false);
        }
    };

    // Reset pronunciation result when changing cards
    useEffect(() => {
        setPronunciationResult(null);
    }, [currentIndex]);

    if (!currentCard) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Không có thẻ từ vựng</p>
                </div>
            </div>
        );
    }

    const isLearned = learnedCards.has(currentCard._id);
    const word = currentCard.word;

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                            {cardDeck.title}
                        </h2>
                        {cardDeck.description && (
                            <p className="text-gray-600 text-base leading-relaxed">
                                {cardDeck.description}
                            </p>
                        )}
                    </div>
                    {cardDeck.thumbnail && (
                        <img
                            src={cardDeck.thumbnail}
                            alt={cardDeck.title}
                            className="w-24 h-24 rounded-xl object-cover ml-4"
                        />
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>
                            Thẻ {currentIndex + 1} / {flashcards.length}
                        </span>
                        <span className={cn(
                            "font-semibold transition-colors",
                            allCardsLearned && "text-green-600"
                        )}>
                            {learnedCount} / {flashcards.length} đã học
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-300 rounded-full",
                                allCardsLearned
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                            )}
                            style={{ width: `${(learnedCount / flashcards.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Completion Banner - Show when all cards are learned */}
          

            {/* Flashcard */}
            <div className="mb-6">
                <div
                    className={cn(
                        "relative w-full h-[400px] md:h-[500px] perspective-1000 cursor-pointer",
                        "transform-gpu"
                    )}
                    onClick={handleFlip}
                >
                    <div
                        className={cn(
                            "absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d",
                            isFlipped && "rotate-y-180"
                        )}
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {/* Front Side */}
                        <div
                            className={cn(
                                "absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl",
                                "bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200",
                                "flex flex-col items-center justify-center p-8"
                            )}
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                            }}
                        >
                            <div className="text-center w-full">
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                        {currentCard.difficulty?.toUpperCase() || "EASY"}
                                    </span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                    {currentCard.frontText}
                                </h3>
                                {word && word.pronunciation && (
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <span className="text-xl text-gray-600">
                                            {word.pronunciation}
                                        </span>
                                        {/* Speaker button - TTS */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSpeak(word.word || currentCard.frontText);
                                            }}
                                            disabled={isSpeaking}
                                            className={cn(
                                                "p-2 rounded-full transition-all duration-300 cursor-pointer",
                                                isSpeaking
                                                    ? "bg-blue-500 text-white animate-pulse scale-110 shadow-lg shadow-blue-500/50"
                                                    : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                                            )}
                                            title="Nghe phát âm"
                                        >
                                            <Volume2 className={cn("w-5 h-5", isSpeaking && "animate-bounce")} />
                                        </button>

                                        {/* Microphone button - Recording */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isRecording) {
                                                    stopRecording();
                                                } else {
                                                    startRecording();
                                                }
                                            }}
                                            disabled={isProcessing}
                                            className={cn(
                                                "p-2 rounded-full transition-all duration-300 cursor-pointer",
                                                isRecording
                                                    ? "bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-500/50"
                                                    : isProcessing
                                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                                        : "bg-green-100 hover:bg-green-200 text-green-600"
                                            )}
                                            title={isRecording ? "Dừng ghi âm" : "Đọc từ vựng"}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : isRecording ? (
                                                <MicOff className="w-5 h-5 animate-bounce" />
                                            ) : (
                                                <Mic className="w-5 h-5" />
                                            )}
                                        </button>

                                        {/* Audio Test button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsAudioTestModalOpen(true);
                                            }}
                                            className="p-2 rounded-full transition-all duration-300 cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-600"
                                            title="Kiểm tra âm thanh"
                                        >
                                            <TestTube2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {/* Pronunciation Result Display */}
                                {pronunciationResult && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                            "mt-4 p-4 rounded-xl border-2 transition-all",
                                            pronunciationResult.isCorrect
                                                ? "bg-green-50 border-green-300"
                                                : "bg-orange-50 border-orange-300"
                                        )}
                                    >
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <span className={cn(
                                                "text-3xl font-bold",
                                                pronunciationResult.isCorrect ? "text-green-600" : "text-orange-600"
                                            )}>
                                                {pronunciationResult.accuracy}%
                                            </span>
                                            {pronunciationResult.isCorrect ? (
                                                <CheckCircle className="w-8 h-8 text-green-500" />
                                            ) : (
                                                <span className="text-2xl">🎯</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Bạn đã nói: <span className="font-semibold">"{pronunciationResult.transcription}"</span>
                                        </p>
                                        {!pronunciationResult.isCorrect && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startRecording();
                                                }}
                                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                            >
                                                Thử lại
                                            </button>
                                        )}
                                    </div>
                                )}

                                {word && word.partOfSpeech && (
                                    <p className="text-sm text-gray-500 italic capitalize">
                                        {word.partOfSpeech}
                                    </p>
                                )}
                            </div>
                            <div className="absolute bottom-4 text-sm text-gray-500">
                                Nhấn để lật
                            </div>
                        </div>

                        {/* Back Side */}
                        <div
                            className={cn(
                                "absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl rotate-y-180",
                                "bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200",
                                "flex flex-col p-8 overflow-y-auto"
                            )}
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                            }}
                        >
                            <div className="w-full">
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                                        ĐÁP ÁN
                                    </span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    {currentCard.backText}
                                </h3>

                                {/* Word Information */}
                                {word && (
                                    <div className="space-y-4 mt-6">
                                        {/* Definitions */}
                                        {word.definitions && word.definitions.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                                    Định nghĩa:
                                                </h4>
                                                <ul className="space-y-2">
                                                    {word.definitions.map((def, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="bg-white/80 backdrop-blur p-4 rounded-lg border border-green-100"
                                                        >
                                                            <p className="text-gray-700 font-medium mb-1">
                                                                {def.meaning}
                                                            </p>
                                                            <p className="text-gray-600 text-sm">
                                                                {def.meaningVi}
                                                            </p>
                                                            {def.examples &&
                                                                def.examples.length > 0 && (
                                                                    <div className="mt-2 pt-2 border-t border-green-100">
                                                                        {def.examples.map(
                                                                            (ex, exIdx) => (
                                                                                <div
                                                                                    key={exIdx}
                                                                                    className="text-sm text-gray-600 italic"
                                                                                >
                                                                                    "{ex.sentence}"
                                                                                    {ex.translation && (
                                                                                        <span className="block text-gray-500 mt-1">
                                                                                            {ex.translation}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Synonyms & Antonyms */}
                                        {((word.synonyms && word.synonyms.length > 0) ||
                                            (word.antonyms && word.antonyms.length > 0)) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {word.synonyms && word.synonyms.length > 0 && (
                                                        <div className="bg-white/80 backdrop-blur p-4 rounded-lg border border-green-100">
                                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                                Từ đồng nghĩa:
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {word.synonyms.map((syn, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                                                    >
                                                                        {syn}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {word.antonyms && word.antonyms.length > 0 && (
                                                        <div className="bg-white/80 backdrop-blur p-4 rounded-lg border border-green-100">
                                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                                Từ trái nghĩa:
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {word.antonyms.map((ant, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                                                                    >
                                                                        {ant}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        {/* Image */}
                                        {word.image && (
                                            <div className="mt-4">
                                                <img
                                                    src={word.image}
                                                    alt={word.word}
                                                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="rounded-full cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <Button
                        variant={isLearned ? "default" : "outline"}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (currentCard._id) {
                                handleLearned(currentCard._id);
                            }
                        }}
                        className={cn(
                            "rounded-full cursor-pointer",
                            isLearned &&
                            "bg-green-600 hover:bg-green-700 text-white border-green-600"
                        )}
                    >
                        {isLearned ? (
                            <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Đã học
                            </>
                        ) : (
                            <>
                                <X className="w-5 h-5 mr-2" />
                                Đánh dấu đã học
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        disabled={currentIndex === flashcards.length - 1}
                        className="rounded-full cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>


            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className="flex-1 md:flex-none cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Trước
                </Button>

                {showStartQuizButton && !allCardsLearned && onStartQuiz && (
                    <Button
                        onClick={onStartQuiz}
                        className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 cursor-pointer"
                    >
                        Bắt đầu làm bài
                    </Button>
                )}

                {showContinueButton && onContinue && (
                    <Button
                        onClick={onContinue}
                        className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 cursor-pointer"
                    >
                        Tiếp tục
                    </Button>
                )}

                <Button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                    Tiếp theo
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Audio Test Modal */}
            <AudioTestModal
                isOpen={isAudioTestModalOpen}
                onClose={() => setIsAudioTestModalOpen(false)}
            />
        </div>
    );
}







