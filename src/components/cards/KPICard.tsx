import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  bgColor?: string;
  accent?: 'indigo' | 'green' | 'purple' | 'amber' | 'sky' | 'rose' | 'emerald' | 'orange';
}

const accentBg: Record<NonNullable<KPICardProps['accent']>, string> = {
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
  green: 'bg-green-50 dark:bg-green-900/20',
  purple: 'bg-purple-50 dark:bg-purple-900/20',
  amber: 'bg-amber-50 dark:bg-amber-900/20',
  sky: 'bg-sky-50 dark:bg-sky-900/20',
  rose: 'bg-rose-50 dark:bg-rose-900/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  orange: 'bg-orange-50 dark:bg-orange-900/20',
};

export default function KPICard({
  title,
  value,
  change,
  icon,
  bgColor,
  accent = 'indigo',
}: KPICardProps) {
  const isPositive = (change ?? 0) >= 0;
  const wrapperBg = bgColor || accentBg[accent];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`${wrapperBg} rounded-lg p-3`}>{icon}</div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              isPositive
                ? 'bg-green-50 dark:bg-green-900/30 text-success'
                : 'bg-red-50 dark:bg-red-900/30 text-danger'
            }`}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
