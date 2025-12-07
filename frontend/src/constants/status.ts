/**
 * Status constants - Synced with backend
 * Source: backend/src/constants/status.constants.js
 */

export const STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ARCHIVED: "archived",
    SUSPENDED: "suspended",
    PENDING: "pending",
    DELETED: "deleted",
    DRAFT: "draft",
} as const;

export const QUIZ_STATUS = {
    DRAFT: "draft",
    PUBLISHED: "published",
    ARCHIVED: "archived",
    COMPLETED: "completed",
    ABANDONED: "abandoned",
    INPROGRESS: "in_progress",
} as const;

export const ONBOARDING_STATUS = {
    NOT_STARTED: "not_started",
    STARTED: "started",
    COMPLETED: "completed",
} as const;

// Type exports for TypeScript
export type StatusValue = (typeof STATUS)[keyof typeof STATUS];
export type QuizStatusValue = (typeof QUIZ_STATUS)[keyof typeof QUIZ_STATUS];
export type OnboardingStatusValue = (typeof ONBOARDING_STATUS)[keyof typeof ONBOARDING_STATUS];
