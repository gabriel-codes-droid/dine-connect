import { ShoppingBag, Calendar, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '../../components/cards/KPICard';
import RestaurantCard from '../../components/cards/RestaurantCard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import Badge from '../../components/ui/Badge';
import { recentOrders, upcomingReservations, monthlyOrders, monthlyReservations, restaurants } from '../../data/mockData';

export default function CustomerOverview() {
  const favorites = restaurants.slice(0, 3);
  const recommended = restaurants.slice(2, 5);

  return (
    <div className="page-container">
      <div>
        <h2 className="section-title">Welcome back!</h2>
        <p className="section-subtitle">Here&apos;s your dining activity at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Orders Placed" value="24" change={12} icon={<ShoppingBag size={22} className="text-primary" />} />
        <KPICard title="Reservations Made" value="8" change={5} icon={<Calendar size={22} className="text-success" />} accent="from-green-500/10 to-emerald-500/5" />
        <KPICard title="Favorite Restaurants" value="6" icon={<Heart size={22} className="text-danger" />} accent="from-red-500/10 to-pink-500/5" />
        <KPICard title="Reward Points" value="1,250" change={8} icon={<Star size={22} className="text-warning" />} accent="from-amber-500/10 to-yellow-500/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="Monthly Orders" data={monthlyOrders} dataKey="orders" color="#6366F1" />
        <AreaChartCard title="Monthly Reservations" data={monthlyReservations} dataKey="reservations" color="#22C55E" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-main dark:text-dark-text">Recent Orders</h3>
            <Link to="/customer/orders" className="text-sm text-primary font-medium hover:text-secondary">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                <div>
                  <p className="font-medium text-text-main dark:text-dark-text">{order.restaurantName}</p>
                  <p className="text-sm text-text-muted dark:text-dark-muted">{order.items}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.total}</p>
                  <Badge variant={order.status === 'Delivered' ? 'success' : 'warning'}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-main dark:text-dark-text">Upcoming Reservations</h3>
            <Link to="/customer/reservations" className="text-sm text-primary font-medium hover:text-secondary">View all</Link>
          </div>
          <div className="space-y-3">
            {upcomingReservations.map((res) => (
              <div key={res.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                <div>
                  <p className="font-medium text-text-main dark:text-dark-text">{res.restaurantName}</p>
                  <p className="text-sm text-text-muted dark:text-dark-muted">{res.date} at {res.time} · {res.guests} guests</p>
                </div>
                <Badge variant={res.status === 'Confirmed' ? 'success' : 'warning'}>{res.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-main dark:text-dark-text">Favorite Restaurants</h3>
          <Link to="/customer/favorites" className="text-sm text-primary font-medium hover:text-secondary">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-main dark:text-dark-text">Recommended for You</h3>
          <Link to="/customer/discover" className="text-sm text-primary font-medium hover:text-secondary">Discover more</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {recommended.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      </div>
    </div>
  );
}
