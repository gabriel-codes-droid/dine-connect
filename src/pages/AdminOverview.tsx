import {
  Building2,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  ChefHat,
} from 'lucide-react';
import KPICard from '../components/cards/KPICard';
import { RevenueChart, OrdersBarChart, DonutChart, defaultRevenue, defaultOrders, defaultOrderMix } from '../components/charts/Charts';

const kpiData = [
  {
    title: 'Total Restaurants',
    value: '1,248',
    change: 12,
    icon: <Building2 size={24} className="text-primary" />,
    accent: 'indigo' as const,
  },
  {
    title: 'Total Orders',
    value: '15,842',
    change: 8,
    icon: <ShoppingCart size={24} className="text-success" />,
    accent: 'green' as const,
  },
  {
    title: 'Total Customers',
    value: '8,456',
    change: -3,
    icon: <Users size={24} className="text-purple-600 dark:text-purple-400" />,
    accent: 'purple' as const,
  },
  {
    title: 'Total Revenue',
    value: '$542,890',
    change: 15,
    icon: <TrendingUp size={24} className="text-warning" />,
    accent: 'amber' as const,
  },
  {
    title: 'Avg. Order Value',
    value: '$34.27',
    change: 6,
    icon: <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />,
    accent: 'emerald' as const,
  },
  {
    title: 'Avg. Rating',
    value: '4.7',
    change: 2,
    icon: <Star size={24} className="text-amber-500" />,
    accent: 'amber' as const,
  },
  {
    title: 'Reservations (7d)',
    value: '1,021',
    change: 11,
    icon: <Calendar size={24} className="text-sky-600 dark:text-sky-400" />,
    accent: 'sky' as const,
  },
  {
    title: 'Active Cuisines',
    value: '38',
    change: 4,
    icon: <ChefHat size={24} className="text-rose-600 dark:text-rose-400" />,
    accent: 'rose' as const,
  },
];

const topRestaurants = [
  { id: 1, name: 'The Golden Fork', orders: 542, revenue: '$18,450', rating: 4.8 },
  { id: 2, name: 'Urban Bistro', orders: 485, revenue: '$16,920', rating: 4.6 },
  { id: 3, name: 'Taste of Asia', orders: 421, revenue: '$14,735', rating: 4.7 },
  { id: 4, name: 'Pizza Paradise', orders: 398, revenue: '$13,930', rating: 4.5 },
  { id: 5, name: 'Seafood Delights', orders: 356, revenue: '$12,460', rating: 4.9 },
];

const recentActivity = [
  { id: 1, description: 'New order placed at The Golden Fork', time: '2 minutes ago', icon: <ShoppingCart size={16} className="text-primary" /> },
  { id: 2, description: 'Urban Bistro registered', time: '1 hour ago', icon: <Building2 size={16} className="text-success" /> },
  { id: 3, description: 'New customer registration', time: '3 hours ago', icon: <Users size={16} className="text-purple-600 dark:text-purple-400" /> },
  { id: 4, description: 'Reservation confirmed at Taste of Asia', time: '5 hours ago', icon: <Calendar size={16} className="text-warning" /> },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back!</h2>
        <p className="text-gray-500 dark:text-gray-400">Here&apos;s an overview of your platform performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue &amp; commission</h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Last 7 days</span>
          </div>
          <RevenueChart data={defaultRevenue} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order mix</h3>
          </div>
          <DonutChart data={defaultOrderMix} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Orders this week</h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Daily volume</span>
          </div>
          <OrdersBarChart data={defaultOrders} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0 bg-gray-50 dark:bg-slate-800 rounded-lg p-2">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{activity.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top restaurants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {topRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{restaurant.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{restaurant.orders}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{restaurant.revenue}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white">{restaurant.rating}</span>
                    <span className="text-warning ml-1">★</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
