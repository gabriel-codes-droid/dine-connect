import { ShoppingCart, Calendar, Users, DollarSign } from 'lucide-react';
import KPICard from '../components/cards/KPICard';
import ChartPlaceholder from '../components/charts/ChartPlaceholder';

const kpiData = [
  {
    title: "Today's Orders",
    value: '47',
    change: 18,
    icon: <ShoppingCart size={24} className="text-primary" />,
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Reservations',
    value: '23',
    change: 5,
    icon: <Calendar size={24} className="text-success" />,
    bgColor: 'bg-green-50',
  },
  {
    title: 'Active Customers',
    value: '312',
    change: 7,
    icon: <Users size={24} className="text-purple-600" />,
    bgColor: 'bg-purple-50',
  },
  {
    title: "Today's Revenue",
    value: '$3,840',
    change: 12,
    icon: <DollarSign size={24} className="text-warning" />,
    bgColor: 'bg-amber-50',
  },
];

export default function RestaurantOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Restaurant Dashboard</h2>
        <p className="text-gray-500">Manage your restaurant operations and track performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title="Daily Orders" />
        <ChartPlaceholder title="Revenue by Category" />
      </div>
    </div>
  );
}
