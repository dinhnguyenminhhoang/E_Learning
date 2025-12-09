import { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface OnboardingOption {
  key: string;
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

export interface OnboardingResponse {
  status: string;
  message: string;
  data: OnboardingQuestion[];
  code: number;
  timestamp: string;
}

export interface UserAnswer {
  questionKey: string;
  answerKeys: string[];
}

export interface OnboardingSubmitPayload {
  answers: UserAnswer[];
}

export interface AgeRange {
  value: string;
  label: string;
}
