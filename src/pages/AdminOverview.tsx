import {
  Building2,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import KPICard from '../components/cards/KPICard';
import ChartPlaceholder from '../components/charts/ChartPlaceholder';

const kpiData = [
  {
    title: 'Total Restaurants',
    value: '1,248',
    change: 12,
    icon: <Building2 size={24} className="text-primary" />,
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Total Orders',
    value: '15,842',
    change: 8,
    icon: <ShoppingCart size={24} className="text-success" />,
    bgColor: 'bg-green-50',
  },
  {
    title: 'Total Customers',
    value: '8,456',
    change: -3,
    icon: <Users size={24} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Total Revenue',
    value: '$542,890',
    change: 15,
    icon: <TrendingUp size={24} className="text-warning" />,
    bgColor: 'bg-amber-50',
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
  {
    id: 1,
    description: 'New order placed at The Golden Fork',
    time: '2 minutes ago',
    icon: <ShoppingCart size={16} className="text-primary" />,
  },
  {
    id: 2,
    description: 'Urban Bistro registered',
    time: '1 hour ago',
    icon: <Building2 size={16} className="text-success" />,
  },
  {
    id: 3,
    description: 'New customer registration',
    time: '3 hours ago',
    icon: <Users size={16} className="text-purple-600" />,
  },
  {
    id: 4,
    description: 'Reservation confirmed at Taste of Asia',
    time: '5 hours ago',
    icon: <Calendar size={16} className="text-warning" />,
  },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back!</h2>
        <p className="text-gray-500">Here&apos;s an overview of your platform performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartPlaceholder title="Revenue Trend" />
        </div>
        <ChartPlaceholder title="Order Distribution" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Restaurants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{restaurant.name}</td>
                  <td className="px-6 py-4 text-gray-500">{restaurant.orders}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{restaurant.revenue}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{restaurant.rating}</span>
                    <span className="text-warning ml-1">★</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex-shrink-0 bg-gray-50 rounded-lg p-2">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
