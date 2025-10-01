import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DailyGoal } from "@/types/onboarding";

interface DailyGoalStepProps {
  goals: DailyGoal[];
  value: string;
  onChange: (value: string) => void;
}

export function DailyGoalStep({ goals, value, onChange }: DailyGoalStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">My daily goal</h2>
        <p className="text-gray-600">
          Let's make a small step toward your goal!
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.value} className="relative">
              <RadioGroupItem
                value={goal.value}
                id={goal.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={goal.value}
                className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all relative"
              >
                <div className="text-4xl">{goal.icon}</div>
                <div className="flex-1">
                  <div className={cn("font-bold text-lg mb-1", goal.color)}>
                    {goal.label}: {goal.words} new words
                  </div>
                  <div className="text-sm text-gray-600">
                    Learn {goal.duration} mins/day · Gain{" "}
                    {goal.yearly.toLocaleString()} words/year
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-600 flex items-center justify-center">
                  {value === goal.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                {goal.recommended && (
                  <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    👍 MOST RECOMMENDED
                  </div>
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <p className="text-center text-sm text-gray-500 mt-6">
        Change this anytime in the settings
      </p>
    </motion.div>
  );
}
