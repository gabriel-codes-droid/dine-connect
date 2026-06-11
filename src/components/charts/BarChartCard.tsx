import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '../../types';

interface BarChartCardProps {
  title: string;
  data: ChartDataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
}

export default function BarChartCard({
  title,
  data,
  dataKey = 'value',
  color = '#6366F1',
  height = 280,
}: BarChartCardProps) {
  return (
    <div className="card-base p-6">
      <h3 className="text-lg font-semibold text-text-main dark:text-dark-text mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
