"use client";

import { AgeStep } from "@/components/onboarding/AgeStep";
import { DailyGoalStep } from "@/components/onboarding/DailyGoalStep";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingFormData } from "@/types/onboarding";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Gamepad2, Lightbulb, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export const AGE_RANGES = [
  { value: "under-11", label: "Under 11" },
  { value: "12-17", label: "12 - 17" },
  { value: "18-24", label: "18 - 24" },
  { value: "25-34", label: "25 - 34" },
  { value: "35-44", label: "35 - 44" },
  { value: "45-54", label: "45 - 54" },
  { value: "55-65", label: "55 - 65" },
  { value: "66+", label: "66+" },
];

export const LEARNING_GOALS = [
  { value: "personal-growth", label: "Enhance personal growth" },
  { value: "travel", label: "Prepare for travel and exploration" },
  { value: "connect", label: "Connect with people" },
  { value: "education", label: "Support my education" },
  { value: "career", label: "Boost my career" },
  { value: "fun", label: "Just for fun and enjoyment" },
  { value: "content", label: "Access to more content" },
  { value: "other", label: "Other" },
];

export const DAILY_GOALS = [
  {
    value: "easy",
    label: "Easy",
    words: 5,
    duration: 15,
    yearly: 1800,
    color: "text-green-500",
    icon: "🌱",
  },
  {
    value: "moderate",
    label: "Moderate",
    words: 10,
    duration: 30,
    yearly: 3600,
    color: "text-yellow-500",
    icon: "🔥",
    recommended: true,
  },
  {
    value: "hard",
    label: "Hard",
    words: 15,
    duration: 45,
    yearly: 5400,
    color: "text-orange-500",
    icon: "💪",
  },
  {
    value: "most-challenged",
    label: "Most challenged",
    words: 30,
    duration: 90,
    yearly: 10800,
    color: "text-red-500",
    icon: "🚀",
  },
];
const onboardingSchema = z.object({
  age: z.string().min(1, "Please select your age range"),
  goal: z.string().min(1, "Please select a learning goal"),
  dailyGoal: z.string().min(1, "Please select a daily goal"),
});

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigator = useRouter();
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: "",
      goal: "",
      dailyGoal: "",
    },
  });

  const currentAge = watch("age");
  const currentGoal = watch("goal");
  const currentDailyGoal = watch("dailyGoal");

  const progress = ((step + 1) / 4) * 100;

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && currentAge) {
      setStep(2);
    } else if (step === 2 && currentGoal) {
      setStep(3);
    } else if (step === 3 && currentDailyGoal) {
      handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSubmit = (data: OnboardingFormData) => {
    console.log("Onboarding completed:", data);
    navigator.push("/");
  };

  const canContinue =
    step === 0 ||
    (step === 1 && currentAge) ||
    (step === 2 && currentGoal) ||
    (step === 3 && currentDailyGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Onboarding</h1>
        {step > 0 && (
          <button
            onClick={() => alert("Skip onboarding")}
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
        <AnimatePresence mode="wait">
          {step === 0 && <WelcomeStep key="welcome" features={FEATURES} />}

          {step === 1 && (
            <AgeStep
              key="age"
              ageRanges={AGE_RANGES}
              value={currentAge}
              onChange={(value) => setValue("age", value)}
            />
          )}

          {step === 2 && (
            <GoalStep
              key="goal"
              goals={LEARNING_GOALS}
              value={currentGoal}
              onChange={(value) => setValue("goal", value)}
            />
          )}

          {step === 3 && (
            <DailyGoalStep
              key="daily-goal"
              goals={DAILY_GOALS}
              value={currentDailyGoal}
              onChange={(value) => setValue("dailyGoal", value)}
            />
          )}
        </AnimatePresence>
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
            disabled={!canContinue}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
