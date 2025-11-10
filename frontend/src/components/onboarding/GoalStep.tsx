import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface GoalStepProps {
  goals: Goal[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  title: string;
  description?: string;
  isMultiple?: boolean;
}

export function GoalStep({
  goals,
  value,
  onChange,
  title,
  description,
  isMultiple = false,
}: GoalStepProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const handleSelect = (goalValue: string) => {
    if (isMultiple) {
      const newValues = selectedValues.includes(goalValue)
        ? selectedValues.filter((v) => v !== goalValue)
        : [...selectedValues, goalValue];
      onChange(newValues);
    } else {
      onChange(goalValue);
    }
  };

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
        {isMultiple && (
          <p className="text-sm text-blue-600 mt-2">
            Bạn có thể chọn nhiều mục tiêu
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const isSelected = selectedValues.includes(goal.value);

          return (
            <motion.button
              key={goal.value}
              onClick={() => handleSelect(goal.value)}
              className={cn(
                "relative p-6 rounded-2xl border-2 transition-all text-left",
                "hover:shadow-lg hover:scale-[1.02]",
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              <div className="flex items-start gap-4">
                {goal.icon && (
                  <span className="text-3xl flex-shrink-0">{goal.icon}</span>
                )}
                <div className="flex-1">
                  <h3
                    className={cn(
                      "font-semibold text-lg mb-1",
                      isSelected ? "text-blue-900" : "text-gray-900"
                    )}
                  >
                    {goal.label}
                  </h3>
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

      {isMultiple && selectedValues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            Đã chọn:{" "}
            <span className="font-semibold text-blue-600">
              {selectedValues.length}
            </span>{" "}
            mục tiêu
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
