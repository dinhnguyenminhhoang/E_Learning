"use client";

import SubTopicCard from "@/components/topic/SubTopicCard/SubTopicCard";
import { TopicDetailModal } from "@/components/topic/TopicDetailModal/TopicDetailModal";
import TopicHeader from "@/components/topic/TopicHeader/TopicHeader";
import TopicSidebar from "@/components/topic/TopicSidebar/TopicSidebar";
import { TopicList } from "@/types/learning";
import { useEffect, useRef, useState } from "react";
import { learningPathService } from "@/services/learningPath.service";
import { examAttemptService } from "@/services/examAttempt.service";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserProgress } from "@/hooks/useUserProgress";
import { ClipboardCheck, Loader2 } from "lucide-react";

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathId = searchParams.get("pathId");

  const { progress } = useUserProgress();

  const [activeTopicId, setActiveTopicId] = useState(1);
  const [topicsData, setTopicsData] = useState<TopicList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [startingExam, setStartingExam] = useState<string | null>(null); // Track which exam is being started

  const topicRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTopicsData();
  }, [pathId, progress]);

  const fetchTopicsData = async () => {
    const learningPathId = pathId || progress?.learningPathId;

    if (!learningPathId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("ok");
      const levelsResponse = await learningPathService.getLearningPathHierarchy({
        learningPathId,
        isLevel: true,
      });

      if (levelsResponse && (levelsResponse as any).code === 200 && (levelsResponse as any).data) {
        const levels = (levelsResponse as any).data;

        const levelsWithLessons = await Promise.all(
          levels.map(async (level: any) => {
            try {
              const lessonsResponse: any =
                await learningPathService.getLearningPathHierarchy({
                  learningPathId,
                  isLesson: true,
                  levelOrder: level.order,
                });

              let lessonsData = [];
              if (lessonsResponse && (lessonsResponse as any).code === 200 && (lessonsResponse as any).data) {
                if (lessonsResponse.data.lessons) {
                  lessonsData = (lessonsResponse as any).data.lessons;
                } else {
                  lessonsData = Array.isArray((lessonsResponse as any).data)
                    ? lessonsResponse.data
                    : [];
                }
              }

              return {
                ...level,
                lessons: lessonsData,
                totalLessons: lessonsResponse.data?.totalLessons || lessonsData.length,
                completedLessons: lessonsResponse.data?.completedLessons || 0,
                finalQuiz: level.finalQuiz || null // Lưu finalQuiz từ API response
              };
            } catch (error) {
              return {
                ...level,
                lessons: [],
                totalLessons: 0,
                completedLessons: 0
              };
            }
          })
        );

        const transformedData: TopicList[] = levelsWithLessons.map(
          (level: any, index: number) => {
            const totalLessons = level.totalLessons || level.lessons?.length || 0;
            const completedLessons = level.completedLessons || 0;
            const progressPercent = totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;

            return {
              id: index + 1,
              name: level.title || `Level ${level.order}`,
              totalTopics: totalLessons,
              progressPercent: progressPercent,
              finalQuiz: level.finalQuiz || null, // Lưu finalQuiz vào TopicList
              subTopics: level.lessons.map((lesson: any, lessonIndex: number) => {
                const previousLesson = lessonIndex > 0 ? level.lessons[lessonIndex - 1] : null;
                const isLocked = lessonIndex > 0 && previousLesson && !previousLesson.isCompleted;

                return {
                  id: lesson.lesson,
                  name: lesson.title,
                  progress: completedLessons,
                  total: totalLessons,
                  icon: lesson.isCompleted ? "✅" : "📚",
                  isCompleted: lesson.isCompleted || false,
                  isLearned: lesson.isLearned || false,
                  lastAccessedAt: lesson.lastAccessedAt,
                  completedAt: lesson.completedAt,
                  isLocked: isLocked,
                  blocks: []
                };
              }),
            };
          }
        );

        if (transformedData.length > 0) {
          setTopicsData(transformedData);
        }
      }
    } catch (error: any) {
      console.error("Error fetching topics:", error);
      toast.error("Không thể tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollPosition = containerRef.current.scrollTop;
      const offset = 100;

      for (const topic of topicsData) {
        const element = topicRefs.current[topic.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          if (
            rect.top <= containerRect.top + offset &&
            rect.bottom > containerRect.top + offset
          ) {
            setActiveTopicId(topic.id);
            break;
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [topicsData]);

  const handleTopicClick = (topicId: number) => {
    const element = topicRefs.current[topicId];
    if (element && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const targetPosition =
        scrollTop + elementRect.top - containerRect.top - 20;

      containerRef.current.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  /**
   * Handler để start final quiz exam sau khi level đã completed
   * @param examId - ID của exam (finalQuiz)
   */
  const handleStartFinalQuiz = async (examId: string) => {
    if (!examId) {
      toast.error("Không tìm thấy bài kiểm tra");
      return;
    }

    try {
      setStartingExam(examId);
      
      // Gọi API start exam
      const response = await examAttemptService.startExam(examId);

      if (response.code === 200 || response.code === 201) {
        const attemptId = response.data?.exam?.attemptId || examId;
        toast.success("Bắt đầu bài kiểm tra thành công!");
        
        // Navigate đến trang exam
        router.push(`/exams/${examId}`);
      } else {
        toast.error(
          (response as any).message || "Không thể bắt đầu bài kiểm tra"
        );
      }
    } catch (error: any) {
      console.error("Error starting final quiz:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi khi bắt đầu bài kiểm tra. Vui lòng thử lại."
      );
    } finally {
      setStartingExam(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chủ đề...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            ref={containerRef}
            className="lg:col-span-3 space-y-8 overflow-y-auto max-h-screen pr-4 pb-20"
            style={{ scrollBehavior: "smooth" }}
          >
            {topicsData.map((topic) => (
              <div
                key={topic.id}
                ref={(el) => {
                  topicRefs.current[topic.id] = el;
                }}
                className="scroll-mt-6"
              >
                <TopicHeader
                  topic={topic as any}
                  isActive={activeTopicId === topic.id}
                />

                <div className="space-y-4">
                  {topic.subTopics.map((subTopic) => (
                    <SubTopicCard
                      key={subTopic.id}
                      subTopic={subTopic}
                      learningPathId={pathId || progress?.learningPathId}
                      isLocked={subTopic.isLocked}
                    />
                  ))}

                  {/* Final Quiz Button - Hiển thị khi level completed và có finalQuiz */}
                  {topic.finalQuiz && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-purple-900 mb-1">
                            Bài kiểm tra cuối level
                          </h3>
                          <p className="text-sm text-purple-700">
                            Hoàn thành tất cả bài học để làm bài kiểm tra
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleStartFinalQuiz(topic.finalQuiz!)}
                        disabled={startingExam === topic.finalQuiz}
                        className={`
                          w-full bg-gradient-to-r from-purple-600 to-indigo-600 
                          text-white font-semibold py-3 px-6 rounded-lg 
                          shadow-md hover:shadow-lg 
                          transition-all duration-200 
                          flex items-center justify-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed
                          hover:scale-[1.02] active:scale-[0.98]
                        `}
                      >
                        {startingExam === topic.finalQuiz ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Đang mở bài kiểm tra...</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="w-5 h-5" />
                            <span>Vào bài kiểm tra</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <TopicSidebar
              topics={topicsData}
              activeTopicId={activeTopicId}
              onTopicClick={handleTopicClick}
            />
          </div>
        </div>
      </div>
      <TopicDetailModal open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

