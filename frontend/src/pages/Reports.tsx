import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Loader2,
  Building2,
  ShoppingCart,
  Package,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { auth } from '../services/auth';
import { orderService, restaurantService } from '../firebase';
import type { Order } from '../firebase';
import type { Restaurant } from '../data/restaurants';
import type { UserRole } from '../types';

/* --- Shared helpers (mirrors Orders.tsx) --- */

function getStatusColor(status: Order['status']): string {
  switch (status) {
    case 'delivered':
      return 'bg-green-50 text-success';
    case 'cancelled':
      return 'bg-red-50 text-danger';
    case 'placed':
      return 'bg-blue-50 text-primary';
    case 'confirmed':
      return 'bg-indigo-50 text-indigo-600';
    case 'preparing':
      return 'bg-amber-50 text-warning';
    case 'out_for_delivery':
      return 'bg-purple-50 text-purple-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
}

function formatStatus(status: Order['status']): string {
  return status.split('_').map((word) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function formatDate(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatItems(items: Order['items']): string {
  return items.map((item) => `${item.name} ×${item.quantity}`).join(', ');
}

/* --- Table header cell (sortable-looking) --- */

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-6 py-4 text-sm ${className}`}>{children}</td>
  );
}

/* --- Status badge row helper --- */

function StatusBadge({ status }: { status: Order['status'] }) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* ============================================================
   CUSTOMER: Order History Report
   ============================================================ */

interface CustomerReportProps {
  username: string;
  loading: boolean;
  orders: Order[];
  error: string | null;
}

function CustomerReport({ loading, orders, error }: CustomerReportProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order History</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All orders placed by you.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Package className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            You haven&apos;t placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50">
                <Th>Date</Th>
                <Th>Restaurant</Th>
                <Th>Items</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-center">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Td className="text-gray-900 dark:text-white whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </Td>
                  <Td className="font-medium text-gray-900 dark:text-white">
                    {order.restaurantName}
                  </Td>
                  <Td className="text-gray-500 dark:text-gray-400 max-w-xs">
                    {formatItems(order.items)}
                  </Td>
                  <Td className="text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    ${order.total.toFixed(2)}
                  </Td>
                  <Td className="text-center">
                    <StatusBadge status={order.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RESTAURANT-ADMIN: Restaurant Orders Report (grouped by status)
   ============================================================ */

const STATUS_GROUPS: Array<{ label: string; statuses: Order['status'][] }> = [
  { label: 'Pending', statuses: ['placed', 'confirmed', 'preparing', 'out_for_delivery'] },
  { label: 'Completed', statuses: ['delivered'] },
  { label: 'Cancelled', statuses: ['cancelled'] },
];

function groupOrdersByStatus(orders: Order[]): Map<string, Order[]> {
  const map = new Map<string, Order[]>();
  for (const group of STATUS_GROUPS) {
    map.set(group.label, []);
  }
  for (const o of orders) {
    for (const group of STATUS_GROUPS) {
      if (group.statuses.includes(o.status)) {
        const arr = map.get(group.label)!;
        arr.push(o);
        break;
      }
    }
  }
  return map;
}

interface RestaurantReportProps {
  restaurant: Restaurant;
  loading: boolean;
  orders: Order[];
  error: string | null;
}

function RestaurantReport({ restaurant, loading, orders, error }: RestaurantReportProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const grouped = groupOrdersByStatus(orders);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Orders for {restaurant.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All orders received at your restaurant, grouped by status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-12 text-center">
            <ShoppingCart className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              No orders yet. Keep an eye out!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([groupLabel, groupOrders]) =>
            groupOrders.length === 0 ? null : (
              <div key={groupLabel} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {groupLabel}
                    <span className="ml-2 text-gray-400 dark:text-gray-500 font-normal">
                      ({groupOrders.length})
                    </span>
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800/50">
                        <Th>Customer</Th>
                        <Th>Date</Th>
                        <Th>Items</Th>
                        <Th className="text-right">Total</Th>
                        <Th className="text-center">Status</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {groupOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <Td className="font-medium text-gray-900 dark:text-white">
                            {order.customerName}
                          </Td>
                          <Td className="text-gray-900 dark:text-white whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </Td>
                          <Td className="text-gray-500 dark:text-gray-400 max-w-xs">
                            {formatItems(order.items)}
                          </Td>
                          <Td className="text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            ${order.total.toFixed(2)}
                          </Td>
                          <Td className="text-center">
                            <StatusBadge status={order.status} />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SUPER-ADMIN: Platform Report
   ============================================================ */

interface RestaurantSummary {
  id: string;
  name: string;
  ordersCount: number;
  revenue: number;
  avgRating: number;
}

interface RecentOrder {
  id: string;
  restaurantName: string;
  customerName: string;
  items: Order['items'];
  total: number;
  status: Order['status'];
  createdAt: any;
}

interface PlatformReportProps {
  restaurants: Restaurant[];
  orders: Order[];
  loading: boolean;
  error: string | null;
}

function PlatformReport({ restaurants, orders, loading, error }: PlatformReportProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // --- Build restaurant summary from real data ---
  const nonCancelled = orders.filter((o) => o.status !== 'cancelled');
  const byRestaurant = new Map<string, { orders: number; revenue: number }>();
  for (const o of nonCancelled) {
    const entry = byRestaurant.get(o.restaurantId) || { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += o.total;
    byRestaurant.set(o.restaurantId, entry);
  }

  const summary: RestaurantSummary[] = restaurants
    .map((r) => ({
      id: r.id,
      name: r.name,
      ordersCount: byRestaurant.get(r.id)?.orders ?? 0,
      revenue: byRestaurant.get(r.id)?.revenue ?? 0,
      avgRating: r.rating ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // --- Recent orders (latest 15) ---
  const recentOrders: RecentOrder[] = orders.slice(0, 15).map((o) => ({
    id: o.id,
    restaurantName: o.restaurantName,
    customerName: o.customerName,
    items: o.items,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* Section 1: Restaurants Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Restaurants Summary
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Overview of every restaurant on the platform.
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          {summary.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Building2 className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                No restaurants registered yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50">
                    <Th>Restaurant</Th>
                    <Th className="text-right">Orders</Th>
                    <Th className="text-right">Revenue</Th>
                    <Th className="text-center">Avg. Rating</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {summary.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <Td className="font-medium text-gray-900 dark:text-white">{r.name}</Td>
                      <Td className="text-right text-gray-500 dark:text-gray-400">
                        {r.ordersCount}
                      </Td>
                      <Td className="text-right font-semibold text-gray-900 dark:text-white">
                        ${r.revenue.toFixed(2)}
                      </Td>
                      <Td className="text-center">
                        {r.avgRating > 0 ? (
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {r.avgRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Recent Orders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Recent Orders
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Latest orders across all restaurants.
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShoppingCart className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                No orders found in the system.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50">
                    <Th>Restaurant</Th>
                    <Th>Customer</Th>
                    <Th>Items</Th>
                    <Th className="text-right">Total</Th>
                    <Th className="text-center">Status</Th>
                    <Th className="text-right">Date</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <Td className="font-medium text-gray-900 dark:text-white">
                        {o.restaurantName}
                      </Td>
                      <Td className="text-gray-900 dark:text-white">
                        {o.customerName}
                      </Td>
                      <Td className="text-gray-500 dark:text-gray-400 max-w-xs">
                        {formatItems(o.items)}
                      </Td>
                      <Td className="text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        ${o.total.toFixed(2)}
                      </Td>
                      <Td className="text-center">
                        <StatusBadge status={o.status} />
                      </Td>
                      <Td className="text-gray-900 dark:text-white whitespace-nowrap text-right">
                        {formatDate(o.createdAt)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Main Reports page
   ============================================================ */

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role-specific state
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantOrders, setRestaurantOrders] = useState<Order[]>([]);
  const [platformRestaurants, setPlatformRestaurants] = useState<Restaurant[]>([]);
  const [platformOrders, setPlatformOrders] = useState<Order[]>([]);

  const session = auth.getSession();

  useEffect(() => {
    if (!session?.authenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (session.role === 'customer') {
          const orders = await orderService.getCustomerOrders(session.username);
          if (!cancelled) setCustomerOrders(orders);
        } else if (session.role === 'restaurant-admin') {
          const owned = await restaurantService.getRestaurantsByOwner(session.username);
          if (!cancelled) {
            if (!owned || owned.length === 0) {
              setError('No restaurant found. Please create one first.');
              setLoading(false);
              return;
            }
            setRestaurant(owned[0]);
            const orders = await orderService.getRestaurantOrders(owned[0].id);
            if (!cancelled) setRestaurantOrders(orders);
          }
        } else if (session.role === 'super-admin') {
          const [restaurants, orders] = await Promise.all([
            restaurantService.getAllRestaurants(),
            orderService.getAllOrders(),
          ]);
          if (!cancelled) {
            setPlatformRestaurants(restaurants);
            setPlatformOrders(orders);
          }
        } else {
          if (!cancelled) setError('Unknown role.');
        }
      } catch (err) {
        console.error('Error loading reports:', err);
        if (!cancelled) setError('Failed to load reports. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // Redirect if not authenticated
  if (!session?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  const validRoles: UserRole[] = ['customer', 'restaurant-admin', 'super-admin'];
  if (!validRoles.includes(session.role)) {
    return <Navigate to="/login" replace />;
  }

  const pageTitle =
    session.role === 'customer'
      ? 'Order History'
      : session.role === 'restaurant-admin'
      ? 'Restaurant Orders'
      : 'Platform Reports';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <DashboardLayout userRole={session.role} userName={session.username} title={pageTitle}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{pageTitle}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {session.role === 'customer'
              ? 'A complete history of every order you&apos;ve placed.'
              : session.role === 'restaurant-admin'
              ? 'Track and manage all orders for your restaurant.'
              : 'Full platform overview — restaurants, orders, and revenue.'}
          </p>
        </div>

        {/* Role-specific report */}
        {session.role === 'customer' && (
          <CustomerReport
            username={session.username}
            loading={loading}
            orders={customerOrders}
            error={error}
          />
        )}

        {session.role === 'restaurant-admin' && restaurant && (
          <RestaurantReport
            restaurant={restaurant}
            loading={loading}
            orders={restaurantOrders}
            error={error}
          />
        )}

        {session.role === 'super-admin' && (
          <PlatformReport
            restaurants={platformRestaurants}
            orders={platformOrders}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
