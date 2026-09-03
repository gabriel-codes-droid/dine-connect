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
  indigo: 'bg-[#FFF7ED] dark:bg-[#2A1F14]',
  green: 'bg-[#F0F7F0] dark:bg-[#1A2A1A]',
  purple: 'bg-[#F5F0F5] dark:bg-[#251A25]',
  amber: 'bg-[#FFF8F0] dark:bg-[#2A1F10]',
  sky: 'bg-[#F0F5F7] dark:bg-[#14252A]',
  rose: 'bg-[#FBF0F2] dark:bg-[#2A1820]',
  emerald: 'bg-[#F0F7F0] dark:bg-[#1A2A1A]',
  orange: 'bg-[#FFF5EC] dark:bg-[#2A1810]',
};

const legacyBgDarkMap: Record<string, string> = {
  'bg-indigo-50': 'bg-[#2A1F14]',
  'bg-green-50': 'bg-[#1A2A1A]',
  'bg-purple-50': 'bg-[#251A25]',
  'bg-amber-50': 'bg-[#2A1F10]',
  'bg-sky-50': 'bg-[#14252A]',
  'bg-rose-50': 'bg-[#2A1820]',
  'bg-emerald-50': 'bg-[#1A2A1A]',
  'bg-orange-50': 'bg-[#2A1810]',
  'bg-blue-50': 'bg-[#14252A]',
  'bg-gray-50': 'bg-[#353A35]',
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
                ? 'bg-[#E8EFE4] dark:bg-[#29352C] text-success'
                : 'bg-[#F3E5E1] dark:bg-[#402C2A] text-danger'
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
