export interface Feature {
  key: string;
  label: string;
  icon: string;
  description: string;
}

export interface OnboardingOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface OnboardingQuestion {
  _id: string;
  key: string;
  title: string;
  description?: string;
  type: "single" | "multiple";
  options: OnboardingOption[];
  order: number;
  status: string;
}

export interface Answer {
  questionKey: string;
  answerKeys: string[];
}

export interface OnboardingSubmitData {
  answers: Answer[];
}
