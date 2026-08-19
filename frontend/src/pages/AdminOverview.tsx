import {
  Building2,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  ChefHat,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import KPICard from '../components/cards/KPICard';
import { auth } from '../services/auth';
import { restaurantService, orderService } from '../firebase';
import type { Order } from '../firebase';
import type { Restaurant } from '../data/restaurants';

interface KPIDatum {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: 'indigo' | 'green' | 'purple' | 'amber' | 'sky' | 'rose' | 'emerald' | 'orange';
}

interface TopRestaurantRow {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  rating: number;
}

interface ActivityItem {
  id: string;
  description: string;
  time: Date;
  icon: React.ReactNode;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function AdminOverview() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session = auth.getSession();

  useEffect(() => {
    if (!session || session.role !== 'super-admin') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [allRestaurants, allOrders] = await Promise.all([
          restaurantService.getAllRestaurants(),
          orderService.getAllOrders(),
        ]);
        if (!cancelled) {
          setRestaurants(allRestaurants);
          setOrders(allOrders);
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
        if (!cancelled) setError('Failed to load platform data. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  if (!session || session.role !== 'super-admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Super admin access required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // --- Real aggregates, computed from actual Firestore data ---
  const nonCancelledOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const activeCustomers = new Set(orders.map(o => o.customerId)).size;
  const ratedRestaurants = restaurants.filter(r => r.rating > 0);
  const avgRating = ratedRestaurants.length > 0
    ? ratedRestaurants.reduce((sum, r) => sum + r.rating, 0) / ratedRestaurants.length
    : 0;
  const activeCuisines = new Set(restaurants.map(r => r.cuisine)).size;

  const kpiData: KPIDatum[] = [
    {
      title: 'Total Restaurants',
      value: restaurants.length.toLocaleString(),
      icon: <Building2 size={24} className="text-primary" />,
      accent: 'indigo',
    },
    {
      title: 'Total Orders',
      value: orders.length.toLocaleString(),
      icon: <ShoppingCart size={24} className="text-success" />,
      accent: 'green',
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toLocaleString(),
      icon: <Users size={24} className="text-purple-600 dark:text-purple-400" />,
      accent: 'purple',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: <TrendingUp size={24} className="text-warning" />,
      accent: 'amber',
    },
    {
      title: 'Avg. Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />,
      accent: 'emerald',
    },
    {
      title: 'Avg. Rating',
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      icon: <Star size={24} className="text-amber-500" />,
      accent: 'amber',
    },
    {
      title: 'Active Cuisines',
      value: activeCuisines.toLocaleString(),
      icon: <ChefHat size={24} className="text-rose-600 dark:text-rose-400" />,
      accent: 'rose',
    },
  ];

  // Top restaurants by revenue, computed from real orders
  const byRestaurant = new Map<string, { orders: number; revenue: number }>();
  for (const o of nonCancelledOrders) {
    const entry = byRestaurant.get(o.restaurantId) || { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += o.total;
    byRestaurant.set(o.restaurantId, entry);
  }
  const topRestaurants: TopRestaurantRow[] = Array.from(byRestaurant.entries())
    .map(([id, stats]) => {
      const r = restaurants.find(res => res.id === id);
      return {
        id,
        name: r?.name ?? 'Unknown restaurant',
        orders: stats.orders,
        revenue: stats.revenue,
        rating: r?.rating ?? 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Recent activity, merged from real orders + real restaurant signups
  const activity: ActivityItem[] = [
    ...orders
      .filter(o => o.createdAt?.toDate)
      .map((o): ActivityItem => ({
        id: `order-${o.id}`,
        description: `New order placed at ${o.restaurantName}`,
        time: o.createdAt.toDate(),
        icon: <ShoppingCart size={16} className="text-primary" />,
      })),
    ...restaurants
      .filter((r): r is Restaurant & { createdAt: { toDate: () => Date } } =>
        !!r.createdAt && typeof (r.createdAt as { toDate?: () => Date }).toDate === 'function'
      )
      .map((r): ActivityItem => ({
        id: `restaurant-${r.id}`,
        description: `${r.name} registered`,
        time: r.createdAt.toDate(),
        icon: <Building2 size={16} className="text-success" />,
      })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 6);

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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top restaurants</h3>
          </div>
          {topRestaurants.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Building2 className="mx-auto text-gray-300 mb-4" size={40} />
              <p className="text-gray-500 dark:text-gray-400">No orders yet — this fills in once restaurants start receiving orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Restaurant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {topRestaurants.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{r.orders}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${r.revenue.toFixed(0)}</td>
                      <td className="px-6 py-4">
                        {r.rating > 0 ? (
                          <>
                            <span className="font-semibold text-gray-900 dark:text-white">{r.rating.toFixed(1)}</span>
                            <span className="text-warning ml-1">★</span>
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nothing yet — activity will show up here as orders come in.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0"
                >
                  <div className="flex-shrink-0 bg-gray-50 dark:bg-slate-800 rounded-lg p-2">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(item.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
