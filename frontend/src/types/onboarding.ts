export interface Feature {
  icon: any;
  title: string;
  description: string;
  color: string;
}

export interface AgeRange {
  value: string;
  label: string;
}

export interface LearningGoal {
  value: string;
  label: string;
}

export interface DailyGoal {
  value: string;
  label: string;
  words: number;
  duration: number;
  yearly: number;
  color: string;
  icon: string;
  recommended?: boolean;
}

export interface OnboardingFormData {
  age: string;
  goal: string;
  dailyGoal: string;
}
