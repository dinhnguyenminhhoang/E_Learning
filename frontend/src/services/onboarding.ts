import apiInstance from "@/configs/instance";
import { Feature, OnboardingSubmitData } from "@/types/onboarding";

const getQuestionOnboarding = async () => {
  const response = await apiInstance.get<Feature[]>("/onboarding");
  return response;
};
const submitOnboarding = async (formData: OnboardingSubmitData) => {
  const response = await apiInstance.post("/userOnboardingAnswer", formData);
  return response;
};
export { getQuestionOnboarding, submitOnboarding };
