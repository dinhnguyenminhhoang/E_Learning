"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuizQuestion, QuizAttempt, QuizAnswer } from "@/services/block.service";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, ArrowRight, Link2, Check, X } from "lucide-react";

interface QuizModalProps {
    open: boolean;
    onClose: () => void;
    attempt: QuizAttempt | null;
    questions: QuizQuestion[];
    onSubmit: (answers: QuizAnswer[]) => Promise<void>;
}

export function QuizModal({ open, onClose, attempt, questions, onSubmit }: QuizModalProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string>>(new Map());
    const [questionStartTime, setQuestionStartTime] = useState<Map<string, number>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State for matching question: track selected left item and matches
    const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(null);
    const [matchingPairs, setMatchingPairs] = useState<Map<string, Map<string, string>>>(new Map());

    useEffect(() => {
        if (open && questions.length > 0) {
            const questionId = questions[currentQuestionIndex]._id;
            if (!questionStartTime.has(questionId)) {
                setQuestionStartTime(new Map(questionStartTime.set(questionId, Date.now())));
            }
            // Reset matching state when changing questions
            setSelectedLeftItem(null);
        }
    }, [currentQuestionIndex, open, questions]);

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion ? answers.get(currentQuestion._id) : undefined;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const allAnswered = questions.every(q => answers.has(q._id));

    const handleSelectAnswer = (answer: string) => {
        if (!currentQuestion) return;
        setAnswers(new Map(answers.set(currentQuestion._id, answer)));
    };

    const handleFillBlankChange = (value: string) => {
        if (!currentQuestion) return;
        setAnswers(new Map(answers.set(currentQuestion._id, value)));
    };

    // Parse matching options into left and right items
    const parseMatchingOptions = (question: QuizQuestion) => {
        const separators = [" - ", " – ", " — ", "-"];
        const leftItems: Array<{ id: string; text: string }> = [];
        const rightItems: Array<{ id: string; text: string }> = [];
        const pairs: Map<string, string> = new Map(); // left -> right mapping

        question.options.forEach((option, index) => {
            let left = "";
            let right = "";
            
            for (const sep of separators) {
                const parts = option.text.split(sep);
                if (parts.length >= 2) {
                    left = parts[0].trim();
                    right = parts.slice(1).join(sep).trim();
                    break;
                }
            }
            
            if (left && right) {
                const leftId = `left-${index}`;
                const rightId = `right-${index}`;
                leftItems.push({ id: leftId, text: left });
                rightItems.push({ id: rightId, text: right });
                pairs.set(leftId, rightId);
            }
        });

        // Shuffle right items for better UX
        const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);
        
        return { leftItems, rightItems: shuffledRight, pairs };
    };

    // Handle matching: click left item to select, then click right item to match
    const handleMatchingLeftClick = (leftId: string) => {
        setSelectedLeftItem(selectedLeftItem === leftId ? null : leftId);
    };

    const handleMatchingRightClick = (rightId: string) => {
        if (!currentQuestion || !selectedLeftItem) return;

        const questionId = currentQuestion._id;
        const currentMatches = matchingPairs.get(questionId) || new Map<string, string>();
        
        // Check if this right item is already matched
        const existingLeft = Array.from(currentMatches.entries()).find(([_, rId]) => rId === rightId)?.[0];
        
        if (existingLeft) {
            // Unmatch if clicking on already matched right item
            if (existingLeft === selectedLeftItem) {
                // Same pair - unmatch it
                const newMatches = new Map(currentMatches);
                newMatches.delete(selectedLeftItem);
                setMatchingPairs(new Map(matchingPairs.set(questionId, newMatches)));
                setSelectedLeftItem(null);
                
                // Update answer
                const answerPairs = Array.from(newMatches.entries()).map(([lId, rId]) => `${lId}:${rId}`);
                setAnswers(new Map(answers.set(questionId, answerPairs.join("|"))));
            } else {
                // Different pair - swap the match
                const newMatches = new Map(currentMatches);
                newMatches.delete(existingLeft);
                newMatches.set(selectedLeftItem, rightId);
                setMatchingPairs(new Map(matchingPairs.set(questionId, newMatches)));
                setSelectedLeftItem(null);
                
                // Update answer
                const answerPairs = Array.from(newMatches.entries()).map(([lId, rId]) => `${lId}:${rId}`);
                setAnswers(new Map(answers.set(questionId, answerPairs.join("|"))));
            }
        } else {
            // New match
            const newMatches = new Map(currentMatches);
            newMatches.set(selectedLeftItem, rightId);
            setMatchingPairs(new Map(matchingPairs.set(questionId, newMatches)));
            setSelectedLeftItem(null);
            
            // Update answer
            const answerPairs = Array.from(newMatches.entries()).map(([lId, rId]) => `${lId}:${rId}`);
            setAnswers(new Map(answers.set(questionId, answerPairs.join("|"))));
        }
    };

    // Initialize matching pairs from saved answer
    const initializeMatchingPairs = (question: QuizQuestion) => {
        const questionId = question._id;
        const savedAnswer = answers.get(questionId);
        
        if (savedAnswer && !matchingPairs.has(questionId)) {
            const pairs = new Map<string, string>();
            savedAnswer.split("|").forEach(pair => {
                const [leftId, rightId] = pair.split(":");
                if (leftId && rightId) {
                    pairs.set(leftId, rightId);
                }
            });
            setMatchingPairs(new Map(matchingPairs.set(questionId, pairs)));
        }
    };

    // Render fill_blank question
    const renderFillBlank = (question: QuizQuestion) => {
        const blankPattern = /_{3,}/g;
        const parts = question.questionText.split(blankPattern);
        const blankCount = (question.questionText.match(blankPattern) || []).length;
        
        const answerValue = selectedAnswer || "";
        const answerParts = answerValue.split("|");
        
        // Ensure answerParts array has the correct length
        while (answerParts.length < blankCount) {
            answerParts.push("");
        }
        
        return (
            <div className="space-y-4">
                <div className="text-base leading-relaxed text-gray-800">
                    {parts.map((part, index) => (
                        <span key={index}>
                            <span className="whitespace-pre-wrap">{part}</span>
                            {index < parts.length - 1 && (
                                <Input
                                    value={answerParts[index] || ""}
                                    onChange={(e) => {
                                        const newAnswers = [...answerParts];
                                        newAnswers[index] = e.target.value;
                                        // Ensure array length matches blank count
                                        while (newAnswers.length < blankCount) {
                                            newAnswers.push("");
                                        }
                                        handleFillBlankChange(newAnswers.join("|"));
                                    }}
                                    placeholder="..."
                                    className={cn(
                                        "inline-block min-w-[150px] max-w-[250px] mx-2 px-3 py-2 text-base font-medium",
                                        "border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                                        "bg-white shadow-sm transition-all"
                                    )}
                                    autoFocus={index === 0 && !answerParts[0]}
                                />
                            )}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    // Render matching question with improved UX
    const renderMatching = (question: QuizQuestion) => {
        // Initialize pairs from saved answer
        initializeMatchingPairs(question);
        
        const { leftItems, rightItems } = parseMatchingOptions(question);
        const questionId = question._id;
        const currentMatches = matchingPairs.get(questionId) || new Map<string, string>();
        const matchedRightIds = new Set(Array.from(currentMatches.values()));
        
        // Create a map to get right item by id
        const rightItemsMap = new Map(rightItems.map(item => [item.id, item]));
        const leftItemsMap = new Map(leftItems.map(item => [item.id, item]));
        
        // Get matched pairs for display
        const matchedPairs = Array.from(currentMatches.entries()).map(([leftId, rightId]) => ({
            left: leftItemsMap.get(leftId)!,
            right: rightItemsMap.get(rightId)!,
            leftId,
            rightId
        }));
        
        return (
            <div className="space-y-6">
                {/* Instructions */}
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">Hướng dẫn:</p>
                    <p>Nhấp vào từ bên trái, sau đó nhấp vào nghĩa tương ứng bên phải để ghép cặp.</p>
                </div>

              

                {/* Two-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left column - English words */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Từ tiếng Anh
                        </h4>
                        {leftItems.map((item) => {
                            const isSelected = selectedLeftItem === item.id;
                            const isMatched = currentMatches.has(item.id);
                            const matchedRightId = currentMatches.get(item.id);
                            const matchedRightItem = matchedRightId ? rightItemsMap.get(matchedRightId) : null;
                            const leftIndex = leftItems.indexOf(item);
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleMatchingLeftClick(item.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer",
                                        "hover:shadow-md relative",
                                        isSelected
                                            ? "border-blue-500 bg-blue-100 shadow-lg ring-2 ring-blue-300"
                                            : isMatched
                                            ? "border-green-400 bg-green-50"
                                            : "border-gray-300 bg-white hover:border-blue-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 font-semibold text-sm",
                                                isSelected
                                                    ? "border-blue-500 bg-blue-500 text-white"
                                                    : isMatched
                                                    ? "border-green-500 bg-green-500 text-white"
                                                    : "border-gray-400 bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {isMatched ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <span>{leftIndex + 1}</span>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-base font-medium flex-1",
                                            isSelected ? "text-blue-900" : isMatched ? "text-green-900" : "text-gray-800"
                                        )}>
                                            {item.text}
                                        </span>
                                        {isSelected && (
                                            <Link2 className="w-5 h-5 text-blue-500 animate-pulse" />
                                        )}
                                        {isMatched && matchedRightItem && (
                                            <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                <ArrowRight className="w-3 h-3" />
                                                <span className="font-medium">{matchedRightItem.text}</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right column - Vietnamese meanings */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Nghĩa tiếng Việt
                        </h4>
                        {rightItems.map((item) => {
                            const isMatched = matchedRightIds.has(item.id);
                            const matchedLeftId = Array.from(currentMatches.entries())
                                .find(([_, rId]) => rId === item.id)?.[0];
                            const matchedLeftItem = matchedLeftId ? leftItemsMap.get(matchedLeftId) : null;
                            const isHighlighted = selectedLeftItem && !isMatched;
                            const rightIndex = rightItems.indexOf(item);
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleMatchingRightClick(item.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer",
                                        "hover:shadow-md relative",
                                        isMatched
                                            ? "border-green-400 bg-green-50"
                                            : isHighlighted
                                            ? "border-blue-300 bg-blue-50 hover:border-blue-400"
                                            : "border-gray-300 bg-white hover:border-blue-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 font-semibold text-sm",
                                                isMatched
                                                    ? "border-green-500 bg-green-500 text-white"
                                                    : isHighlighted
                                                    ? "border-blue-500 bg-blue-500 text-white"
                                                    : "border-gray-400 bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {isMatched ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <span>{String.fromCharCode(65 + rightIndex)}</span>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-base flex-1",
                                            isMatched ? "font-semibold text-green-900" : "text-gray-800"
                                        )}>
                                            {item.text}
                                        </span>
                                        {isHighlighted && (
                                            <ArrowRight className="w-5 h-5 text-blue-500" />
                                        )}
                                        {isMatched && matchedLeftItem && (
                                            <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                <span className="font-medium">{matchedLeftItem.text}</span>
                                                <ArrowRight className="w-3 h-3 rotate-180" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-3 h-3 rounded-full",
                            currentMatches.size === leftItems.length ? "bg-green-500" : "bg-blue-500"
                        )} />
                        <span className="text-gray-600">
                            Đã ghép <span className="font-semibold text-gray-900">{currentMatches.size}</span> / {leftItems.length} cặp
                        </span>
                    </div>
                    {currentMatches.size === leftItems.length && (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Hoàn thành!</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render true/false question with improved UX
    const renderTrueFalse = (question: QuizQuestion) => {
        const isTrueSelected = selectedAnswer === "true";
        const isFalseSelected = selectedAnswer === "false";
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* True Button */}
                    <button
                        onClick={() => handleSelectAnswer("true")}
                        className={cn(
                            "group relative p-8 rounded-2xl border-2 transition-all cursor-pointer",
                            "hover:shadow-xl hover:scale-[1.02] transform",
                            "flex flex-col items-center justify-center gap-4",
                            isTrueSelected
                                ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg ring-4 ring-green-200"
                                : "border-gray-300 bg-white hover:border-green-300"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                            "border-2 shadow-lg",
                            isTrueSelected
                                ? "bg-green-500 border-green-600"
                                : "bg-gray-100 border-gray-300 group-hover:bg-green-100 group-hover:border-green-400"
                        )}>
                            <Check className={cn(
                                "w-8 h-8 transition-all",
                                isTrueSelected ? "text-white" : "text-gray-400 group-hover:text-green-600"
                            )} strokeWidth={3} />
                        </div>
                        <div className="text-center">
                            <span className={cn(
                                "text-2xl font-bold block mb-1",
                                isTrueSelected ? "text-green-700" : "text-gray-700 group-hover:text-green-700"
                            )}>
                                Đúng
                            </span>
                            <span className={cn(
                                "text-lg font-semibold",
                                isTrueSelected ? "text-green-600" : "text-gray-500 group-hover:text-green-600"
                            )}>
                                True
                            </span>
                        </div>
                        {isTrueSelected && (
                            <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}
                    </button>

                    {/* False Button */}
                    <button
                        onClick={() => handleSelectAnswer("false")}
                        className={cn(
                            "group relative p-8 rounded-2xl border-2 transition-all cursor-pointer",
                            "hover:shadow-xl hover:scale-[1.02] transform",
                            "flex flex-col items-center justify-center gap-4",
                            isFalseSelected
                                ? "border-red-500 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg ring-4 ring-red-200"
                                : "border-gray-300 bg-white hover:border-red-300"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                            "border-2 shadow-lg",
                            isFalseSelected
                                ? "bg-red-500 border-red-600"
                                : "bg-gray-100 border-gray-300 group-hover:bg-red-100 group-hover:border-red-400"
                        )}>
                            <X className={cn(
                                "w-8 h-8 transition-all",
                                isFalseSelected ? "text-white" : "text-gray-400 group-hover:text-red-600"
                            )} strokeWidth={3} />
                        </div>
                        <div className="text-center">
                            <span className={cn(
                                "text-2xl font-bold block mb-1",
                                isFalseSelected ? "text-red-700" : "text-gray-700 group-hover:text-red-700"
                            )}>
                                Sai
                            </span>
                            <span className={cn(
                                "text-lg font-semibold",
                                isFalseSelected ? "text-red-600" : "text-gray-500 group-hover:text-red-600"
                            )}>
                                False
                            </span>
                        </div>
                        {isFalseSelected && (
                            <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                    <XCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}
                    </button>
                </div>
                
                {/* Selection indicator */}
                {(isTrueSelected || isFalseSelected) && (
                    <div className={cn(
                        "text-center p-4 rounded-xl border-2 transition-all",
                        isTrueSelected 
                            ? "bg-green-50 border-green-200" 
                            : "bg-red-50 border-red-200"
                    )}>
                        <p className={cn(
                            "text-sm font-medium",
                            isTrueSelected ? "text-green-700" : "text-red-700"
                        )}>
                            Bạn đã chọn: <span className="font-bold">{isTrueSelected ? "Đúng" : "Sai"}</span>
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Render multiple choice question
    const renderMultipleChoice = (question: QuizQuestion) => {
        return (
            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === option.text;
                    return (
                        <button
                            key={index}
                            onClick={() => handleSelectAnswer(option.text)}
                            className={cn(
                                "w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer",
                                isSelected
                                    ? "border-blue-500 bg-blue-100 shadow-md"
                                    : "border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        isSelected
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-gray-400"
                                    )}
                                >
                                    {isSelected && (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-base",
                                    isSelected ? "font-semibold text-blue-900" : "text-gray-700"
                                )}>
                                    {option.text}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    // Render question based on type
    const renderQuestionContent = (question: QuizQuestion) => {
        switch (question.type) {
            case "fill_blank":
                return renderFillBlank(question);
            case "matching":
                return renderMatching(question);
            case "true_false":
                return renderTrueFalse(question);
            case "multiple_choice":
            default:
                return renderMultipleChoice(question);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!allAnswered || !attempt) return;

        setIsSubmitting(true);
        try {
            const quizAnswers: QuizAnswer[] = questions.map(question => {
                const startTime = questionStartTime.get(question._id) || Date.now();
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);

                return {
                    questionId: question._id,
                    selectedAnswer: answers.get(question._id) || "",
                    timeSpent,
                };
            });

            await onSubmit(quizAnswers);
            setAnswers(new Map());
            setQuestionStartTime(new Map());
            setCurrentQuestionIndex(0);
        } catch (error) {
            console.error("Error submitting quiz:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentQuestion) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {attempt?.quiz.title || "Bài tập"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {answers.size} đã trả lời
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        {currentQuestion.type !== "fill_blank" && (
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {currentQuestion.questionText}
                            </h3>
                        )}
                        {renderQuestionContent(currentQuestion)}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                        >
                            Trước
                        </Button>

                        <div className="flex gap-2">
                            {!isLastQuestion ? (
                                <Button 
                                    onClick={handleNext} 
                                    disabled={(() => {
                                        if (!selectedAnswer) return true;
                                        
                                        if (currentQuestion.type === "fill_blank") {
                                            const answerParts = selectedAnswer.split("|");
                                            // Check if at least one blank is filled
                                            return !answerParts.some(part => part.trim().length > 0);
                                        }
                                        
                                        if (currentQuestion.type === "matching") {
                                            const selectedCount = selectedAnswer.split("|").filter(Boolean).length;
                                            return selectedCount === 0;
                                        }
                                        
                                        return false;
                                    })()}
                                >
                                    Câu tiếp theo
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!allAnswered || isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
