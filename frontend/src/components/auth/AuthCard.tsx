import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 via-teal-600/10 to-emerald-600/10 rounded-3xl blur-xl"></div>
      <div className="relative rounded-3xl border border-teal-500/20 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500"></div>
        <div className="p-8 md:p-12">{children}</div>
      </div>
    </div>
  );
}
