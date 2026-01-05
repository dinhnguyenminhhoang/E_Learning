"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Home, Trophy } from "lucide-react";
import SpeakingPracticeCard from "./SpeakingPracticeCard";
import { SpeakingPracticeResult } from "@/services/speakingPractice.service";

interface SpeakingSentence {
    id: string;
    text: string;
    level?: string;
}

interface SpeakingPracticeSwiperProps {
    sentences: SpeakingSentence[];
    onComplete?: (results: Map<string, SpeakingPracticeResult>) => void;
    onExit?: () => void;
}

export default function SpeakingPracticeSwiper({
    sentences,
    onComplete,
    onExit
}: SpeakingPracticeSwiperProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<Map<string, SpeakingPracticeResult>>(new Map());
    const [isCompleted, setIsCompleted] = useState(false);

    const currentSentence = sentences[currentIndex];
    const progress = ((currentIndex + 1) / sentences.length) * 100;

    const handlePracticeComplete = (result: SpeakingPracticeResult) => {
        const newResults = new Map(results);
        newResults.set(currentSentence.id, result);
        setResults(newResults);
    };

    const goToNext = () => {
        if (currentIndex < sentences.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsCompleted(true);
            onComplete?.(results);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const calculateScore = () => {
        let totalScore = 0;
        let count = 0;
        results.forEach((result) => {
            if (result.grading && result.transcribedText) {
                totalScore += result.grading.score;
                count++;
            }
        });
        return count > 0 ? Math.round(totalScore / count) : 0;
    };

    if (isCompleted) {
        const score = calculateScore();
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Hoàn thành luyện tập!
                    </h2>

                    <div className="my-6">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {score}%
                        </div>
                        <p className="text-gray-500 mt-1">Điểm số của bạn</p>
                    </div>

                    <div className="space-y-2 mb-6 text-left">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tổng câu:</span>
                            <span className="font-medium">{sentences.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Đã hoàn thành:</span>
                            <span className="font-medium text-blue-600">{results.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Điểm cao (≥80):</span>
                            <span className="font-medium text-green-600">
                                {Array.from(results.values()).filter(r => r.grading && r.grading.score >= 80).length}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={onExit}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="mx-auto mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        onClick={onExit}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Thoát
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-800">
                        Luyện nói
                    </h1>
                    <div className="w-20" />
                </div>

                <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Câu {currentIndex + 1}/{sentences.length}</span>
                        {currentSentence?.level && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                {currentSentence.level}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <SpeakingPracticeCard
                key={currentSentence.id}
                sentence={currentSentence.text}
                onComplete={handlePracticeComplete}
            />

            <div className="max-w-2xl mx-auto mt-6">
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Câu trước
                    </Button>

                    <div className="flex gap-1">
                        {sentences.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex
                                    ? "bg-blue-500"
                                    : results.has(sentences[idx].id)
                                        ? "bg-green-400"
                                        : "bg-gray-300"
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={goToNext}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                        {currentIndex === sentences.length - 1 ? "Hoàn thành" : "Câu tiếp"}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
