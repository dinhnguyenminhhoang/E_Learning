import { Progress } from "@/components/ui/progress";
import { SubTopic } from "@/types/learning";
import { ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";

function SubTopicCard({
  subTopic,
  learningPathId
}: {
  subTopic: SubTopic;
  learningPathId?: string;
}) {
  const progressPercent =
    subTopic.total > 0 ? (subTopic.progress / subTopic.total) * 100 : 0;

  const href = learningPathId
    ? `/learning/${subTopic.id}?pathId=${learningPathId}`
    : `/learning/${subTopic.id}`;

  return (
    <Link href={href} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {subTopic.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              {subTopic.name}
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

          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}
export default SubTopicCard;
