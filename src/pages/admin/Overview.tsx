import { Building2, Users, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import KPICard from '../../components/cards/KPICard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { platformRevenue, platformOrders, restaurants } from '../../data/mockData';

const topRestaurants = restaurants.slice(0, 5).map((r) => ({
  id: r.id,
  name: r.name,
  orders: r.completedOrders,
  revenue: `$${Math.round(r.completedOrders * 3.5).toLocaleString()}`,
  rating: r.rating,
}));

export default function AdminOverview() {
  return (
    <div className="page-container">
      <div>
        <h2 className="section-title">Platform Overview</h2>
        <p className="section-subtitle">Complete visibility into your restaurant management ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <KPICard title="Total Restaurants" value="1,248" change={12} icon={<Building2 size={22} className="text-primary" />} />
        <KPICard title="Total Customers" value="8,456" change={8} icon={<Users size={22} className="text-secondary" />} accent="from-purple-500/10 to-violet-500/5" />
        <KPICard title="Total Orders" value="15,842" change={15} icon={<ShoppingBag size={22} className="text-success" />} accent="from-green-500/10 to-emerald-500/5" />
        <KPICard title="Reservations" value="3,210" change={10} icon={<Calendar size={22} className="text-warning" />} accent="from-amber-500/10 to-yellow-500/5" />
        <KPICard title="Total Revenue" value="$542K" change={22} icon={<DollarSign size={22} className="text-primary" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Revenue Growth" data={platformRevenue} dataKey="revenue" color="#6366F1" />
        <BarChartCard title="Order Growth" data={platformOrders} dataKey="orders" color="#8B5CF6" />
      </div>

      <DataTable
        keyField="id"
        data={topRestaurants}
        columns={[
          { key: 'name', header: 'Restaurant' },
          { key: 'orders', header: 'Orders', render: (r) => r.orders.toLocaleString() },
          { key: 'revenue', header: 'Revenue' },
          {
            key: 'rating',
            header: 'Rating',
            render: (r) => (
              <Badge variant="primary">{r.rating} ★</Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
