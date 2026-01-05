"use client";

import { StudySchedule } from '@/types/learning';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface StudyScheduleCardProps {
  schedule: StudySchedule;
}

export default function StudyScheduleCard({ schedule }: StudyScheduleCardProps) {
  if (!schedule) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-lg p-6 border border-blue-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Study Schedule
      </h2>
      <div className="space-y-3">
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Suggested Time
          </p>
          <p className="text-lg font-bold text-blue-600">{schedule.suggestedTime}</p>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Duration</p>
          <p className="text-lg font-bold text-purple-600">{schedule.suggestedDuration} minutes</p>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Activities
          </p>
          <ul className="space-y-1">
            {schedule.suggestedActivities.map((activity, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gray-500 italic mt-2">{schedule.reasoning}</p>
      </div>
    </div>
  );
}
