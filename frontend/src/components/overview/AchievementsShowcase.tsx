"use client";

import { Achievement } from '@/types/learning';
import { Trophy, Check } from 'lucide-react';

interface AchievementsShowcaseProps {
  achievements: Achievement[];
}

export default function AchievementsShowcase({ achievements }: AchievementsShowcaseProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Recent Achievements
        </h2>
        <p className="text-gray-600">Complete lessons to unlock achievements!</p>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'from-gray-400 to-gray-500',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6" />
        Recent Achievements
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {achievements.slice(0, 4).map((achievement) => (
          <div
            key={achievement._id}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${getRarityColor(achievement.achievement.rarity)} flex items-center justify-center text-3xl`}>
              {achievement.achievement.icon}
            </div>
            <h3 className="font-bold text-sm text-gray-800 mb-1">
              {achievement.achievement.name}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2">
              {achievement.achievement.description}
            </p>
            {achievement.unlockedAt && (
              <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                <Check className="w-3 h-3" />
                Unlocked
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
