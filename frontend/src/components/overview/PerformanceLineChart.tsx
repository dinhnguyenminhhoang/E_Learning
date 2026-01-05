"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PerformanceLineChartProps {
  data: {
    labels: string[];
    data: number[];
  };
}

export default function PerformanceLineChart({ data }: PerformanceLineChartProps) {
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Accuracy Trend
        </h2>
        <p className="text-gray-600">Complete more quizzes to see your accuracy trend!</p>
      </div>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    day: label,
    accuracy: data.data[index]
  }));

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Accuracy Trend (7 Days)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="Accuracy %"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
