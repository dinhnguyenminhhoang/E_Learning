import { useState, useEffect, useCallback } from "react";
import { userLearningPathService } from "@/services/userLearningPath.service";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProgress {
  learningPathId: string;
  currentLevel: number;
  currentLesson: number;
  completedLessons: string[];
  totalTimeSpent: number;
  lastAccAt: string;
  dailyGoal?: number;
  totalWordsLearned?: number;
}

export function useUserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = (await userLearningPathService.getPathByUser()) as any;

      if (response.code === 200 && response.data) {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        if (data) {
          setProgress({
            learningPathId: data.learningPath,
            currentLevel: data.progress?.currentLevel || 1,
            currentLesson: data.progress?.currentLesson || 1,
            completedLessons: data.progress?.completedLessons || [],
            totalTimeSpent: data.totalTimeSpent || 0,
            lastAccAt: data.lastAccAt,
            dailyGoal: data.dailyGoal,
            totalWordsLearned: data.progress?.completedLessons?.length || 0 // Approximate
          });
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch progress");
      console.error("Error fetching user progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
  };
}
