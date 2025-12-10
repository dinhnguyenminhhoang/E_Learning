"use client";

import { DailyGoalStep } from "@/components/onboarding/DailyGoalStep";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getQuestionOnboarding,
  submitOnboarding,
  OnboardingQuestion,
} from "@/services/onboarding.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { ONBOARDING_FEATURES } from "@/constants/onboarding.constants";

const createOnboardingSchema = (steps: OnboardingQuestion[]) => {
  const schemaObj: any = {};
  steps.forEach((step) => {
    if (step.type === "multiple") {
      schemaObj[step.key.toLowerCase()] = z
        .array(z.string())
        .min(1, `Please select at least one ${step.title.toLowerCase()}`);
    } else {
      schemaObj[step.key.toLowerCase()] = z
        .string()
        .min(1, `Please select ${step.title.toLowerCase()}`);
    }
  });
  return z.object(schemaObj);
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingQuestion[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchQuestionsData();
  }, []);

  const fetchQuestionsData = async () => {
    try {
      setLoading(true);
      const response = await getQuestionOnboarding();

      if (response.code === 200 && response.data) {
        const sortedData = response.data.sort((a, b) => a.order - b.order);
        setOnboardingSteps(sortedData);
      } else {
        toast.error("Không thể tải câu hỏi onboarding");
      }
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
      toast.error("Đã xảy ra lỗi khi tải câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultValues = () => {
    const defaults: any = {};
    onboardingSteps.forEach((step) => {
      defaults[step.key.toLowerCase()] = step.type === "multiple" ? [] : "";
    });
    return defaults;
  };

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver:
      onboardingSteps.length > 0
        ? zodResolver(createOnboardingSchema(onboardingSteps))
        : undefined,
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (onboardingSteps.length > 0) {
      reset(getDefaultValues());
    }
  }, [onboardingSteps]);

  const formValues = watch();

  const totalSteps = onboardingSteps.length + 1;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    if (step < totalSteps - 1) {
      const currentStepData = onboardingSteps[step - 1];
      const currentValue = formValues[currentStepData.key.toLowerCase()];

      if (currentStepData.type === "multiple") {
        if (Array.isArray(currentValue) && currentValue.length > 0) {
          setStep(step + 1);
        } else {
          toast.error("Vui lòng chọn ít nhất một tùy chọn");
        }
      } else {
        if (currentValue) {
          setStep(step + 1);
        } else {
          toast.error("Vui lòng chọn một tùy chọn");
        }
      }
    } else {
      const currentStepData = onboardingSteps[step - 1];
      const currentValue = formValues[currentStepData.key.toLowerCase()];

      const isValid =
        currentStepData.type === "multiple"
          ? Array.isArray(currentValue) && currentValue.length > 0
          : !!currentValue;

      if (isValid) {
        handleSubmit(onSubmit)();
      } else {
        toast.error(
          currentStepData.type === "multiple"
            ? "Vui lòng chọn ít nhất một tùy chọn"
            : "Vui lòng chọn một tùy chọn"
        );
      }
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);

      const formattedData = {
        answers: onboardingSteps.map((step) => {
          const value = data[step.key.toLowerCase()];
          return {
            questionKey: step.key,
            answerKeys: Array.isArray(value) ? value : [value],
          };
        }),
      };

      console.log("Submitting data:", formattedData);

      const response = await submitOnboarding(formattedData);

      if (response && (response as any).code === 200) {
        toast.success("Hoàn thành onboarding thành công!");
        setTimeout(() => {
          router.push("/learn");
        }, 1000);
      } else {
        toast.error((response as any).message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Error submitting onboarding:", error);
      toast.error(
        error?.response?.data?.message || "Không thể lưu câu trả lời"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = () => {
    if (step === 0) return true;

    const currentStepData = onboardingSteps[step - 1];
    if (!currentStepData) return false;

    const currentValue = formValues[currentStepData.key.toLowerCase()];

    if (currentStepData.type === "multiple") {
      return Array.isArray(currentValue) && currentValue.length > 0;
    } else {
      return !!currentValue;
    }
  };

  const renderStepComponent = () => {
    if (step === 0) {
      return <WelcomeStep key="welcome" features={ONBOARDING_FEATURES as any} />;
    }

    const currentStepData = onboardingSteps[step - 1];
    if (!currentStepData) return null;

    const fieldKey = currentStepData.key.toLowerCase();
    const currentValue = formValues[fieldKey];

    const mappedOptions = currentStepData.options.map((opt) => ({
      value: opt.key,
      label: opt.label,
      icon: opt.icon,
      description: opt.description,
    }));

    switch (currentStepData.key) {
      case "GOALS":
        return (
          <GoalStep
            key={currentStepData.key}
            goals={mappedOptions}
            value={currentValue}
            onChange={(value) => setValue(fieldKey, value)}
            title={currentStepData.title}
            description={currentStepData.description}
            isMultiple={currentStepData.type === "multiple"}
          />
        );

      case "TIME_COMMITMENT":
        return (
          <DailyGoalStep
            key={currentStepData.key}
            goals={mappedOptions}
            value={currentValue}
            onChange={(value) => setValue(fieldKey, value)}
            title={currentStepData.title}
            description={currentStepData.description}
          />
        );

      case "LEARNING_STYLE":
      case "LEVEL":
        return (
          <GoalStep
            key={currentStepData.key}
            goals={mappedOptions}
            value={currentValue}
            onChange={(value) => setValue(fieldKey, value)}
            title={currentStepData.title}
            description={currentStepData.description}
            isMultiple={currentStepData.type === "multiple"}
          />
        );

      default:
        return (
          <GoalStep
            key={currentStepData.key}
            goals={mappedOptions}
            value={currentValue}
            onChange={(value) => setValue(fieldKey, value)}
            title={currentStepData.title}
            description={currentStepData.description}
            isMultiple={currentStepData.type === "multiple"}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Onboarding</h1>
        {step > 0 && (
          <button
            onClick={() => {
              if (confirm("Bạn có chắc chắn muốn bỏ qua onboarding?")) {
                router.push("/learn");
              }
            }}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
            disabled={submitting}
          >
            Bỏ qua <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>
              Bước {step + 1}/{totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <AnimatePresence mode="wait">{renderStepComponent()}</AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-4">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              className="px-8"
              disabled={submitting}
            >
              Quay lại
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canContinue() || submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : step === totalSteps - 1 ? (
              "Hoàn tất"
            ) : (
              "Tiếp tục"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
