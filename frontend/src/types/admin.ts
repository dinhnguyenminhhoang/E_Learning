// Category types for admin management

export interface Category {
    _id: string;
    name: string;
    nameVi: string;
    slug: string;
    description?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryInput {
    name: string;
    nameVi: string;
    slug: string;
    description?: string;
    status: 'active' | 'inactive';
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
    _id: string;
}

// Lesson types
export interface Lesson {
    _id: string;
    title: string;
    description?: string;
    topic: string;
    skill: 'reading' | 'writing' | 'listening' | 'speaking';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    order: number;
    blocks?: Block[];
    status: 'draft' | 'published' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

export interface Block {
    _id: string;
    type: 'vocabulary' | 'grammar' | 'quiz' | 'media';
    title: string;
    order: number;
}

export interface CreateLessonInput {
    title: string;
    description?: string;
    topic: string;
    skill: 'reading' | 'writing' | 'listening' | 'speaking';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    status: 'draft' | 'published' | 'archived';
}

export interface UpdateLessonInput extends Partial<CreateLessonInput> {
    _id: string;
}

// Learning Path types
export interface LearningPath {
    _id: string;
    title: string;
    description?: string;
    target: string;
    key: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    levels: PathLevel[];
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export interface PathLevel {
    order: number;
    title: string;
    lessons: { lesson: string; order: number }[];
    finalQuiz?: string;
}

export interface CreateLearningPathInput {
    title: string;
    description?: string;
    target: string;
    key: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    status: 'active' | 'inactive';
}

// Quiz types
export interface Quiz {
    _id: string;
    title: string;
    description?: string;
    skill: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    questions: Question[];
    timeLimit?: number;
    passingScore: number;
    status: 'draft' | 'published';
    createdAt: Date;
    updatedAt: Date;
}

export interface Question {
    _id: string;
    type: 'multiple-choice' | 'true-false' | 'fill-blank';
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanation?: string;
    points: number;
}

export interface CreateQuizInput {
    title: string;
    description?: string;
    skill: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeLimit?: number;
    passingScore: number;
    status: 'draft' | 'published';
}

// User types
export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
    status: 'active' | 'inactive';
    learningPathsCount: number;
    createdAt: Date;
    lastLoginAt?: Date;
}

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
}

// Flashcard types
export interface CardDeck {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    cards: FlashCard[];
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export interface FlashCard {
    _id: string;
    front: string;
    back: string;
    image?: string;
    audio?: string;
    difficulty: number;
    tags: string[];
}

export interface CreateCardDeckInput {
    name: string;
    description?: string;
    category?: string;
    status: 'active' | 'inactive';
}
