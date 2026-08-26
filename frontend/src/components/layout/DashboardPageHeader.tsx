import type { LucideIcon } from 'lucide-react';

interface DashboardPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export default function DashboardPageHeader({ eyebrow, title, subtitle, icon: Icon, action }: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary dark:text-[#D9855F] mb-2">
            {Icon && <Icon size={15} />}
            {eyebrow}
          </div>
        )}
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
