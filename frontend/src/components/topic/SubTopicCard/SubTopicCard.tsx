import { Progress } from "@/components/ui/progress";
import { SubTopic } from "@/types/learning";
import { ChevronRight, Lock } from "lucide-react";
import React from "react";
import Link from "next/link";

function SubTopicCard({
  subTopic,
  learningPathId,
  isLocked = false,
}: {
  subTopic: SubTopic;
  learningPathId?: string;
  isLocked?: boolean;
}) {
  const progressPercent =
    subTopic.total > 0 ? (subTopic.progress / subTopic.total) * 100 : 0;

  const href = learningPathId
    ? `/learning/${subTopic.id}?pathId=${learningPathId}`
    : `/learning/${subTopic.id}`;

  const CardContent = () => (
    <div
      className={`bg-white border rounded-xl p-6 transition-all ${isLocked
          ? "border-gray-300 opacity-60 cursor-not-allowed"
          : "border-gray-200 hover:shadow-md cursor-pointer"
        } ${!isLocked && "group"}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isLocked
              ? "bg-gray-300"
              : "bg-gradient-to-br from-pink-400 to-pink-600"
            }`}
        >
          {isLocked ? "🔒" : subTopic.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold mb-2 ${isLocked ? "text-gray-500" : "text-blue-700"
              }`}
          >
            {subTopic.name}
            {isLocked && (
              <span className="ml-2 text-xs text-gray-400 font-normal">
                (Hoàn thành bài trước để mở khóa)
              </span>
            )}
          </h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span className="font-medium">
                {subTopic.progress}/{subTopic.total}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="block">
        <CardContent />
      </div>
    );
  }

  return (
    <Link href={href} className="block">
      <CardContent />
    </Link>
  );
}
export default SubTopicCard;
