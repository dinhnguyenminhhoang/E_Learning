import { cn } from "@/lib/utils";
import { TopicList } from "@/types/learning";
import { BookOpen } from "lucide-react";

function TopicSidebar({
  topics,
  activeTopicId,
  onTopicClick,
}: {
  topics: TopicList[];
  activeTopicId: number;
  onTopicClick: (id: number) => void;
}) {
  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4 px-2">
          <BookOpen className="w-5 h-5 text-cyan-500" />
          <h3 className="font-semibold text-gray-900">English Topic Cards</h3>
        </div>
        <div className="space-y-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicClick(topic.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                activeTopicId === topic.id
                  ? "bg-green-100 text-gray-900 font-medium"
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                  activeTopicId === topic.id
                    ? "bg-white text-gray-900"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {topic.id}
              </div>
              <span className="text-sm">{topic.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export default TopicSidebar;
