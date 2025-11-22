import { Quiz, CreateQuizInput } from "@/types/admin";

const MOCK_QUIZZES: Quiz[] = [
    {
        _id: "quiz-1",
        title: "Grammar Basics Quiz",
        description: "Test your understanding of basic grammar rules",
        skill: "grammar",
        difficulty: "beginner",
        questions: [
            {
                _id: "q1",
                type: "multiple-choice",
                question: "What is the plural of 'child'?",
                options: ["childs", "children", "childes", "child"],
                correctAnswer: 1,
                explanation: "The irregular plural of 'child' is 'children'",
                points: 10,
            },
        ],
        timeLimit: 600,
        passingScore: 70,
        status: "published",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
    },
    {
        _id: "quiz-2",
        title: "Vocabulary Test - Level 1",
        description: "Basic vocabulary assessment",
        skill: "vocabulary",
        difficulty: "beginner",
        questions: [],
        timeLimit: 900,
        passingScore: 60,
        status: "draft",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-05"),
    },
];

class QuizService {
    private quizzes: Quiz[] = [...MOCK_QUIZZES];

    async getAll(): Promise<{ code: number; data: Quiz[] }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { code: 200, data: this.quizzes };
    }

    async getById(id: string): Promise<{ code: number; data: Quiz | null }> {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const quiz = this.quizzes.find((q) => q._id === id);
        return { code: quiz ? 200 : 404, data: quiz || null };
    }

    async create(input: CreateQuizInput): Promise<{ code: number; data: Quiz }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newQuiz: Quiz = {
            _id: `quiz-${Date.now()}`,
            ...input,
            questions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.quizzes.push(newQuiz);
        return { code: 201, data: newQuiz };
    }

    async update(id: string, input: Partial<CreateQuizInput>): Promise<{ code: number; data: Quiz | null }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.quizzes.findIndex((q) => q._id === id);
        if (index === -1) return { code: 404, data: null };

        this.quizzes[index] = {
            ...this.quizzes[index],
            ...input,
            updatedAt: new Date(),
        };

        return { code: 200, data: this.quizzes[index] };
    }

    async delete(id: string): Promise<{ code: number; message: string }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.quizzes.findIndex((q) => q._id === id);
        if (index === -1) return { code: 404, message: "Quiz not found" };

        this.quizzes.splice(index, 1);
        return { code: 200, message: "Quiz deleted successfully" };
    }
}

export const quizAdminService = new QuizService();
