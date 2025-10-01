"use client";

import { useState } from "react";
import { Home, GraduationCap, BookOpen, Settings, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissionCard } from "@/components/learning/MissionCard";
import { TopicCard } from "@/components/learning/TopicCard";
import { LearningStats } from "@/components/learning/LearningStats";
import { Mission, Topic, WordLevel } from "@/types/learning";

export const MISSIONS_DATA: Mission[] = [
  {
    id: "daily-words",
    type: "daily",
    title: "Learn new words",
    description: "Complete your daily goals",
    progress: 0,
    total: 10,
    icon: "🎯",
  },
  {
    id: "review",
    type: "review",
    title: "Review words",
    description: "Based on spaced-repetition algorithm",
    progress: 0,
    total: 0,
    icon: "📝",
    locked: true,
    requirement: "Start learning to unlock review",
  },
];

export const SUGGESTED_TOPICS: Topic[] = [
  {
    id: "music-instrument",
    name: "Music Instrument",
    progress: 0,
    total: 22,
    icon: "🎵",
  },
  {
    id: "animals",
    name: "Animals",
    progress: 0,
    total: 30,
    icon: "🐾",
  },
  {
    id: "food",
    name: "Food & Drinks",
    progress: 0,
    total: 25,
    icon: "🍕",
  },
];

export const WORD_LEVELS: WordLevel[] = [
  { level: "Lv.1", count: 0, label: "Beginner" },
  { level: "Lv.2", count: 0, label: "Elementary" },
  { level: "Lv.3", count: 0, label: "Intermediate" },
  { level: "Lv.4", count: 0, label: "Advanced" },
  { level: "Master", count: 0, label: "Master" },
];

export default function LearnPage() {
  const [missions] = useState(MISSIONS_DATA);
  const [topics] = useState(SUGGESTED_TOPICS);
  const [wordLevels] = useState(WORD_LEVELS);

  const totalWords = wordLevels.reduce((acc, level) => acc + level.count, 0);

  const handleStartMission = (missionId: string) => {
    console.log("Start mission:", missionId);
    alert(`Starting mission: ${missionId}`);
  };

  const handleStartTopic = (topicId: string) => {
    console.log("Start topic:", topicId);
    alert(`Starting topic: ${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome to GuruEnglish 👋
                </h1>
                <p className="text-gray-600">
                  Our AI has crafted a unique learning path just for you.
                </p>
              </div>{" "}
              {/* Right Column - Stats */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">Your missions</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                    👍 RECOMMENDED
                  </span>
                </div>
                <div className="space-y-4">
                  {missions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      onStart={handleStartMission}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Suggested topics</h2>
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onStart={handleStartTopic}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="sticky top-24">
                <h2 className="text-xl font-semibold mb-4">
                  Recently learned Topic
                </h2>
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 text-center">
                  <div className="mb-4">
                    <img
                      src="data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='60' fill='%2306b6d4'/%3E%3Ctext x='60' y='75' text-anchor='middle' font-size='40' fill='white'%3E🐬%3C/text%3E%3C/svg%3E"
                      alt="Mascot"
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  <p className="text-blue-900 font-medium">
                    Start learning to view your progress here
                  </p>
                </div>

                <LearningStats
                  wordLevels={wordLevels}
                  totalWords={totalWords}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
