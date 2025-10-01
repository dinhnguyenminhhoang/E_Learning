import { motion } from "framer-motion";
import { Target, FileText, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mission } from "@/types/learning";

interface MissionCardProps {
  mission: Mission;
  onStart: (missionId: string) => void;
}

export function MissionCard({ mission, onStart }: MissionCardProps) {
  const progressPercent =
    mission.total > 0 ? (mission.progress / mission.total) * 100 : 0;
  const Icon = mission.type === "daily" ? Target : FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            mission.type === "daily" ? "bg-red-100" : "bg-blue-100"
          }`}
        >
          <Icon
            className={`w-7 h-7 ${
              mission.type === "daily" ? "text-red-500" : "text-blue-500"
            }`}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{mission.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{mission.description}</p>

          {!mission.locked ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <Progress value={progressPercent} className="flex-1 h-2" />
                <span className="text-sm font-medium text-gray-700">
                  {mission.progress}/{mission.total}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Lock className="w-4 h-4" />
              <span>{mission.requirement}</span>
            </div>
          )}
        </div>

        {!mission.locked && (
          <Button
            onClick={() => onStart(mission.id)}
            variant={mission.progress === mission.total ? "outline" : "default"}
            className="ml-4"
          >
            {mission.progress > 0 ? "Continue" : "Start"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
