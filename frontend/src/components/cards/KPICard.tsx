import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  bgColor?: string;
  accent?: 'indigo' | 'green' | 'purple' | 'amber' | 'sky' | 'rose' | 'emerald' | 'orange';
}

const accentBg: Record<NonNullable<KPICardProps['accent']>, string> = {
  indigo: 'bg-[#EDEEF2] dark:bg-black',
  green: 'bg-[#ECF1EC] dark:bg-black',
  purple: 'bg-[#EDEAEB] dark:bg-black',
  amber: 'bg-[#F5EDE2] dark:bg-black',
  sky: 'bg-[#E8EDF2] dark:bg-black',
  rose: 'bg-[#F8EAEA] dark:bg-black',
  emerald: 'bg-[#ECF1EC] dark:bg-black',
  orange: 'bg-[#FDF0E6] dark:bg-black',
};

const legacyBgDarkMap: Record<string, string> = {
  'bg-indigo-50': 'bg-black',
  'bg-green-50': 'bg-black',
  'bg-purple-50': 'bg-black',
  'bg-amber-50': 'bg-black',
  'bg-sky-50': 'bg-black',
  'bg-rose-50': 'bg-black',
  'bg-emerald-50': 'bg-black',
  'bg-orange-50': 'bg-black',
  'bg-blue-50': 'bg-black',
  'bg-gray-50': 'bg-black',
};

function resolveWrapperBg(bgColor?: string, accent?: KPICardProps['accent']): string {
  if (!bgColor && !accent) return '';
  if (accent) return accentBg[accent];
  const darkVariant = bgColor ? legacyBgDarkMap[bgColor] : undefined;
  return darkVariant ? `${bgColor} dark:${darkVariant}` : bgColor || '';
}

export default function KPICard({
  title,
  value,
  change,
  icon,
  bgColor,
  accent = 'indigo',
}: KPICardProps) {
  const isPositive = (change ?? 0) >= 0;
  const wrapperBg = resolveWrapperBg(bgColor, accent);

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border p-5 shadow-soft hover:shadow-card transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`${wrapperBg} rounded-md p-2.5`}>{icon}</div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
              isPositive
                ? 'bg-green-50 dark:bg-black text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-black text-red-700 dark:text-red-400'
            }`}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
