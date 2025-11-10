import { motion } from "framer-motion";
import { Check, Clock, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyGoal {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface DailyGoalStepProps {
  goals: DailyGoal[];
  value: string;
  onChange: (value: string) => void;
  title: string;
  description?: string;
}

export function DailyGoalStep({
  goals,
  value,
  onChange,
  title,
  description,
}: DailyGoalStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">{title}</h2>
        {description && <p className="text-gray-600 text-lg">{description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => {
          const isSelected = value === goal.value;

          return (
            <motion.button
              key={goal.value}
              onClick={() => onChange(goal.value)}
              className={cn(
                "relative p-6 rounded-2xl border-2 transition-all",
                "hover:shadow-lg hover:scale-[1.02]",
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-6">
                {goal.icon && (
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0",
                      isSelected ? "bg-blue-100" : "bg-gray-100"
                    )}
                  >
                    {goal.icon}
                  </div>
                )}

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className={cn(
                        "font-bold text-xl",
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}
                    >
                      {goal.label}
                    </h3>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  {goal.description && (
                    <p
                      className={cn(
                        "text-sm",
                        isSelected ? "text-blue-700" : "text-gray-600"
                      )}
                    >
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Thời gian</p>
            <p className="text-sm font-semibold text-gray-900">Linh hoạt</p>
          </div>
          <div>
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Mục tiêu</p>
            <p className="text-sm font-semibold text-gray-900">Tùy chỉnh</p>
          </div>
          <div>
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Tiến độ</p>
            <p className="text-sm font-semibold text-gray-900">Đo lường</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
