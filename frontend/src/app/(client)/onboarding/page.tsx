"use client";

import { DailyGoalStep } from "@/components/onboarding/DailyGoalStep";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getQuestionOnboarding, submitOnboarding } from "@/services/onboarding";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Gamepad2, Lightbulb, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const FEATURES = [
  {
    icon: Sparkles,
    title: "Broaden",
    description: "theme-based vocabularies.",
    color: "bg-yellow-500",
  },
  {
    icon: Gamepad2,
    title: "Engage",
    description: "many fun word games.",
    color: "bg-green-500",
  },
  {
    icon: Lightbulb,
    title: "Study Less - Remember More",
    description: "with scientific methods - Spaced Repetition.",
    color: "bg-blue-500",
  },
];

const createOnboardingSchema = (steps: any[]) => {
  const schemaObj: any = {};
  steps.forEach((step) => {
    schemaObj[step.key.toLowerCase()] = z
      .string()
      .min(1, `Please select ${step.title.toLowerCase()}`);
  });
  return z.object(schemaObj);
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [onboardingSteps, setOnboardingSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigator = useRouter();

  useEffect(() => {
    const fetchQuestionsData = async () => {
      try {
        setLoading(true);
        const response = await getQuestionOnboarding();
        console.log("Response from API:", response);

        if (response.code === 200 && response.data) {
          setOnboardingSteps(response.data);
        }
      } catch (error) {
        console.error("Error fetching onboarding data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionsData();
  }, []);

  const getDefaultValues = () => {
    const defaults: any = {};
    onboardingSteps.forEach((step) => {
      defaults[step.key.toLowerCase()] = "";
    });
    return defaults;
  };

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver:
      onboardingSteps.length > 0
        ? zodResolver(createOnboardingSchema(onboardingSteps))
        : undefined,
    defaultValues: getDefaultValues(),
  });

  const formValues = watch();

  const totalSteps = onboardingSteps.length + 1;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step < totalSteps - 1) {
      const currentStepData = onboardingSteps[step - 1];
      const currentValue = formValues[currentStepData.key.toLowerCase()];

      if (currentValue) {
        setStep(step + 1);
      }
    } else {
      const currentStepData = onboardingSteps[step - 1];
      const currentValue = formValues[currentStepData.key.toLowerCase()];

      if (currentValue) {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        answers: onboardingSteps.map((step) => ({
          questionKey: step.key,
          answerKeys: [data[step.key.toLowerCase()]],
        })),
      };

      const response = await submitOnboarding(formattedData);
      console.log("response after submit:", response);
      if (response.code) {
        navigator.push("/learn");
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
    }
  };

  const canContinue = () => {
    if (step === 0) return true;

    const currentStepData = onboardingSteps[step - 1];
    if (!currentStepData) return false;

    const currentValue = formValues[currentStepData.key.toLowerCase()];
    return !!currentValue;
  };

  const renderStepComponent = () => {
    if (step === 0) {
      return <WelcomeStep key="welcome" features={FEATURES} />;
    }

    const currentStepData = onboardingSteps[step - 1];
    if (!currentStepData) return null;

    const fieldKey = currentStepData.key.toLowerCase();
    const currentValue = formValues[fieldKey];

    const mappedOptions = currentStepData.options.map((opt: any) => ({
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
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
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
              if (confirm("Are you sure you want to skip onboarding?")) {
                navigator.push("/learn");
              }
            }}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            Skip onboarding <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="px-6 mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <AnimatePresence mode="wait">{renderStepComponent()}</AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto flex gap-4">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              className="px-8"
            >
              Previous
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canContinue()}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {step === totalSteps - 1 ? "Get Started" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
