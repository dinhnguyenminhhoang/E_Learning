import { cn } from "@/lib/utils";
import { Topic } from "@/types/learning";
import React from "react";

function TopicHeader({ topic, isActive }: { topic: Topic; isActive: boolean }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 bg-white border-2 rounded-2xl px-6 py-4 mb-6 transition-all",
        isActive ? "border-blue-600 shadow-md" : "border-gray-200"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {topic.id}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{topic.name}</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {topic.totalTopics} topics
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {topic.progressPercent}% learned
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopicHeader;
