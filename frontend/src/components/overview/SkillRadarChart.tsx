"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SkillScore } from '@/types/learning';
import { BarChart3 } from 'lucide-react';

interface SkillRadarChartProps {
  skills: SkillScore[];
}

export default function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const data = skills.map(skill => ({
    skill: skill.skill.charAt(0).toUpperCase() + skill.skill.slice(1),
    score: skill.score,
    fullMark: 100
  }));

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Skill Analysis Overview
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#4b5563', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
          <Radar
            name="Your Skills"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.5}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
