"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { LessonWord } from "@/types/learning";
import TestSlide from "@/components/lesson/TestSlide";
import StartTestSlide from "@/components/lesson/StartTestSlide";
import { SlideContainer, TopBar } from "@/components/lesson/Shared";
import LearningSlide from "@/components/lesson/LearningSlide";

const LESSON: LessonWord[] = [
  {
    id: "1",
    word: "Hello",
    ipa: "/həˈloʊ/",
    meaning: 'An informal greeting, similar to "Hi"',
    image:
      "https://images.pexels.com/photos/3760855/pexels-photo-3760855.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "2",
    word: "Hi",
    ipa: "/haɪ/",
    meaning: "Very informal greeting",
    image:
      "https://images.pexels.com/photos/997512/pexels-photo-997512.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "3",
    word: "Good morning",
    ipa: "/ɡʊd ˈmɔːrnɪŋ/",
    meaning: "Polite greeting before noon",
    image:
      "https://images.pexels.com/photos/714703/pexels-photo-714703.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "4",
    word: "Good afternoon",
    ipa: "/ˌɡʊd ˌæftərˈnuːn/",
    meaning: "Polite greeting in the afternoon",
    image:
      "https://images.pexels.com/photos/1289892/pexels-photo-1289892.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "5",
    word: "Good evening",
    ipa: "/ɡʊd ˈiːvnɪŋ/",
    meaning: "Polite greeting in the evening",
    image:
      "https://images.pexels.com/photos/842980/pexels-photo-842980.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "6",
    word: "Good night",
    ipa: "/ɡʊd naɪt/",
    meaning: "Used when going to bed or leaving late at night",
    image:
      "https://images.pexels.com/photos/1796738/pexels-photo-1796738.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "7",
    word: "Nice to meet you",
    ipa: "/naɪs tə miːt juː/",
    meaning: "Polite response when meeting someone",
    image:
      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "8",
    word: "See you",
    ipa: "/siː juː/",
    meaning: "Goodbye expression",
    image:
      "https://images.pexels.com/photos/1162967/pexels-photo-1162967.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "9",
    word: "Take care",
    ipa: "/teɪk ker/",
    meaning: "Kind goodbye phrase",
    image:
      "https://images.pexels.com/photos/3182754/pexels-photo-3182754.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "10",
    word: "Welcome",
    ipa: "/ˈwɛlkəm/",
    meaning: "A friendly greeting when someone arrives",
    image:
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export default function LessonFlow() {
  const [stage, setStage] = useState<"learn" | "start-test" | "test" | "done">(
    "learn"
  );
  const [slide, setSlide] = useState(0);
  const [testIndex, setTestIndex] = useState(0);
  const [score, setScore] = useState(0);

  if (stage === "learn") {
    if (slide < LESSON.length)
      return (
        <LearningSlide
          word={LESSON[slide]}
          index={slide}
          total={LESSON.length}
          onPrev={() => setSlide((s) => Math.max(0, s - 1))}
          onNext={() => {
            if (slide + 1 < LESSON.length) setSlide(slide + 1);
            else setStage("start-test");
          }}
        />
      );
  }

  if (stage === "start-test")
    return <StartTestSlide onStart={() => setStage("test")} />;

  if (stage === "test") {
    if (testIndex < LESSON.length)
      return (
        <TestSlide
          word={LESSON[testIndex]}
          index={testIndex}
          total={LESSON.length}
          score={score}
          onResult={(ok) => ok && setScore((s) => s + 1)}
          onNext={() => {
            const next = testIndex + 1;
            if (next < LESSON.length) setTestIndex(next);
            else setStage("done");
          }}
        />
      );
  }

  return (
    <SlideContainer>
      <TopBar title="Result" />
      <div className="w-full max-w-md mt-12 text-center">
        <h3 className="text-2xl font-bold mb-2">Test finished!</h3>
        <p className="text-gray-600 mb-6">
          Score: {score} / {LESSON.length}
        </p>
        <Button
          onClick={() => {
            setStage("learn");
            setSlide(0);
            setTestIndex(0);
            setScore(0);
          }}
        >
          <RotateCcw className="w-4 h-4 mr-1" /> Restart Lesson
        </Button>
      </div>
    </SlideContainer>
  );
}
