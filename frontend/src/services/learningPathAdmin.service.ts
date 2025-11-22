import { LearningPath, CreateLearningPathInput } from "@/types/admin";

const MOCK_PATHS: LearningPath[] = [
    {
        _id: "path-1",
        title: "English for Beginners",
        description: "Complete beginner course for English learners",
        target: "new-learners",
        key: "beginner-path",
        level: "beginner",
        levels: [
            {
                order: 1,
                title: "Foundation",
                lessons: [
                    { lesson: "lesson-1", order: 1 },
                    { lesson: "lesson-2", order: 2 },
                ],
            },
        ],
        status: "active",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
    },
    {
        _id: "path-2",
        title: "Business English Mastery",
        description: "Professional English for business communication",
        target: "business-professionals",
        key: "business-path",
        level: "intermediate",
        levels: [
            {
                order: 1,
                title: "Business Communication",
                lessons: [{ lesson: "lesson-3", order: 1 }],
            },
        ],
        status: "active",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-02-01"),
    },
];

class LearningPathService {
    private paths: LearningPath[] = [...MOCK_PATHS];

    async getAll(): Promise<{ code: number; data: LearningPath[] }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { code: 200, data: this.paths };
    }

    async getById(id: string): Promise<{ code: number; data: LearningPath | null }> {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const path = this.paths.find((p) => p._id === id);
        return { code: path ? 200 : 404, data: path || null };
    }

    async create(input: CreateLearningPathInput): Promise<{ code: number; data: LearningPath }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newPath: LearningPath = {
            _id: `path-${Date.now()}`,
            ...input,
            levels: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.paths.push(newPath);
        return { code: 201, data: newPath };
    }

    async update(id: string, input: Partial<CreateLearningPathInput>): Promise<{ code: number; data: LearningPath | null }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.paths.findIndex((p) => p._id === id);
        if (index === -1) return { code: 404, data: null };

        this.paths[index] = {
            ...this.paths[index],
            ...input,
            updatedAt: new Date(),
        };

        return { code: 200, data: this.paths[index] };
    }

    async delete(id: string): Promise<{ code: number; message: string }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.paths.findIndex((p) => p._id === id);
        if (index === -1) return { code: 404, message: "Path not found" };

        this.paths.splice(index, 1);
        return { code: 200, message: "Path deleted successfully" };
    }
}

export const learningPathAdminService = new LearningPathService();
