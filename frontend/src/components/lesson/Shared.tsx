"use client";
import { ReactNode } from "react";

export function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="w-full flex items-center justify-between px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      {right}
    </div>
  );
}

export function SlideContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-sky-50 to-white">
      {children}
    </div>
  );
}
