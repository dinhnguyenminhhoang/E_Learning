"use client";

import { BookOpen, GraduationCap, X } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { GameType, TopicDetailData } from "@/types/learning";
import LearningTab from "./LearningTab";
import WordListTab from "./WordListTab";

const MOCK_TOPIC_DATA: TopicDetailData = {
  id: "greeting",
  name: "Greeting",
  icon: "💬",
  progress: 0,
  total: 38,
  words: [
    { id: "1", word: "Hello", status: "not-learned" },
    { id: "2", word: "Hi", status: "not-learned" },
    { id: "3", word: "Hello", status: "not-learned" },
    { id: "4", word: "Good morning", status: "not-learned" },
    { id: "5", word: "Good afternoon", status: "not-learned" },
    { id: "6", word: "Good night", status: "not-learned" },
    { id: "7", word: "Good evening", status: "not-learned" },
    { id: "8", word: "Hello everyone", status: "not-learned" },
    { id: "9", word: "Hey there", status: "not-learned" },
    { id: "10", word: "How are you?", status: "not-learned" },
  ],
};

const GAME_TYPES: GameType[] = [
  { id: "spelling", name: "Spelling game", enabled: true },
  { id: "multiple-choice", name: "Multiple choice", enabled: true },
  { id: "anagram", name: "Anagram", enabled: true },
];

export function TopicDetailModal({
  open,
  onOpenChange,
  topicData = MOCK_TOPIC_DATA,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicData?: TopicDetailData;
}) {
  const [activeTab, setActiveTab] = useState<"learning" | "wordlist">(
    "wordlist"
  );
  const [filterType, setFilterType] = useState("all");
  const [wordsPerTurn, setWordsPerTurn] = useState("5");
  const [gameTypes, setGameTypes] = useState<GameType[]>(GAME_TYPES);

  const progressPercent = (topicData.progress / topicData.total) * 100;

  const handleToggleGame = (gameId: string) => {
    setGameTypes((prev) =>
      prev.map((game) =>
        game.id === gameId ? { ...game, enabled: !game.enabled } : game
      )
    );
  };

  const handleStartLearning = () => {
    const enabledGames = gameTypes.filter((g) => g.enabled);
    console.log("Starting learning with:", {
      wordsPerTurn,
      games: enabledGames,
      topicId: topicData.id,
    });
    alert(
      `Starting learning!\nWords per turn: ${wordsPerTurn}\nGames: ${enabledGames
        .map((g) => g.name)
        .join(", ")}`
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl min-w-2xl max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="sr-only">
          <DialogTitle>Topic details: {topicData.name}</DialogTitle>
          <DialogDescription>
            Configure learning and view the word list for this topic.
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-6 top-6 z-20 rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </DialogClose>

        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
              {topicData.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {topicData.name}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span className="font-medium">
                    {topicData.progress}/{topicData.total}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="learning"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Learning
              </TabsTrigger>
              <TabsTrigger
                value="wordlist"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Word list
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "wordlist" && (
            <>
              {/* Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All words" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All words</SelectItem>
                    <SelectItem value="not-learned">Not learned</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="mastered">Mastered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <WordListTab words={topicData.words} filterType={filterType} />
            </>
          )}

          {activeTab === "learning" && (
            <LearningTab
              wordsPerTurn={wordsPerTurn}
              setWordsPerTurn={setWordsPerTurn}
              gameTypes={gameTypes}
              onToggleGame={handleToggleGame}
              onStartLearning={handleStartLearning}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
