"use client";

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PathSuggestionBannerProps {
  suggestion: {
    shouldEnroll: boolean;
    suggestedPath?: {
      _id: string;
      title: string;
      description: string;
      level: string;
    };
    reason?: string;
  };
}

export default function PathSuggestionBanner({ suggestion }: PathSuggestionBannerProps) {
  if (!suggestion.shouldEnroll || !suggestion.suggestedPath) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl shadow-xl p-6 mb-8 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-7 h-7" />
            Ready for the Next Level!
          </h3>
          <p className="text-white/90 mb-3">
            {suggestion.reason}
          </p>
          <div className="bg-white/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <h4 className="font-bold text-lg mb-1">{suggestion.suggestedPath.title}</h4>
            <p className="text-sm text-white/80">{suggestion.suggestedPath.description}</p>
            <p className="text-xs text-white/70 mt-2 capitalize">Level: {suggestion.suggestedPath.level}</p>
          </div>
        </div>
        <Link
          href={`/onboarding?pathId=${suggestion.suggestedPath._id}`}
          className="ml-6 bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex-shrink-0 flex items-center gap-2"
        >
          Enroll Now
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
