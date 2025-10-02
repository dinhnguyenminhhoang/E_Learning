import { Trophy } from "lucide-react";
import { WordLevel } from "@/types/learning";

interface LearningStatsProps {
  wordLevels: WordLevel[];
  totalWords: number;
}

export function LearningStats({ wordLevels, totalWords }: LearningStatsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Overview</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          📋 View wordlist
        </button>
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 mb-6 flex items-center justify-between">
        <div>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {totalWords}
          </div>
          <div className="text-sm text-gray-600">Words learnt</div>
        </div>
        <Trophy className="w-16 h-16 text-yellow-500" />
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2 rotate-[-90deg] translate-x-[-40px] translate-y-[60px] origin-left">
          Words learned
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {wordLevels.map((level) => (
          <div key={level.level} className="text-center">
            <div className="bg-gray-100 rounded-lg py-6 mb-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">
                {level.count}
              </span>
            </div>
            <div
              className={`text-xs font-medium ${
                level.level === "Master" ? "text-yellow-600" : "text-gray-600"
              }`}
            >
              {level.level}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">Memory level</div>
    </div>
  );
}
