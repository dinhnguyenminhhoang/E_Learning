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

      const response = await userLearningPathService.getPathByUser();

      if (response.code === 200 && response.data) {
        setProgress(response.data);
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
