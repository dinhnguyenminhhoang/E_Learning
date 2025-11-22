import { useState, useEffect, useCallback } from "react";
import { learningPathService } from "@/services/learningPath.service";
import { LearningPathHierarchyParams } from "@/types/learning";

export function useLearningPath() {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllPaths = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = (await learningPathService.getAllPath()) as any;

      if (response.code === 200 && response.data) {
        setPaths(response.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch learning paths");
      console.error("Error fetching learning paths:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHierarchy = useCallback(
    async (params: LearningPathHierarchyParams) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          (await learningPathService.getLearningPathHierarchy(params)) as any;

        if (response.code === 200) {
          return response.data;
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch hierarchy");
        console.error("Error fetching hierarchy:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAllPaths();
  }, [fetchAllPaths]);

  return {
    paths,
    loading,
    error,
    fetchHierarchy,
    refetch: fetchAllPaths,
  };
}
