"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp } from "lucide-react";

interface LearningPathCardProps {
  path: {
    _id: string;
    learningPath: {
      _id: string;
      title: string;
      description?: string;
      key?: string;
    };
    target?: {
      _id: string;
      name: string;
    };
    status: string;
    progress: {
      currentLevel: number;
      completedLessons: string[];
    };
  };
  totalLessons?: number;
  onSwitch: (pathId: string) => void;
  isLoading?: boolean;
}

export function LearningPathCard({
  path,
  totalLessons = 100,
  onSwitch,
  isLoading = false,
}: LearningPathCardProps) {
  const progressPercentage = Math.round(
    (path.progress.completedLessons.length / totalLessons) * 100
  );

  const isActive = path.status === "active";

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg ${
        isActive
          ? "border-2 border-transparent bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-500"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {path.learningPath.title}
            </h3>
            {path.learningPath.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {path.learningPath.description}
              </p>
            )}
          </div>
          {isActive && (
            <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Đang học
            </Badge>
          )}
        </div>

        {path.target && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">Mục tiêu: </span>
            <span className="text-sm font-medium text-gray-700">
              {path.target.name}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Cấp độ</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              Level {path.progress.currentLevel}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Hoàn thành</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {path.progress.completedLessons.length}/{totalLessons}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Tiến độ</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress
            value={progressPercentage}
            className={`h-2 ${path.status === "active" ? "bg-blue-100" : "bg-gray-200"}`}
          />
        </div>

        {!isActive && (
          <Button
            onClick={() => onSwitch(path.learningPath._id)}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {isLoading ? "Đang chuyển..." : "Chuyển sang lộ trình này"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
