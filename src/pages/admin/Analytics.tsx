import { Building2, Users, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import KPICard from '../../components/cards/KPICard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import {
  platformRevenue, platformOrders, monthlyReservations, monthlyOrders,
  cuisinePopularity, restaurants,
} from '../../data/mockData';

const customerGrowth = monthlyOrders.map((m) => ({ ...m, customers: Math.round(m.value * 35) }));

export default function AdminAnalytics() {
  const topRated = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const topPerforming = [...restaurants].sort((a, b) => b.completedOrders - a.completedOrders).slice(0, 5);

  return (
    <div className="page-container">
      <div>
        <h2 className="section-title">Platform Analytics</h2>
        <p className="section-subtitle">Deep insights into platform performance and trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <KPICard title="Total Restaurants" value="1,248" change={12} icon={<Building2 size={22} className="text-primary" />} />
        <KPICard title="Total Customers" value="8,456" change={8} icon={<Users size={22} className="text-secondary" />} accent="from-purple-500/10 to-violet-500/5" />
        <KPICard title="Total Orders" value="15,842" change={15} icon={<ShoppingBag size={22} className="text-success" />} accent="from-green-500/10 to-emerald-500/5" />
        <KPICard title="Total Reservations" value="3,210" change={10} icon={<Calendar size={22} className="text-warning" />} accent="from-amber-500/10 to-yellow-500/5" />
        <KPICard title="Total Revenue" value="$542K" change={22} icon={<DollarSign size={22} className="text-primary" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Revenue Growth" data={platformRevenue} dataKey="revenue" color="#6366F1" />
        <BarChartCard title="Order Growth" data={platformOrders} dataKey="orders" color="#22C55E" />
        <AreaChartCard title="Reservation Growth" data={monthlyReservations} dataKey="reservations" color="#F59E0B" />
        <AreaChartCard title="Customer Growth" data={customerGrowth} dataKey="customers" color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChartCard title="Popular Cuisine Types" data={cuisinePopularity} />
        <div className="lg:col-span-2">
          <DataTable
            keyField="id"
            data={topRated.map((r) => ({ id: r.id, name: r.name, rating: r.rating, cuisine: r.cuisine, reviews: r.reviewCount }))}
            columns={[
              { key: 'name', header: 'Top Rated' },
              { key: 'cuisine', header: 'Cuisine' },
              { key: 'rating', header: 'Rating', render: (r) => <Badge variant="primary">{r.rating} ★</Badge> },
              { key: 'reviews', header: 'Reviews' },
            ]}
          />
        </div>
      </div>

      <DataTable
        keyField="id"
        data={topPerforming.map((r) => ({ id: r.id, name: r.name, orders: r.completedOrders, growth: r.revenueGrowth ?? 0, revenue: `$${Math.round(r.completedOrders * 3.5).toLocaleString()}` }))}
        columns={[
          { key: 'name', header: 'Top Performing' },
          { key: 'orders', header: 'Orders', render: (r) => r.orders.toLocaleString() },
          { key: 'revenue', header: 'Revenue' },
          { key: 'growth', header: 'Growth', render: (r) => <Badge variant="success">+{r.growth}%</Badge> },
        ]}
      />
    </div>
  );
}
