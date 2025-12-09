import { apiClient } from "@/config/api.config";

import { OnboardingResponse, OnboardingSubmitPayload } from "@/types/onboarding";

export async function getQuestionOnboarding(): Promise<OnboardingResponse> {
  const response = await apiClient.get<OnboardingResponse>("/v1/api/onboarding/");
  return response;
}

export async function submitOnboarding(data: OnboardingSubmitPayload) {
  const response = await apiClient.post<any>("/v1/api/userOnboardingAnswer/", data);
  return response;
}
