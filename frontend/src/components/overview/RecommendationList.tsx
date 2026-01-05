"use client";

import Link from 'next/link';
import { RecommendedLesson } from '@/types/learning';
import { Lightbulb, Pin, Clock, Target } from 'lucide-react';

interface RecommendationListProps {
  recommendations: RecommendedLesson[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          Recommended for You
        </h2>
        <p className="text-gray-600">
          Complete more lessons to get personalized recommendations!
        </p>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    const classes: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700'
    };
    return classes[priority] || classes.medium;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Lightbulb className="w-6 h-6" />
        Recommended for You
      </h2>
      <p className="text-gray-600 mb-6">
        Based on your skill analysis, we suggest practicing these lessons
      </p>

      <div className="space-y-4">
        {recommendations.map((lesson) => (
          <Link
            key={lesson._id}
            href={`/learn/topic-list?lessonId=${lesson._id}`}
            className="block bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              {lesson.thumbnail && (
                <img
                  src={lesson.thumbnail}
                  alt={lesson.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                    {lesson.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(lesson.priority)} flex-shrink-0 ml-2`}>
                    {lesson.priority} priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="capitalize flex items-center gap-1">
                    <Pin className="w-4 h-4" />
                    {lesson.skill}
                  </span>
                  {lesson.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {lesson.duration_minutes} min
                    </span>
                  )}
                  <span className="capitalize flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {lesson.level}
                  </span>
                </div>
                {lesson.reason && (
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    → {lesson.reason}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
