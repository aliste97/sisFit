import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User } from '../types';

interface PointsChartProps {
  users: User[];
}

const PointsChart: React.FC<PointsChartProps> = ({ users }) => {
  const data = users.map(u => ({
    name: u.name,
    points: u.lifetimePoints,
    color: u.color
  }));

  return (
    <div className="h-64 w-full bg-white p-4 rounded-3xl shadow-sm border border-pink-100">
      <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">🏆 Lifetime Score</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="points" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color === 'pink' ? '#ec4899' : '#0ea5e9'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PointsChart;
