
import React from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import ChartWrapper from '@/components/ui/chart-wrapper';

interface UserChartProps {
  data: { name: string; count: number }[];
}

export const UserDistributionChart: React.FC<UserChartProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  return (
    <ChartWrapper height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ChartWrapper>
  );
};

interface CallChartProps {
  data: { name: string; voice: number; video: number }[];
}

export const CallDistributionChart: React.FC<CallChartProps> = ({ data }) => {
  return (
    <ChartWrapper height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <BarChart>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="voice" fill="#8884d8" name="Voice Calls" />
        <Bar dataKey="video" fill="#82ca9d" name="Video Calls" />
      </BarChart>
    </ChartWrapper>
  );
};
