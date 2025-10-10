export interface Feature {
  key: string;
  label: string;
  icon: string;
  description: string;
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
export interface Answer {
  questionKey: string;
  answerKeys: string[];
}

export interface OnboardingSubmitData {
  answers: Answer[];
}
