"use client";

import { useState, useEffect, useMemo } from "react";
import { Question, Answer } from "@/Types/examAttempt.types";
import { cn } from "@/lib/utils";
import { Check, X, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MatchingQuestionProps {
    question: Question;
    answer?: Answer;
    onChange: (answer: Answer) => void;
}

interface MatchingPair {
    left: string;
    right: string;
    id: string;
}

interface MatchingState {
    leftItems: MatchingPair[];
    rightItems: MatchingPair[];
    matches: Map<string, string>; // leftId -> rightId
    draggedItem: { id: string; type: "left" | "right" } | null;
    hoveredRightId: string | null;
    selectedLeftId: string | null; // For click-to-match mode
}

export function MatchingQuestion({
    question,
    answer,
    onChange,
}: MatchingQuestionProps) {
    // Parse options to extract left-right pairs
    const initialPairs = useMemo(() => {
        if (!question.options || question.options.length === 0) {
            return [];
        }

        return question.options.map((option, index) => {
            const parts = option.text.split(" - ");
            if (parts.length === 2) {
                return {
                    left: parts[0].trim(),
                    right: parts[1].trim(),
                    id: `pair-${index}`,
                };
            }
            // Fallback: if no separator, treat as left item
            return {
                left: option.text.trim(),
                right: "",
                id: `pair-${index}`,
            };
        });
    }, [question.options]);

    // Initialize state
    const [state, setState] = useState<MatchingState>(() => {
        // Parse saved answer if exists
        const savedMatches = new Map<string, string>();
        if (answer?.selectedAnswer && answer.selectedAnswer.trim() !== "") {
            try {
                const pairs = answer.selectedAnswer.split(",");
                pairs.forEach((pair) => {
                    const [leftId, rightId] = pair.split(":");
                    if (leftId && rightId) {
                        savedMatches.set(leftId.trim(), rightId.trim());
                    }
                });
            } catch (e) {
                console.error("Error parsing saved answer:", e);
            }
        }

        // Shuffle right items for challenge (nhưng giữ nguyên thứ tự nếu đã có saved matches)
        // Nếu đã có saved matches, không shuffle để giữ nguyên state đã lưu
        const shuffledRight = savedMatches.size > 0
            ? [...initialPairs] // Giữ nguyên thứ tự nếu đã có matches
            : [...initialPairs].sort(() => Math.random() - 0.5); // Chỉ shuffle nếu chưa có matches

        return {
            leftItems: initialPairs,
            rightItems: shuffledRight,
            matches: savedMatches,
            draggedItem: null,
            hoveredRightId: null,
            selectedLeftId: null,
        };
    });

    // Sync state với answer prop khi answer thay đổi (từ localStorage)
    useEffect(() => {
        if (!answer?.selectedAnswer) {
            // Nếu không có answer, giữ nguyên state hiện tại
            return;
        }

        // Parse answer từ prop
        const savedMatches = new Map<string, string>();
        try {
            const pairs = answer.selectedAnswer.split(",");
            pairs.forEach((pair) => {
                const [leftId, rightId] = pair.split(":");
                if (leftId && rightId) {
                    savedMatches.set(leftId.trim(), rightId.trim());
                }
            });
        } catch (e) {
            console.error("Error parsing answer prop:", e);
            return;
        }

        // Chỉ update nếu matches khác với state hiện tại
        const currentMatchesString = Array.from(state.matches.entries())
            .map(([l, r]) => `${l}:${r}`)
            .sort()
            .join(",");
        const newMatchesString = Array.from(savedMatches.entries())
            .map(([l, r]) => `${l}:${r}`)
            .sort()
            .join(",");

        if (currentMatchesString !== newMatchesString) {
            setState((prev) => ({
                ...prev,
                matches: savedMatches,
            }));
        }
    }, [answer?.selectedAnswer]);

    // Update answer when matches change - luôn lưu kể cả khi matches rỗng
    useEffect(() => {
        // Tạo answer string từ matches (có thể rỗng nếu chưa match gì)
        const answerString = state.matches.size > 0
            ? Array.from(state.matches.entries())
                  .map(([leftId, rightId]) => `${leftId}:${rightId}`)
                  .join(",")
            : ""; // Lưu empty string nếu chưa có match nào

        // Luôn gọi onChange để đảm bảo state được lưu vào localStorage
        onChange({
            questionId: question._id,
            selectedAnswer: answerString,
            timeSpent: answer?.timeSpent || 0,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.matches, question._id]);

    const handleDragStart = (
        e: React.DragEvent,
        itemId: string,
        type: "left" | "right"
    ) => {
        e.dataTransfer.effectAllowed = "move";
        setState((prev) => ({ ...prev, draggedItem: { id: itemId, type } }));
    };

    const handleDragOver = (e: React.DragEvent, rightId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (state.draggedItem?.type === "left") {
            setState((prev) => ({ ...prev, hoveredRightId: rightId }));
        }
    };

    const handleDragLeave = () => {
        setState((prev) => ({ ...prev, hoveredRightId: null }));
    };

    const handleDrop = (e: React.DragEvent, rightId: string) => {
        e.preventDefault();
        if (state.draggedItem?.type === "left") {
            const leftId = state.draggedItem.id;

            setState((prev) => {
                const newMatches = new Map(prev.matches);

                // Remove existing match for this left item if any
                if (newMatches.has(leftId)) {
                    newMatches.delete(leftId);
                }

                // Remove existing match for this right item if any
                for (const [lId, rId] of newMatches.entries()) {
                    if (rId === rightId) {
                        newMatches.delete(lId);
                    }
                }

                // Add new match
                newMatches.set(leftId, rightId);

                return {
                    ...prev,
                    matches: newMatches,
                    draggedItem: null,
                    hoveredRightId: null,
                };
            });
        }
    };

    const handleLeftItemClick = (leftId: string) => {
        setState((prev) => {
            // If clicking the same item, deselect it
            if (prev.selectedLeftId === leftId) {
                return { ...prev, selectedLeftId: null };
            }
            // Otherwise, select this left item
            return { ...prev, selectedLeftId: leftId };
        });
    };

    const handleRightItemClick = (rightId: string) => {
        setState((prev) => {
            // If a left item is selected, match them
            if (prev.selectedLeftId) {
                const newMatches = new Map(prev.matches);
                const leftId = prev.selectedLeftId;

                // Remove existing match for this left item if any
                if (newMatches.has(leftId)) {
                    newMatches.delete(leftId);
                }

                // Remove existing match for this right item if any
                for (const [lId, rId] of newMatches.entries()) {
                    if (rId === rightId) {
                        newMatches.delete(lId);
                    }
                }

                // Add new match
                newMatches.set(leftId, rightId);

                return {
                    ...prev,
                    matches: newMatches,
                    selectedLeftId: null, // Clear selection after matching
                };
            }

            // If no left item selected, check if this right item is already matched
            const matchedLeftId = Array.from(prev.matches.entries()).find(
                ([_, rId]) => rId === rightId
            )?.[0];

            if (matchedLeftId) {
                // Unmatch if clicking on already matched right item
                const newMatches = new Map(prev.matches);
                newMatches.delete(matchedLeftId);
                return { ...prev, matches: newMatches };
            }

            return prev;
        });
    };

    const handleUnmatch = (leftId: string) => {
        setState((prev) => {
            const newMatches = new Map(prev.matches);
            newMatches.delete(leftId);
            return { ...prev, matches: newMatches };
        });
    };

    const getMatchedRightId = (leftId: string) => {
        return state.matches.get(leftId);
    };

    const isRightItemMatched = (rightId: string) => {
        return Array.from(state.matches.values()).includes(rightId);
    };

    return (
        <div className="space-y-6">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r">
                <p className="text-lg font-medium text-gray-900">
                    {question.questionText}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                    Drag items from the left to match with items on the right, or
                    click a left item then click a right item to match them.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Items
                    </h3>
                    {state.leftItems.map((item) => {
                        const matchedRightId = getMatchedRightId(item.id);
                        const isMatched = !!matchedRightId;

                        return (
                            <Card
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id, "left")}
                                onDragEnd={() =>
                                    setState((prev) => ({
                                        ...prev,
                                        draggedItem: null,
                                        hoveredRightId: null,
                                    }))
                                }
                                onClick={() => !isMatched && handleLeftItemClick(item.id)}
                                className={cn(
                                    "p-4 transition-all",
                                    isMatched
                                        ? "bg-green-50 border-green-300 border-2 cursor-default"
                                        : state.selectedLeftId === item.id
                                        ? "bg-orange-100 border-orange-400 border-2 cursor-pointer shadow-md"
                                        : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md cursor-pointer"
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <GripVertical className="w-5 h-5 text-gray-400 shrink-0" />
                                        <span
                                            className={cn(
                                                "text-base font-medium",
                                                isMatched
                                                    ? "text-green-900"
                                                    : state.selectedLeftId === item.id
                                                    ? "text-orange-900"
                                                    : "text-gray-900"
                                            )}
                                        >
                                            {item.left}
                                        </span>
                                        {state.selectedLeftId === item.id && !isMatched && (
                                            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-semibold">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    {isMatched && (
                                        <button
                                            onClick={() => handleUnmatch(item.id)}
                                            className="shrink-0 p-1 hover:bg-green-200 rounded transition-colors"
                                            title="Unmatch"
                                        >
                                            <X className="w-4 h-4 text-green-700" />
                                        </button>
                                    )}
                                </div>
                                {isMatched && (
                                    <div className="mt-2 pt-2 border-t border-green-200">
                                        <div className="flex items-center gap-2 text-sm text-green-700">
                                            <Check className="w-4 h-4" />
                                            <span>
                                                Matched with:{" "}
                                                {
                                                    state.rightItems.find(
                                                        (r) => r.id === matchedRightId
                                                    )?.right
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Match With
                    </h3>
                    {state.rightItems.map((item) => {
                        const isMatched = isRightItemMatched(item.id);
                        const isHovered = state.hoveredRightId === item.id;
                        const matchedLeftId = Array.from(state.matches.entries()).find(
                            ([_, rId]) => rId === item.id
                        )?.[0];

                        return (
                            <Card
                                key={item.id}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, item.id)}
                                onClick={() => handleRightItemClick(item.id)}
                                className={cn(
                                    "p-4 transition-all cursor-pointer",
                                    isMatched
                                        ? "bg-green-50 border-green-300 border-2"
                                        : isHovered
                                        ? "bg-orange-100 border-orange-400 border-2 shadow-lg scale-105"
                                        : state.selectedLeftId
                                        ? "bg-blue-50 border-blue-300 border-2 hover:border-blue-400"
                                        : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        className={cn(
                                            "text-base font-medium",
                                            isMatched
                                                ? "text-green-900"
                                                : "text-gray-900"
                                        )}
                                    >
                                        {item.right}
                                    </span>
                                    {isMatched && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Check className="w-5 h-5 text-green-600" />
                                            <span className="text-xs text-green-700 font-medium">
                                                Matched
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {isMatched && matchedLeftId && (
                                    <div className="mt-2 pt-2 border-t border-green-200">
                                        <div className="text-sm text-green-700">
                                            Matched with:{" "}
                                            {
                                                state.leftItems.find(
                                                    (l) => l.id === matchedLeftId
                                                )?.left
                                            }
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Matching Progress
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                        {state.matches.size} / {state.leftItems.length} matched
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${
                                (state.matches.size / state.leftItems.length) * 100
                            }%`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

