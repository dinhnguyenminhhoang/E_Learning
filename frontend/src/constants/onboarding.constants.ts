import { Gamepad2, Lightbulb, Sparkles } from "lucide-react";

export const ONBOARDING_FEATURES = [
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
] as const;

