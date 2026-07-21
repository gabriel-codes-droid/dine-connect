import { ShoppingBag, Heart, Clock, Star } from 'lucide-react';
import KPICard from '../components/cards/KPICard';

const kpiData = [
  {
    title: 'Total Orders',
    value: '24',
    icon: <ShoppingBag size={24} className="text-primary" />,
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Favorite Restaurants',
    value: '6',
    icon: <Heart size={24} className="text-danger" />,
    bgColor: 'bg-red-50',
  },
  {
    title: 'Upcoming Reservations',
    value: '2',
    icon: <Clock size={24} className="text-warning" />,
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Loyalty Points',
    value: '1,250',
    change: 8,
    icon: <Star size={24} className="text-success" />,
    bgColor: 'bg-green-50',
  },
];

const recentOrders = [
  { id: 1, restaurant: 'The Golden Fork', items: 'Grilled Salmon, Caesar Salad', total: '$42.50', status: 'Delivered' },
  { id: 2, restaurant: 'Urban Bistro', items: 'Pasta Carbonara, Tiramisu', total: '$38.00', status: 'In Progress' },
  { id: 3, restaurant: 'Pizza Paradise', items: 'Margherita Pizza x2', total: '$28.00', status: 'Delivered' },
];

export default function CustomerOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Dashboard</h2>
        <p className="text-gray-500">Track your orders, reservations, and rewards.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentOrders.map((order) => (
            <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{order.restaurant}</p>
                <p className="text-sm text-gray-500">{order.items}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900">{order.total}</span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-green-50 text-success'
                      : 'bg-amber-50 text-warning'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
