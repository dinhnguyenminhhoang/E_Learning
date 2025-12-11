"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { examAttemptService } from "@/services/examAttempt.service";
import {
  Question,
  Answer,
  StartExamResponse,
  ExamSection,
} from "@/types/examAttempt.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Maximize,
  Minimize,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { MultipleChoiceQuestion } from "@/components/exam/MultipleChoiceQuestion";
import { FillBlankQuestion } from "@/components/exam/FillBlankQuestion";
import { TrueFalseQuestion } from "@/components/exam/TrueFalseQuestion";
import { WritingQuestion } from "@/components/exam/WritingQuestion";
import { MatchingQuestion } from "@/components/exam/MatchingQuestion";
import { 
  useExamAutoSave, 
  loadAnswersFromStorage, 
  clearAnswersFromStorage 
} from "@/hooks/useExamAutoSave";

interface PageProps {
  params: Promise<{ examId: string }>;
}

// Auto-save hook sẽ được sử dụng trong component

export default function ExamTakingPage({ params }: PageProps) {
  const { examId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [examData, setExamData] = useState<StartExamResponse["data"] | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [remainingTime, setRemainingTime] = useState<number | null>(null); // in seconds
  const [sectionStartTime, setSectionStartTime] = useState<number | null>(null);

  // Calculate total questions across all sections
  const totalQuestionsAllSections = useMemo(() => {
    if (!examData?.sections) return 0;
    return examData.sections.reduce((total, section) => {
      return total + (section.questions?.length || 0);
    }, 0);
  }, [examData?.sections]);

  // Calculate answered questions count across all sections
  const answeredCountAllSections = useMemo(() => {
    return answers.size;
  }, [answers]);

  // Check if all questions are answered
  const allQuestionsAnswered = useMemo(() => {
    return totalQuestionsAllSections > 0 && answeredCountAllSections >= totalQuestionsAllSections;
  }, [totalQuestionsAllSections, answeredCountAllSections]);

  // Load exam data khi component mount
  useEffect(() => {
    loadExamData();
  }, [examId]);

  // Initialize elapsed time and remaining time from exam data
  useEffect(() => {
    if (examData?.exam.startAt && examData.exam.status === "in_progress") {
      const startTime = new Date(examData.exam.startAt).getTime();
      const totalTimeLimit = examData.exam.totalTimeLimit;
      
      // Calculate elapsed time from startAt to now
      const updateTime = () => {
        const now = Date.now();
        const timeSinceStart = Math.floor((now - startTime) / 1000);
        setElapsedTime(timeSinceStart);

        // Calculate remaining time if there's a time limit
        if (totalTimeLimit && totalTimeLimit > 0) {
          const remaining = Math.max(0, totalTimeLimit - timeSinceStart);
          setRemainingTime(remaining);

          // Auto-submit when time runs out (only once)
          // TODO: Re-enable auto-submit after fixing multiple submission issue
          // if (remaining === 0) {
          //   handleCompleteExam(true); // autoSubmit = true
          // }
        } else {
          setRemainingTime(null); // No time limit
        }
      };

      // Update immediately
      updateTime();

      // Update every second
      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    } else if (examData?.exam.status === "completed") {
      // If exam is completed, show the final timeSpent
      setElapsedTime(examData.exam.timeSpent || 0);
      setRemainingTime(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    examData?.exam.startAt,
    examData?.exam.status,
    examData?.exam.timeSpent,
    examData?.exam.totalTimeLimit,
  ]);

  // Track section start time
  useEffect(() => {
    if (currentSectionIndex !== null && examData) {
      setSectionStartTime(Date.now());
    }
  }, [currentSectionIndex, examData]);

  // Load answers từ localStorage khi có attemptId
  useEffect(() => {
    if (examData?.exam.attemptId) {
      const storedAnswers = loadAnswersFromStorage(examData.exam.attemptId);
      if (storedAnswers.size > 0) {
        setAnswers(storedAnswers);
        toast.success("Đã khôi phục câu trả lời từ bản lưu trước đó", {
          duration: 2000,
          icon: "💾",
        });
      }
    }
  }, [examData?.exam.attemptId]);

  // Auto-save answers với debounce
  const { forceSave } = useExamAutoSave(answers, {
    attemptId: examData?.exam.attemptId || "",
    debounceMs: 500, // Save sau 500ms không có thay đổi
    onSaveSuccess: () => {
      // Silent save - không hiển thị toast để tránh spam
    },
    onSaveError: (error) => {
      console.error("Auto-save failed:", error);
      toast.error("Không thể lưu tự động. Vui lòng kiểm tra kết nối.", {
        duration: 3000,
      });
    },
  });

  // Save trước khi rời trang (beforeunload)
  useEffect(() => {
    if (!examData?.exam.attemptId || answers.size === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Force save trước khi rời trang
      forceSave();
      
      // Chỉ hiển thị warning nếu exam đang in_progress
      if (examData.exam.status === "in_progress") {
        e.preventDefault();
        e.returnValue = "Bạn có chắc muốn rời khỏi trang? Câu trả lời đã được lưu tự động.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [answers, examData?.exam.attemptId, examData?.exam.status, forceSave]);

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && hasEnteredFullscreen && examData?.exam.status === "in_progress") {
        setShowExitConfirm(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [hasEnteredFullscreen, examData?.exam.status]);

  // Tự động vào fullscreen khi exam đã load xong và có questions
  useEffect(() => {
    if (
      examData &&
      examData.sections.length > 0 &&
      examData.sections[0].questions.length > 0 &&
      !hasEnteredFullscreen &&
      examData.exam.status === "in_progress" &&
      !isFullscreen
    ) {
      enterFullscreen();
      setHasEnteredFullscreen(true);
    }
  }, [examData, hasEnteredFullscreen, isFullscreen]);

  // Thoát fullscreen khi hoàn thành bài thi
  useEffect(() => {
    if (examData?.exam.status === "completed") {
      exitFullscreen();
    }
  }, [examData?.exam.status]);

  // Cleanup: thoát fullscreen khi component unmount
  useEffect(() => {
    return () => {
      exitFullscreen();
    };
  }, []);

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
    }
  };

  const handleRequestExitFullscreen = () => {
    if (isFullscreen && examData?.exam.status === "in_progress") {
      setShowExitConfirm(true);
    } else {
      exitFullscreen();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    exitFullscreen();
    router.push("/exams");
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    if (!document.fullscreenElement && examData?.exam.status === "in_progress") {
      enterFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      handleRequestExitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const loadExamData = async () => {
    if (!examId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await examAttemptService.startExam(examId);
      if (response.code === 200) {
        setExamData(response.data);
      } else {
        toast.error("Failed to load exam");
      }
    } catch (error) {
      console.error("Error loading exam:", error);
      toast.error("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (answer: Answer) => {
    setAnswers((prev) => {
      const newMap = new Map(prev);
      // Update answer với timestamp để track thời gian
      newMap.set(answer.questionId, {
        ...answer,
        timeSpent: answer.timeSpent || 0,
      });
      return newMap;
    });
  };

  const handleSubmitClick = () => {
    // Show confirmation dialog instead of window.confirm to avoid exiting fullscreen
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    await handleCompleteExam(false);
  };

  const handleCancelSubmit = () => {
    setShowSubmitConfirm(false);
  };

  const handleCompleteExam = async (autoSubmit = false) => {
    if (!examData) return;

    try {
      setSubmitting(true);

      // Prepare all answers
      const answersArray = Array.from(answers.values());

      // Calculate total time spent
      const totalTimeSpent = elapsedTime;

      const response = await examAttemptService.completeExam(
        examData.exam.attemptId,
        {
          answers: answersArray,
          timeSpent: totalTimeSpent,
          autoSubmit,
        }
      );

      if (response.code === 200) {
        toast.success(
          autoSubmit
            ? "Bài thi đã được tự động nộp do hết thời gian!"
            : "Exam completed! Calculating results...",
          { duration: 3000 }
        );
        // Clear localStorage sau khi hoàn thành
        clearAnswersFromStorage(examData.exam.attemptId);
        router.push(`/exams/results/${examData.exam.attemptId}`);
      }
    } catch (error: any) {
      console.error("Error completing exam:", error);
      toast.error(
        error?.response?.data?.message || "Failed to complete exam"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const answer = answers.get(question._id);

    switch (question.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceQuestion
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        );
      case "fill_blank":
        return (
          <FillBlankQuestion
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        );
      case "true_false":
        return (
          <TrueFalseQuestion
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        );
      case "writing":
        return (
          <WritingQuestion
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        );
      case "speaking":
        // TODO: Implement SpeakingQuestion component
        return (
          <Card className="p-6">
            <p className="text-gray-500">Speaking question not yet implemented</p>
          </Card>
        );
      case "matching":
        return (
          <MatchingQuestion
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        );
      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!examData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Invalid exam</p>
          <p className="text-sm text-gray-500 mt-2">
            Please make sure you have access to this exam.
          </p>
        </div>
      </div>
    );
  }

  const currentSection = examData.sections[currentSectionIndex];
  const progress =
    ((currentSectionIndex + 1) / examData.sections.length) * 100;
  const answeredCount = currentSection
    ? currentSection.questions.filter((q) => answers.has(q._id)).length
    : 0;
  const totalQuestions = currentSection?.questions.length || 0;

  // Format elapsed time to MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      {/* Exit Confirmation Dialog */}
      <Dialog
        open={showExitConfirm}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelExit();
          } else {
            setShowExitConfirm(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Xác nhận thoát bài thi
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn thoát khỏi bài thi không? Nếu đồng ý, bạn sẽ được chuyển về trang "Bài kiểm tra".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelExit}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmExit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đồng ý thoát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={showSubmitConfirm}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelSubmit();
          } else {
            setShowSubmitConfirm(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Xác nhận nộp bài thi
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn nộp bài thi không? Sau khi nộp, bạn không thể thay đổi câu trả lời.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelSubmit}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Đang nộp...
                </>
              ) : (
                "Xác nhận nộp bài"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex h-screen bg-gray-100 fixed inset-0">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Exam Progress</h2>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Section {currentSectionIndex + 1} of{" "}
                  {examData.sections.length}
                </span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {examData.sections.map((section, index) => {
                const isActive = index === currentSectionIndex;
                const isCompleted = section.status === "completed";
                const sectionAnsweredCount = section.questions.filter((q) =>
                  answers.has(q._id)
                ).length;

                return (
                  <button
                    key={section.sectionId}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg transition-all",
                      isActive && "bg-blue-50 border-2 border-blue-500",
                      isCompleted && "bg-green-50 border-2 border-green-500",
                      !isActive &&
                        !isCompleted &&
                        "border-2 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          isActive && "bg-blue-500 text-white",
                          isCompleted && "bg-green-500 text-white",
                          !isActive && !isCompleted && "bg-gray-200 text-gray-600"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-semibold text-sm truncate",
                            isActive && "text-blue-900",
                            isCompleted && "text-green-900"
                          )}
                        >
                          Section {index + 1} ({section.skill})
                        </p>
                        <p className="text-xs text-gray-600">
                          {sectionAnsweredCount} / {section.questions.length} answered
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Section {currentSectionIndex + 1} - {currentSection?.skill}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {answeredCount} of {totalQuestions} answered
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-lg font-semibold">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2"
                  title={
                    isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen"
                  }
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-4 h-4" />
                      <span className="hidden sm:inline">Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="w-4 h-4" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-8">
                {currentSection ? (
                  <div className="max-w-4xl mx-auto space-y-8">
                    {currentSection.questions.map((question, index) => (
                      <Card key={question._id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">{renderQuestion(question)}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-gray-500">No section selected</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="bg-white border-t border-gray-200 px-8 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))
                }
                disabled={currentSectionIndex === 0 || submitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Section
              </Button>

               <div className="flex items-center gap-4">
                 <Button
                   onClick={handleSubmitClick}
                   disabled={
                     submitting || 
                     examData?.exam.status === "completed" || 
                     !examData ||
                     examData?.exam.status !== "in_progress"
                   }
                   className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   size="lg"
                   title={
                     examData?.exam.status === "completed"
                       ? "Exam đã được nộp"
                       : examData?.exam.status !== "in_progress"
                       ? "Exam chưa bắt đầu hoặc đã kết thúc"
                       : submitting
                       ? "Đang nộp bài..."
                       : "Nộp bài thi"
                   }
                 >
                   {submitting ? (
                     <>
                       <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                       Submitting...
                     </>
                   ) : (
                     <>
                       Submit Exam
                       <ChevronRight className="w-4 h-4 ml-2" />
                     </>
                   )}
                 </Button>
               </div>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentSectionIndex(
                    Math.min(
                      examData.sections.length - 1,
                      currentSectionIndex + 1
                    )
                  )
                }
                disabled={
                  currentSectionIndex === examData.sections.length - 1 ||
                  submitting
                }
              >
                Next Section
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
