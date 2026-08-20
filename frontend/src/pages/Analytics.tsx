import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Star,
  ChefHat,
  Building2,
  Loader2,
  Users,
  DollarSign,
  ShoppingCart,
  Flame,
  Award,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import KPICard from '../components/cards/KPICard';
import { auth } from '../services/auth';
import { restaurantService, orderService } from '../firebase';
import type { Order } from '../firebase';
import type { Restaurant } from '../data/restaurants';

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Map a Timestamp to a JS Date safely (handles null / missing toDate). */
function toDate(ts?: { toDate?: () => Date } | null): Date | null {
  if (!ts || typeof ts.toDate !== 'function') return null;
  return ts.toDate();
}

/** Last 30 day labels + counts, keyed by day index 0..29. */
interface DayCount {
  label: string;   // e.g. "Aug 14"
  count: number;
}

function build30DayBuckets(orders: Order[]): DayCount[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // initialise 30 buckets (today = newest, 29 days ago = oldest)
  const buckets: DayCount[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }

  for (const o of orders) {
    const d = toDate(o.createdAt);
    if (!d) continue;
    const zero = new Date(d);
    zero.setHours(0, 0, 0, 0);
    const diff = Math.round((now.getTime() - zero.getTime()) / 86400000);
    if (diff >= 0 && diff <= 29) {
      buckets[29 - diff].count += 1;
    }
  }

  return buckets;
}

/** Inline horizontal bar chart drawn entirely with SVG. */
function OrderTimelineChart({ data }: { data: DayCount[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const barWidth = Math.max(8, Math.min(24, 280 / data.length));

  return (
    <div className="overflow-x-auto w-full">
      <svg
        width={Math.max(280, data.length * (barWidth + 4) + 40)}
        height={120}
        className="text-gray-400"
        aria-label="Order timeline chart"
      >
        {/* baseline */}
        <line
          x1="30"
          y1="110"
          x2={`${data.length * (barWidth + 4) + 30}`}
          y2="110"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        {data.map((d, i) => {
          const h = max > 0 ? (d.count / max) * 100 : 0;
          const x = 30 + i * (barWidth + 4);
          const y = 110 - h;
          const isMax = d.count === max;
          return (
            <g key={i}>
              {/* bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(h, 0)}
                fill={isMax ? 'var(--color-indigo)' : 'var(--color-indigo-300)'}
                rx="2"
                className="transition-all duration-300 hover:opacity-80"
              />
              {/* value label (top) */}
              {d.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={Math.max(y - 4, 10)}
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-gray-400"
                  fontSize="10"
                  fontWeight={isMax ? '700' : '400'}
                >
                  {d.count}
                </text>
              )}
              {/* x-axis label */}
              <text
                x={x + barWidth / 2}
                y="120"
                textAnchor="middle"
                className="fill-gray-400 dark:fill-gray-500"
                fontSize="9"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ----------------------------------------------------------------------
// Customer analytics
// ----------------------------------------------------------------------

function CustomerAnalytics({ uid }: { uid: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const all = await orderService.getCustomerOrders(uid);
        if (!cancelled) setOrders(all);
      } catch (err) {
        console.error('Customer analytics error:', err);
        if (!cancelled) setError('Unable to load your order history.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const safetyTimeout = setTimeout(() => { if (!cancelled) setLoading(false); }, 8000);
    return () => { clearTimeout(safetyTimeout); cancelled = true; };
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  const nonCancelled = orders.filter(o => o.status !== 'cancelled');
  const totalOrders = nonCancelled.length;
  const totalSpent = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // favourite cuisine — most ordered restaurant cuisine
  const cuisineCounts: Record<string, number> = {};
  for (const o of nonCancelled) {
    // restaurantName is usually present on the order doc; fall back to looking it up
    cuisineCounts[o.restaurantName] = (cuisineCounts[o.restaurantName] ?? 0) + 1;
  }
  const favourite = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0];

  const timeline = build30DayBuckets(orders);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Your orders</h2>
        <p className="text-gray-500 dark:text-gray-400">Here&apos;s a quick look at your dining history.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingBag size={24} className="text-primary" />}
          accent="indigo"
        />
        <KPICard
          title="Total Spent"
          value={`$${totalSpent.toFixed(0)}`}
          icon={<TrendingUp size={24} className="text-success" />}
          accent="green"
        />
        <KPICard
          title="Avg. Order Value"
          value={`$${avgOrder.toFixed(2)}`}
          icon={<DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />}
          accent="emerald"
        />
        <KPICard
          title="Favourite Cuisine"
          value={favourite ? favourite[0] : '—'}
          icon={<ChefHat size={24} className="text-amber-500" />}
          accent="amber"
        />
      </div>

      {/* Timeline chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order timeline</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Orders placed in the last 30 days
        </p>
        {timeline.every(d => d.count === 0) ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-400 dark:text-gray-500">No orders in the last 30 days.</p>
          </div>
        ) : (
          <OrderTimelineChart data={timeline} />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Restaurant-admin analytics
// ----------------------------------------------------------------------

interface RestaurantOwnerAnalyticsProps {
  ownerId: string;
}

function RestaurantOwnerAnalytics({ ownerId }: RestaurantOwnerAnalyticsProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We pick the first restaurant owned by this user if there are multiple,
  // but surface all owned restaurants in a small selector.
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const owned = await restaurantService.getRestaurantsByOwner(ownerId);
        if (!cancelled) setRestaurants(owned);
        // default to first owned restaurant
        if (!cancelled && owned.length > 0 && !activeRestaurantId) {
          setActiveRestaurantId(owned[0].id);
        }
      } catch (err) {
        console.error('Restaurant-owner analytics error:', err);
        if (!cancelled) setError('Unable to load your restaurant data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const safetyTimeout = setTimeout(() => { if (!cancelled) setLoading(false); }, 8000);
    return () => { clearTimeout(safetyTimeout); cancelled = true; };
  }, [ownerId, activeRestaurantId]);

  // Fetch orders for the active restaurant
  useEffect(() => {
    if (!activeRestaurantId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await orderService.getRestaurantOrders(activeRestaurantId);
        if (!cancelled) setOrders(res);
      } catch (err) {
        console.error('Restaurant orders fetch error:', err);
        if (!cancelled) setError('Unable to load orders for this restaurant.');
      }
    })();
  }, [activeRestaurantId]);

  if (loading && restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  if (error && restaurants.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  // If no restaurant is selected yet (edge case: loading finished but activeRestaurantId still null)
  if (!activeRestaurantId) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 text-center">
        <Building2 className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={40} />
        <p className="text-gray-500 dark:text-gray-400">No restaurant found for this account.</p>
      </div>
    );
  }

  const activeRestaurant = restaurants.find(r => r.id === activeRestaurantId);
  const nonCancelled = orders.filter(o => o.status !== 'cancelled');
  const totalOrders = nonCancelled.length;
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top menu items by quantity
  type MenuItemStat = { name: string; quantity: number };
  const itemCounts: Record<string, MenuItemStat> = {};
  for (const o of nonCancelled) {
    for (const item of o.items) {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, quantity: 0 };
      }
      itemCounts[item.name].quantity += item.quantity;
    }
  }
  const topItems: MenuItemStat[] = Object.values(itemCounts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const timeline = build30DayBuckets(orders);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {activeRestaurant?.name ?? 'Restaurant Analytics'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Insights for your restaurant(s).</p>
      </div>

      {/* Restaurant selector */}
      {restaurants.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {restaurants.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRestaurantId(r.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeRestaurantId === r.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingCart size={24} className="text-primary" />}
          accent="indigo"
        />
        <KPICard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(0)}`}
          icon={<TrendingUp size={24} className="text-success" />}
          accent="green"
        />
        <KPICard
          title="Avg. Order Value"
          value={`$${avgOrder.toFixed(2)}`}
          icon={<DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />}
          accent="emerald"
        />
        <KPICard
          title="Top Item"
          value={topItems[0]?.name ?? '—'}
          icon={<Award size={24} className="text-amber-500" />}
          accent="amber"
        />
      </div>

      {/* Top items table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top menu items</h3>
        </div>
        {topItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Flame className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={40} />
            <p className="text-gray-500 dark:text-gray-400">No items sold yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {topItems.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timeline chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order timeline</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Orders in the last 30 days
        </p>
        {timeline.every(d => d.count === 0) ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-400 dark:text-gray-500">No orders yet.</p>
          </div>
        ) : (
          <OrderTimelineChart data={timeline} />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Super-admin analytics  (reuses real aggregation logic from AdminOverview)
// ----------------------------------------------------------------------

function SuperAdminAnalytics() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.getSession()?.role !== 'super-admin') {
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
        console.error('Super-admin analytics error:', err);
        if (!cancelled) setError('Failed to load platform data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const safetyTimeout = setTimeout(() => { if (!cancelled) setLoading(false); }, 8000);
    return () => { clearTimeout(safetyTimeout); cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  // --- real aggregates, identical to AdminOverview logic ---
  const nonCancelled = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const activeCustomers = new Set(orders.map(o => o.customerId)).size;
  const ratedRestaurants = restaurants.filter(r => r.rating > 0);
  const avgRating = ratedRestaurants.length > 0
    ? ratedRestaurants.reduce((sum, r) => sum + r.rating, 0) / ratedRestaurants.length
    : 0;
  const activeCuisines = new Set(restaurants.map(r => r.cuisine)).size;

  const kpiData = [
    {
      title: 'Total Restaurants',
      value: restaurants.length.toLocaleString(),
      icon: <Building2 size={24} className="text-primary" />,
      accent: 'indigo' as const,
    },
    {
      title: 'Total Orders',
      value: orders.length.toLocaleString(),
      icon: <ShoppingCart size={24} className="text-success" />,
      accent: 'green' as const,
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toLocaleString(),
      icon: <Users size={24} className="text-purple-600 dark:text-purple-400" />,
      accent: 'purple' as const,
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: <TrendingUp size={24} className="text-warning" />,
      accent: 'amber' as const,
    },
    {
      title: 'Avg. Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />,
      accent: 'emerald' as const,
    },
    {
      title: 'Avg. Rating',
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      icon: <Star size={24} className="text-amber-500" />,
      accent: 'amber' as const,
    },
    {
      title: 'Active Cuisines',
      value: activeCuisines.toLocaleString(),
      icon: <ChefHat size={24} className="text-rose-600 dark:text-rose-400" />,
      accent: 'rose' as const,
    },
  ];

  // Top restaurants by revenue (identical to AdminOverview)
  const byRestaurant = new Map<string, { orders: number; revenue: number }>();
  for (const o of nonCancelled) {
    const entry = byRestaurant.get(o.restaurantId) || { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += o.total;
    byRestaurant.set(o.restaurantId, entry);
  }
  const topRestaurants: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
    rating: number;
  }> = Array.from(byRestaurant.entries())
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

  const timeline = build30DayBuckets(orders);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Platform overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Everything happening across Dineconnect.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiData.map(kpi => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top restaurants table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top restaurants by revenue</h3>
          </div>
          {topRestaurants.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Building2 className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={40} />
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
                  {topRestaurants.map(r => (
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

        {/* Timeline chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order timeline</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Orders across all restaurants (last 30 days)
          </p>
          {timeline.every(d => d.count === 0) ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-gray-400 dark:text-gray-500">No orders in the last 30 days.</p>
            </div>
          ) : (
            <OrderTimelineChart data={timeline} />
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main page
// ----------------------------------------------------------------------

export default function Analytics() {
  const navigate = useNavigate();
  const session = auth.getSession();

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (!session?.authenticated) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  if (!session?.authenticated) {
    // Show a spinner while the redirect happens
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Role-based branching
  switch (session.role) {
    case 'customer':
      return (
        <DashboardLayout userRole={session.role} userName={session.username} title="Analytics">
          <CustomerAnalytics uid={session.username} />
        </DashboardLayout>
      );

    case 'restaurant-admin':
      return (
        <DashboardLayout userRole={session.role} userName={session.username} title="Analytics">
          <RestaurantOwnerAnalytics ownerId={session.username} />
        </DashboardLayout>
      );

    case 'super-admin':
      return (
        <DashboardLayout userRole={session.role} userName={session.username} title="Analytics">
          <SuperAdminAnalytics />
        </DashboardLayout>
      );

    default:
      // Unknown role — show empty state
      return (
        <DashboardLayout userRole={session.role} userName={session.username} title="Analytics">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Unknown role — cannot display analytics.</p>
          </div>
        </DashboardLayout>
      );
  }
}
