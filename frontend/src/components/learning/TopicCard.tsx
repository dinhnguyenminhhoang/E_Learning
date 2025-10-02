import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Topic } from "@/types/learning";

interface TopicCardProps {
  topic: Topic;
  onStart: (topicId: string) => void;
}

export function TopicCard({ topic, onStart }: TopicCardProps) {
  const progressPercent = (topic.progress / topic.total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">{topic.icon}</span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{topic.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Progress</span>
            <span className="font-medium">
              {topic.progress}/{topic.total}
            </span>
          </div>
          <Progress value={progressPercent} className="mt-2 h-1.5" />
        </div>

        <Button
          onClick={() => onStart(topic.id)}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
        >
          Start learning <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
