import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Feature } from "@/types/onboarding";

interface WelcomeStepProps {
  features: Feature[];
}

export function WelcomeStep({ features }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          With <span className="text-cyan-500">E-Learing</span>, you can:
        </h2>
      </div>

      <div className="space-y-6 mb-12">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                feature.color
              )}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 pt-2">
              <p className="text-lg">
                <span className="font-semibold">{feature.title}</span>{" "}
                <span className="text-gray-600">{feature.description}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mb-8">
        <img
          src="data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23e0f2fe'/%3E%3Ccircle cx='150' cy='100' r='80' fill='%2306b6d4'/%3E%3Ctext x='150' y='110' text-anchor='middle' font-size='24' fill='white'%3E🐬📚💻%3C/text%3E%3C/svg%3E"
          alt="Gurulango mascot"
          className="w-64 h-auto"
        />
      </div>
    </motion.div>
  );
}
