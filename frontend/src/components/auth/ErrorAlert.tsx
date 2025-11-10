import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-200">{message}</p>
    </div>
  );
}
