import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GameType } from "@/types/learning";
import { ChevronRight } from "lucide-react";
import React from "react";

function LearningTab({
  wordsPerTurn,
  setWordsPerTurn,
  gameTypes,
  onToggleGame,
  onStartLearning,
}: {
  wordsPerTurn: string;
  setWordsPerTurn: (value: string) => void;
  gameTypes: GameType[];
  onToggleGame: (id: string) => void;
  onStartLearning: () => void;
}) {
  return (
    <div className="mt-6 space-y-6">
      <div>
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Setup your learning
            </h3>
            <p className="text-sm text-gray-500">
              Setup based on your preferences
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Number of words taken
          </label>
          <Select value={wordsPerTurn} onValueChange={setWordsPerTurn}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select words per turn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 words</SelectItem>
              <SelectItem value="10">10 words</SelectItem>
              <SelectItem value="15">15 words</SelectItem>
              <SelectItem value="20">20 words</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            Words taken for each turn
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Type of word games
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Choose at least 2 word game types
          </p>

          <div className="space-y-3">
            {gameTypes.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">
                  {game.name}
                </span>
                <Switch
                  checked={game.enabled}
                  onCheckedChange={() => onToggleGame(game.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={onStartLearning}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold rounded-xl"
        size="lg"
      >
        Start learning <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

export default LearningTab;
