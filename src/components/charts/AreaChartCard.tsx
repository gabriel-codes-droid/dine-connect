import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '../../types';

interface AreaChartCardProps {
  title: string;
  data: ChartDataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
}

export default function AreaChartCard({
  title,
  data,
  dataKey = 'value',
  color = '#6366F1',
  height = 280,
}: AreaChartCardProps) {
  return (
    <div className="card-base p-6">
      <h3 className="text-lg font-semibold text-text-main dark:text-dark-text mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${title})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
