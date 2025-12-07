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
            const response = await apiClient.get<{ data: LearningPath }>(`/v1/api/learning-path/${id}`);
            return { code: 200, data: response.data };
        } catch (error) {
            return { code: 500, data: null };
        }
    }

    /**
     * Get full details of a learning path for editing
     * Includes: target, levels with lessons (with blocks), finalQuiz
     */
    async getDetailForEdit(id: string): Promise<{
        code: number;
        message: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any | null;
    }> {
        try {
            const response = await apiClient.get(`/v1/api/learning-path/${id}/detail`);
            return response;
        } catch (error) {
            return { code: 500, message: "Failed to fetch details", data: null };
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

    /**
     * Assign a lesson to a level in learning path
     */
    async assignLessonToPath(data: {
        learningPathId: string;
        levelOrder: number;
        lessonId: string;
    }): Promise<{ code: number; message: string; data?: any }> {
        return await apiClient.post("/v1/api/learning-path/lesson", data);
    }

    /**
     * Remove lesson from a level
     * Note: This may need to be implemented in backend if not exists
     */
    async removeLessonFromPath(data: {
        learningPathId: string;
        levelOrder: number;
        lessonId: string;
    }): Promise<{ code: number; message: string }> {
        return await apiClient.delete("/v1/api/learning-path/lesson", { data });
    }

    async updateLevel(
        pathId: string,
        levelOrder: number,
        data: { title: string }
    ): Promise<{ code: number; message: string; data?: any }> {
        return await apiClient.put(`/v1/api/learning-path/${pathId}/level/${levelOrder}`, data);
    }

    async deleteLevel(
        pathId: string,
        levelOrder: number
    ): Promise<{ code: number; message: string; data?: any }> {
        return await apiClient.delete(`/v1/api/learning-path/${pathId}/level/${levelOrder}`);
    }

    async createLevel(
        pathId: string,
        data: { title: string }
    ): Promise<{ code: number; message: string; data?: any }> {
        return await apiClient.post(`/v1/api/learning-path/level/${pathId}`, data);
    }

    async reorderLevels(
        pathId: string,
        levelOrders: number[]
    ): Promise<{ code: number; message: string; data?: any }> {
        return await apiClient.put(`/v1/api/learning-path/${pathId}/levels/reorder`, { levelOrders });
    }
}

export const learningPathAdminService = new LearningPathAdminService();
