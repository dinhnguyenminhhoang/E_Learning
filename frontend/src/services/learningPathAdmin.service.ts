import { apiClient } from "@/config/api.config";
import { LearningPath, CreateLearningPathInput } from "@/types/admin";

class LearningPathAdminService {
    /**
     * Get all learning paths
     */
    async getAll(): Promise<{ code: number; message: string; data: LearningPath[] }> {
        return await apiClient.get("/v1/api/learning-path/");
    }

    /**
     * Get a single learning path by ID
     */
    async getById(id: string): Promise<{ code: number; data: LearningPath | null }> {
        try {
            const response = await this.getAll();
            if (response.code === 200) {
                const path = response.data.find((p: LearningPath) => p._id === id);
                return { code: path ? 200 : 404, data: path || null };
            }
            return { code: response.code, data: null };
        } catch (error) {
            return { code: 500, data: null };
        }
    }

    /**
     * Create a new learning path
     * Note: Backend requires targetId, not target string
     */
    async create(input: CreateLearningPathInput & { targetId?: string }): Promise<{
        code: number;
        message: string;
        data: LearningPath
    }> {
        return await apiClient.post("/v1/api/learning-path/", input);
    }

    /**
     * Update a learning path
     */
    async update(
        id: string,
        input: Partial<CreateLearningPathInput>
    ): Promise<{ code: number; data: LearningPath | null }> {
        try {
            const response = await apiClient.put<{ data: LearningPath }>(
                `/v1/api/learning-path/${id}`,
                input
            );
            return { code: 200, data: response.data };
        } catch (error) {
            return { code: 500, data: null };
        }
    }

    /**
     * Delete a learning path (soft delete)
     */
    async delete(id: string): Promise<{ code: number; message: string }> {
        try {
            await apiClient.delete(`/v1/api/learning-path/${id}`);
            return { code: 200, message: "Path deleted successfully" };
        } catch (error) {
            return { code: 500, message: "Failed to delete path" };
        }
    }

    /**
     * Assign a target to a learning path
     */
    async assignTarget(learningPathId: string, targetId: string): Promise<{
        code: number;
        message: string;
        data?: LearningPath;
    }> {
        return await apiClient.put(
            `/v1/api/learning-path/${learningPathId}/target`,
            { targetId }
        );
    }

    /**
     * Attach a quiz to a level
     */
    async attachQuizToLevel(data: {
        learningPathId: string;
        levelOrder: number;
        quizId: string;
    }): Promise<{ code: number; message: string; data?: any }> {
        return await apiClient.post("/v1/api/learning-path/attach-quiz", data);
    }

    /**
     * Remove quiz from a level
     */
    async removeQuizFromLevel(data: {
        learningPathId: string;
        levelOrder: number;
    }): Promise<{ code: number; message: string }> {
        return await apiClient.delete(
            "/v1/api/learning-path/remove-quiz-from-level",
            { data }
        );
    }
}

export const learningPathAdminService = new LearningPathAdminService();
