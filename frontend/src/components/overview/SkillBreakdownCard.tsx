"use client";

import { SkillScore } from '@/types/learning';
import { Headphones, Mic, BookOpen, PenTool, FileText, Book, Target } from 'lucide-react';

interface SkillBreakdownCardProps {
  skills: SkillScore[];
}

export default function SkillBreakdownCard({ skills }: SkillBreakdownCardProps) {
  const getColorClass = (category: string) => {
    switch (category) {
      case 'strong': return 'from-green-500 to-green-600';
      case 'moderate': return 'from-yellow-500 to-yellow-600';
      case 'weak': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getIcon = (skill: string) => {
    const iconProps = { className: "w-6 h-6", strokeWidth: 2 };

    switch (skill) {
      case 'listening': return <Headphones {...iconProps} />;
      case 'speaking': return <Mic {...iconProps} />;
      case 'reading': return <BookOpen {...iconProps} />;
      case 'writing': return <PenTool {...iconProps} />;
      case 'grammar': return <FileText {...iconProps} />;
      case 'vocabulary': return <Book {...iconProps} />;
      default: return <Target {...iconProps} />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Target className="w-6 h-6" />
        Skill Breakdown
      </h2>
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.skill} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-gray-700">
                  {getIcon(skill.skill)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 capitalize">
                    {skill.skill}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {skill.skill === 'vocabulary' && skill.totalWordsLearned !== undefined ? (
                      <>{skill.totalWordsLearned} words learned</>
                    ) : (
                      <>{skill.totalAttempts} attempts • {skill.accuracy.toFixed(0)}% accuracy</>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 mb-1">Score</span>
                  <div className="text-2xl font-bold text-gray-800">
                    {skill.score.toFixed(0)}
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full mt-2 ${
                  skill.category === 'strong' ? 'bg-green-100 text-green-700' :
                  skill.category === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {skill.category}
                </div>
              </div>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getColorClass(skill.category)} rounded-full transition-all duration-500`}
                style={{ width: `${skill.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
