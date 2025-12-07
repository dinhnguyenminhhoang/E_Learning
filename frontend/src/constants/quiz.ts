export const DIFFICULTY = {
    EASY: "EASY",
    MEDIUM: "MEDIUM",
    HARD: "HARD",
} as const;

export type DifficultyValue = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

export const DIFFICULTY_LABELS = {
    [DIFFICULTY.EASY]: "Beginner",
    [DIFFICULTY.MEDIUM]: "Intermediate",
    [DIFFICULTY.HARD]: "Advanced",
} as const;
