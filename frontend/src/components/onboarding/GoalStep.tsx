import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LearningGoal } from "@/types/onboarding";

interface GoalStepProps {
  goals: LearningGoal[];
  value: string;
  onChange: (value: string) => void;
}

export function GoalStep({ goals, value, onChange }: GoalStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-8">
        <img
          src="data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='60' fill='%2306b6d4'/%3E%3Ctext x='60' y='75' text-anchor='middle' font-size='40' fill='white'%3E🐬%3C/text%3E%3C/svg%3E"
          alt="Avatar"
          className="w-24 h-24 mx-auto mb-6"
        />
        <div className="bg-white rounded-2xl p-6 inline-block mb-8 shadow-sm border-2 border-gray-900">
          <h2 className="text-2xl font-semibold">
            You would like to learn vocabulary to...
          </h2>
        </div>
      </div>

      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.value}>
              <RadioGroupItem
                value={goal.value}
                id={goal.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={goal.value}
                className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 py-5 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all h-full"
              >
                <span className="text-sm font-medium text-center text-blue-900">
                  {goal.label}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </motion.div>
  );
}
