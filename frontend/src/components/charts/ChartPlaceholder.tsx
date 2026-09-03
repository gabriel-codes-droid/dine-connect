import { TrendingUp } from 'lucide-react';

interface ChartPlaceholderProps {
  title: string;
  height?: string;
}

export default function ChartPlaceholder({
  title,
  height = 'h-80',
}: ChartPlaceholderProps) {
  return (
    <div className={`bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 ${height}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="flex items-center justify-center h-[calc(100%-2.5rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-950 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <TrendingUp size={40} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Chart placeholder</p>
        </div>
      </div>
    </div>
  );
}
