import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  accent?: string;
}

export default function KPICard({ title, value, change, icon, accent = 'from-primary/10 to-secondary/5' }: KPICardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="card-base p-6 hover:shadow-card transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-50 group-hover:opacity-70 transition-opacity`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-dark-surface/80 shadow-soft backdrop-blur-sm">
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isPositive ? 'bg-green-50 text-success dark:bg-green-900/30' : 'bg-red-50 text-danger dark:bg-red-900/30'
            }`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-text-muted dark:text-dark-muted text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-text-main dark:text-dark-text tracking-tight">{value}</p>
      </div>
    </div>
  );
}
