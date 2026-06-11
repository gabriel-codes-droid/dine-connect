import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ChartDataPoint } from '../../types';

const COLORS = ['#6366F1', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4'];

interface DonutChartCardProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
}

export default function DonutChartCard({ title, data, height = 280 }: DonutChartCardProps) {
  return (
    <div className="card-base p-6">
      <h3 className="text-lg font-semibold text-text-main dark:text-dark-text mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
