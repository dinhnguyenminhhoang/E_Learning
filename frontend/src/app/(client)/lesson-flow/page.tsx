"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { LessonWord } from "@/types/learning";
import TestSlide from "@/components/lesson/TestSlide";
import StartTestSlide from "@/components/lesson/StartTestSlide";
import { SlideContainer, TopBar } from "@/components/lesson/Shared";
import LearningSlide from "@/components/lesson/LearningSlide";
import { lessonService } from "@/services/lesson.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

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
];

export default function LessonFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const lessonId = searchParams.get("lessonId");

  const [stage, setStage] = useState<"learn" | "start-test" | "test" | "done">(
    "learn"
  );
  const [slide, setSlide] = useState(0);
  const [testIndex, setTestIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lessonData, setLessonData] = useState<LessonWord[]>(LESSON);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId && user) {
      fetchLessonData();
    } else {
      setLoading(false);
    }
  }, [lessonId, user]);

  const fetchLessonData = async () => {
    if (!lessonId || !user) return;

    try {
      setLoading(true);

      const response = await lessonService.getLessonById(lessonId, user.id);

      if (response.code === 200 && response.data) {
        console.log("Lesson data:", response.data);
        setLessonData(LESSON);
      }
    } catch (error: any) {
      console.error("Error fetching lesson:", error);
      toast.error("Không thể tải bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lessonId) return;

    try {
      await lessonService.markLessonComplete(lessonId);
      toast.success("Hoàn thành bài học!");
      router.push("/learn");
    } catch (error: any) {
      console.error("Error completing lesson:", error);
      toast.error("Không thể hoàn thành bài học");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (stage === "learn") {
    if (slide < lessonData.length)
      return (
        <LearningSlide
          word={lessonData[slide]}
          index={slide}
          total={lessonData.length}
          onPrev={() => setSlide((s) => Math.max(0, s - 1))}
          onNext={() => {
            if (slide + 1 < lessonData.length) setSlide(slide + 1);
            else setStage("start-test");
          }}
        />
      );
  }

  if (stage === "start-test")
    return <StartTestSlide onStart={() => setStage("test")} />;

  if (stage === "test") {
    if (testIndex < lessonData.length)
      return (
        <TestSlide
          word={lessonData[testIndex]}
          index={testIndex}
          total={lessonData.length}
          score={score}
          onResult={(ok) => ok && setScore((s) => s + 1)}
          onNext={() => {
            const next = testIndex + 1;
            if (next < lessonData.length) setTestIndex(next);
            else {
              setStage("done");
              handleCompleteLesson();
            }
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
          Score: {score} / {lessonData.length}
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
