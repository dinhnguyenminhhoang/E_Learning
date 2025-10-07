"use client";

import SubTopicCard from "@/components/topic/SubTopicCard/SubTopicCard";
import TopicHeader from "@/components/topic/TopicHeader/TopicHeader";
import TopicSidebar from "@/components/topic/TopicSidebar/TopicSidebar";
import { Topic } from "@/types/learning";
import { useEffect, useRef, useState } from "react";

const TOPICS_DATA: Topic[] = [
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
  {
    id: 2,
    name: "Family & Friends",
    totalTopics: 7,
    progressPercent: 0,
    subTopics: [
      {
        id: "family-member",
        name: "Family Member",
        progress: 0,
        total: 51,
        icon: "👨‍👩‍👧‍👦",
      },
      {
        id: "family-type",
        name: "Family Type",
        progress: 0,
        total: 22,
        icon: "👪",
      },
      {
        id: "romantic",
        name: "Romantic Relationship",
        progress: 0,
        total: 77,
        icon: "💑",
      },
      {
        id: "social",
        name: "Social Relationship",
        progress: 0,
        total: 39,
        icon: "🤝",
      },
      {
        id: "describe-relationship",
        name: "Describe Relationship",
        progress: 0,
        total: 44,
        icon: "💭",
      },
      {
        id: "celebration",
        name: "Celebration & Party",
        progress: 0,
        total: 40,
        icon: "🎉",
      },
      {
        id: "wish",
        name: "Wish & Congratulation",
        progress: 0,
        total: 33,
        icon: "🎊",
      },
    ],
  },
  {
    id: 3,
    name: "Work & Career",
    totalTopics: 6,
    progressPercent: 0,
    subTopics: [
      {
        id: "job-title",
        name: "Job Title",
        progress: 0,
        total: 65,
        icon: "💼",
      },
      {
        id: "workplace",
        name: "Workplace",
        progress: 0,
        total: 28,
        icon: "🏢",
      },
      {
        id: "work-activity",
        name: "Work Activity",
        progress: 0,
        total: 42,
        icon: "⚡",
      },
      { id: "business", name: "Business", progress: 0, total: 55, icon: "📊" },
      {
        id: "interview",
        name: "Interview",
        progress: 0,
        total: 31,
        icon: "🎤",
      },
      {
        id: "career-development",
        name: "Career Development",
        progress: 0,
        total: 38,
        icon: "📈",
      },
    ],
  },
  {
    id: 4,
    name: "Education & Learning",
    totalTopics: 5,
    progressPercent: 0,
    subTopics: [
      { id: "school", name: "School", progress: 0, total: 48, icon: "🏫" },
      { id: "subjects", name: "Subjects", progress: 0, total: 35, icon: "📚" },
      {
        id: "classroom",
        name: "Classroom",
        progress: 0,
        total: 42,
        icon: "🎓",
      },
      {
        id: "study-activities",
        name: "Study Activities",
        progress: 0,
        total: 39,
        icon: "✏️",
      },
      {
        id: "exams",
        name: "Exams & Tests",
        progress: 0,
        total: 28,
        icon: "📝",
      },
    ],
  },
  {
    id: 5,
    name: "Travel & Place",
    totalTopics: 6,
    progressPercent: 0,
    subTopics: [
      {
        id: "destinations",
        name: "Destinations",
        progress: 0,
        total: 52,
        icon: "🗺️",
      },
      {
        id: "transportation",
        name: "Transportation",
        progress: 0,
        total: 44,
        icon: "🚗",
      },
      {
        id: "accommodation",
        name: "Accommodation",
        progress: 0,
        total: 36,
        icon: "🏨",
      },
      {
        id: "tourist-activities",
        name: "Tourist Activities",
        progress: 0,
        total: 41,
        icon: "📸",
      },
      {
        id: "geography",
        name: "Geography",
        progress: 0,
        total: 48,
        icon: "🌍",
      },
      {
        id: "landmarks",
        name: "Landmarks",
        progress: 0,
        total: 33,
        icon: "🗿",
      },
    ],
  },
];
export default function TopicsPage() {
  const [activeTopicId, setActiveTopicId] = useState(1);
  const topicRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollPosition = containerRef.current.scrollTop;
      const offset = 100; // Offset for sticky header

      // Find which topic is currently in view
      for (const topic of TOPICS_DATA) {
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
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div
            ref={containerRef}
            className="lg:col-span-3 space-y-8 overflow-y-auto max-h-screen pr-4 pb-20"
            style={{ scrollBehavior: "smooth" }}
          >
            {TOPICS_DATA.map((topic) => (
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
                    <SubTopicCard key={subTopic.id} subTopic={subTopic} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <TopicSidebar
              topics={TOPICS_DATA}
              activeTopicId={activeTopicId}
              onTopicClick={handleTopicClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
