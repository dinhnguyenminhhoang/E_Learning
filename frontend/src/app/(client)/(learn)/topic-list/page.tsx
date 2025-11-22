"use client";

import SubTopicCard from "@/components/topic/SubTopicCard/SubTopicCard";
import { TopicDetailModal } from "@/components/topic/TopicDetailModal/TopicDetailModal";
import TopicHeader from "@/components/topic/TopicHeader/TopicHeader";
import TopicSidebar from "@/components/topic/TopicSidebar/TopicSidebar";
import { TopicList } from "@/types/learning";
import { useEffect, useRef, useState } from "react";
import { learningPathService } from "@/services/learningPath.service";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserProgress } from "@/hooks/useUserProgress";

const TOPICS_DATA: TopicList[] = [
  {
    id: 1,
    name: "Daily Communication",
    totalTopics: 8,
    progressPercent: 0,
    subTopics: [
      { id: "greeting", name: "Greeting", progress: 0, total: 38, icon: "💬" },
      {
        id: "thank-apology",
        name: "Thank & Apology",
        progress: 0,
        total: 28,
        icon: "🙏",
      },
      {
        id: "introduction",
        name: "Introduction",
        progress: 0,
        total: 18,
        icon: "👋",
      },
      {
        id: "directions",
        name: "Directions",
        progress: 0,
        total: 27,
        icon: "🧭",
      },
      {
        id: "common-imperative",
        name: "Common Imperative",
        progress: 0,
        total: 31,
        icon: "💪",
      },
      {
        id: "time-date",
        name: "Time & Date",
        progress: 0,
        total: 84,
        icon: "📅",
      },
      {
        id: "number-money",
        name: "Number & Money",
        progress: 0,
        total: 45,
        icon: "💰",
      },
      { id: "weather", name: "Weather", progress: 0, total: 29, icon: "🌤️" },
    ],
  },
];

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const pathId = searchParams.get("pathId");

  const { progress } = useUserProgress();

  const [activeTopicId, setActiveTopicId] = useState(1);
  const [topicsData, setTopicsData] = useState<TopicList[]>(TOPICS_DATA);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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

      // 1. Gọi API lấy danh sách Levels
      const levelsResponse = await learningPathService.getLearningPathHierarchy({
        learningPathId,
        isLevel: true,
      });

      if (levelsResponse.code === 200 && levelsResponse.data) {
        const levels = levelsResponse.data;

        // 2. Gọi API lấy danh sách Lessons cho từng Level
        const levelsWithLessons = await Promise.all(
          levels.map(async (level: any) => {
            try {
              const lessonsResponse =
                await learningPathService.getLearningPathHierarchy({
                  learningPathId,
                  isLesson: true,
                  levelOrder: level.order,
                });

              // Lấy dữ liệu lessons trực tiếp, KHÔNG gọi thêm API lấy blocks nữa
              const lessons =
                lessonsResponse.code === 200 ? lessonsResponse.data : [];

              return { ...level, lessons: lessons };
            } catch (error) {
              return { ...level, lessons: [] };
            }
          })
        );

        // 3. Chuyển đổi dữ liệu sang định dạng TopicList
        const transformedData: TopicList[] = levelsWithLessons.map(
          (level: any, index: number) => ({
            id: index + 1,
            name: level.title || `Level ${level.order}`,
            totalTopics: level.lessons?.length || 0,
            progressPercent: 0,
            subTopics: level.lessons.map((lesson: any) => ({
              id: lesson.lesson,
              name: lesson.title,
              progress: 0,
              // Vì không load blocks nên total tạm thời để 0 hoặc lấy từ lesson nếu có
              total: 0,
              icon: "📚",
              // Gán mảng rỗng vì không còn fetch blocks
              blocks: []
            })),
          })
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
                  topic={topic}
                  isActive={activeTopicId === topic.id}
                />

                <div className="space-y-4">
                  {topic.subTopics.map((subTopic) => (
                    <SubTopicCard
                      key={subTopic.id}
                      subTopic={subTopic}
                      learningPathId={pathId || progress?.learningPathId}
                    />
                  ))}
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
