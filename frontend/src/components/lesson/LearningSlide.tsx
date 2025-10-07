"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Volume2, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { SlideContainer, TopBar } from "./Shared";
import { LessonWord } from "@/types/learning";

export default function LearningSlide({
  word,
  index,
  total,
  onPrev,
  onNext,
}: {
  word: LessonWord;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const progress = ((index + 1) / total) * 100;

  return (
    <SlideContainer>
      <TopBar
        title="Learning"
        right={<Flag className="w-5 h-5 text-gray-400" />}
      />
      <div className="w-full px-6">
        <Progress value={progress} />
        <p className="text-sm text-gray-500 mt-1 text-center">
          {index + 1}/{total}
        </p>
      </div>

      <Card className="mt-8 bg-white rounded-2xl shadow-md w-[380px] sm:w-[480px] p-6 text-center relative">
        <div className="flex justify-center gap-3 mb-4">
          <Button variant="outline" size="icon">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-2xl font-bold mb-1">{word.word}</h3>
        <p className="text-gray-500 italic mb-4">{word.ipa}</p>
        {word.image && (
          <img
            src={word.image}
            alt={word.word}
            className="rounded-lg mb-4 w-full h-48 object-cover"
          />
        )}
        <p className="text-gray-700 text-sm">
          <strong>Meaning:</strong> {word.meaning}
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Button variant="outline" onClick={onPrev} disabled={index === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <Button onClick={onNext}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    </SlideContainer>
  );
}
