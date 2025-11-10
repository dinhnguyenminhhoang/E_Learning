import { apiClient } from "@/config/api.config";

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

export async function getQuestionOnboarding(): Promise<OnboardingResponse> {
  const response = await apiClient.get("/v1/api/onboarding/");
  return response;
}

export async function submitOnboarding(data: OnboardingSubmitPayload) {
  const response = await apiClient.post("/v1/api/userOnboardingAnswer/", data);
  return response;
}
