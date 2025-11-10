import { apiClient } from "@/config/api.config";

export interface OnboardingQuestion {
  _id: string;
  key: string;
  title: string;
  description?: string;
  type: string;
  options: Array<{
    key: string;
    label: string;
    icon?: string;
    description?: string;
  }>;
  order: number;
}

export interface UserAnswer {
  questionKey: string;
  answerKeys: string[];
}

class OnboardingService {
  async getQuestions() {
    return await apiClient.get("/v1/api/onboarding/");
  }

  async saveAnswers(answers: UserAnswer[]) {
    return await apiClient.post("/v1/api/userOnboardingAnswer/", { answers });
  }
}

export const onboardingService = new OnboardingService();
