import { ShoppingCart, Calendar, Users, DollarSign } from 'lucide-react';
import KPICard from '../../components/cards/KPICard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import { monthlyOrders, platformRevenue } from '../../data/mockData';

export default function RestaurantOverview() {
  return (
    <div className="page-container">
      <div>
        <h2 className="section-title">Restaurant Dashboard</h2>
        <p className="section-subtitle">Manage your restaurant operations and track performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Today's Orders" value="47" change={18} icon={<ShoppingCart size={22} className="text-primary" />} />
        <KPICard title="Reservations" value="23" change={5} icon={<Calendar size={22} className="text-success" />} accent="from-green-500/10 to-emerald-500/5" />
        <KPICard title="Active Customers" value="312" change={7} icon={<Users size={22} className="text-secondary" />} accent="from-purple-500/10 to-violet-500/5" />
        <KPICard title="Today's Revenue" value="$3,840" change={12} icon={<DollarSign size={22} className="text-warning" />} accent="from-amber-500/10 to-yellow-500/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard title="Daily Orders" data={monthlyOrders} dataKey="orders" color="#6366F1" />
        <AreaChartCard title="Revenue Trend" data={platformRevenue.slice(0, 6)} dataKey="revenue" color="#22C55E" />
      </div>
    </div>
  );
}
