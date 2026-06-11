import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Star, ShoppingBag } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';

const rankStyles = {
  1: 'from-amber-400 to-yellow-500 shadow-amber-200/50',
  2: 'from-gray-300 to-gray-400 shadow-gray-200/50',
  3: 'from-amber-600 to-amber-700 shadow-amber-300/50',
};

const rankLabels = { 1: '1st Place', 2: '2nd Place', 3: '3rd Place' };

export default function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  const style = rankStyles[entry.rank as 1 | 2 | 3];

  return (
    <div className={`card-base overflow-hidden relative ${entry.rank === 1 ? 'ring-2 ring-primary/30 scale-[1.02]' : ''}`}>
      <div className={`h-2 bg-gradient-to-r ${style}`} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style} flex items-center justify-center shadow-lg`}>
            <Trophy size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {rankLabels[entry.rank as 1 | 2 | 3]}
            </p>
            <h3 className="text-xl font-bold text-text-main dark:text-dark-text">{entry.restaurant.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <img src={entry.restaurant.logo} alt="" className="w-14 h-14 rounded-xl object-cover border border-border dark:border-dark-border" />
          <div className="flex-1">
            <p className="text-sm text-text-muted dark:text-dark-muted">{entry.restaurant.cuisine}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={14} className="text-warning fill-warning" />
              <span className="text-sm font-semibold">{entry.rating}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-dark-bg">
            <ShoppingBag size={16} className="mx-auto text-primary mb-1" />
            <p className="text-xs text-text-muted dark:text-dark-muted">Orders</p>
            <p className="font-bold text-sm">{entry.orders.toLocaleString()}</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-dark-bg">
            <TrendingUp size={16} className="mx-auto text-success mb-1" />
            <p className="text-xs text-text-muted dark:text-dark-muted">Growth</p>
            <p className="font-bold text-sm text-success">+{entry.revenueGrowth}%</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-dark-bg">
            <Star size={16} className="mx-auto text-warning mb-1" />
            <p className="text-xs text-text-muted dark:text-dark-muted">Score</p>
            <p className="font-bold text-sm">{entry.score}</p>
          </div>
        </div>

        <Link
          to={`/customer/restaurants/${entry.restaurant.slug}`}
          className="block w-full text-center btn-primary text-sm py-2.5"
        >
          View Restaurant
        </Link>
      </div>
    </div>
  );
}
