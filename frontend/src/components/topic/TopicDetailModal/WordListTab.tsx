import { cn } from "@/lib/utils";
import { Word } from "@/types/learning";
import React from "react";

function WordListTab({
  words,
  filterType,
}: {
  words: Word[];
  filterType: string;
}) {
  const filteredWords = words.filter((word) => {
    if (filterType === "all") return true;
    if (filterType === "not-learned") return word.status === "not-learned";
    if (filterType === "learning") return word.status === "learning";
    if (filterType === "mastered") return word.status === "mastered";
    return true;
  });

  const learnedCount = words.filter((w) => w.status !== "not-learned").length;
  const masteredCount = words.filter((w) => w.status === "mastered").length;

  return (
    <div className="mt-6">
      <div className="text-sm text-gray-600 mb-4">
        {learnedCount}/{words.length} words learned • {masteredCount} word
        mastered
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredWords.map((word, index) => (
          <div
            key={word.id}
            className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-900 font-medium">{word.word}</span>
            <span
              className={cn(
                "text-xs px-3 py-1 rounded-full font-medium",
                word.status === "not-learned" && "bg-gray-200 text-gray-600",
                word.status === "learning" && "bg-blue-100 text-blue-700",
                word.status === "mastered" && "bg-green-100 text-green-700"
              )}
            >
              {word.status === "not-learned" && "Not learned"}
              {word.status === "learning" && "Learning"}
              {word.status === "mastered" && "Mastered"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordListTab;
