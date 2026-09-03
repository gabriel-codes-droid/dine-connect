import { Users, Loader2, Mail, ShoppingBag, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import KPICard from '../components/cards/KPICard';
import DashboardLayout from '../components/layout/DashboardLayout';
import { auth } from '../services/auth';
import { orderService, restaurantService } from '../firebase';
import type { Order } from '../firebase';
import type { Restaurant } from '../data/restaurants';
import type { UserRole } from '../types';

interface CustomerRow {
  id: string;           // customerId / username
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  lastOrderAt: Date | null;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return 'never';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function buildCustomerRows(orders: Order[]): CustomerRow[] {
  const byId = new Map<string, CustomerRow>();
  for (const o of orders) {
    const id = o.customerId;
    const existing = byId.get(id);
    const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : null;
    if (existing) {
      existing.orders += 1;
      if (o.status !== 'cancelled') existing.totalSpent += o.total;
      if (orderDate && (!existing.lastOrderAt || orderDate > existing.lastOrderAt)) {
        existing.lastOrderAt = orderDate;
      }
    } else {
      byId.set(id, {
        id,
        name: o.customerName || id,
        email: o.customerEmail || '—',
        orders: 1,
        totalSpent: o.status === 'cancelled' ? 0 : o.total,
        lastOrderAt: orderDate,
      });
    }
  }
  return Array.from(byId.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export default function Customers() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ownedRestaurants, setOwnedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (session.role === 'super-admin') {
          // Super-admin: customers from every order on the platform
          const all = await orderService.getAllOrders();
          if (!cancelled) setOrders(all);
        } else if (session.role === 'restaurant-admin') {
          // Restaurant-admin: customers who ordered from THEIR restaurant only
          const owned = await restaurantService.getRestaurantsByOwner(session.uid);
          if (!cancelled) setOwnedRestaurants(owned);
          if (owned.length === 0) {
            if (!cancelled) setOrders([]);
            return;
          }
          const ownedIds = new Set(owned.map((r) => r.id));
          const all = await orderService.getAllOrders();
          const filtered = all.filter((o) => ownedIds.has(o.restaurantId));
          if (!cancelled) setOrders(filtered);
        } else {
          if (!cancelled) setError('Access denied.');
        }
      } catch (err) {
        console.error('Error loading customers data:', err);
        if (!cancelled) setError('Failed to load data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.authenticated, session?.role, session?.username]);

  // Not logged in
  if (!session?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  const validRoles: UserRole[] = ['super-admin', 'restaurant-admin'];
  if (!validRoles.includes(session.role)) {
    return <Navigate to="/" replace />;
  }

  const pageTitle = session.role === 'super-admin' ? 'Customers' : 'My Customers';
  const pageSubtitle =
    session.role === 'super-admin'
      ? 'Every customer who has placed an order on the platform.'
      : 'Customers who have ordered from your restaurant.';

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

  const rows = buildCustomerRows(orders);
  const totalCustomers = rows.length;
  const totalRevenue = rows.reduce((sum, r) => sum + r.totalSpent, 0);
  const totalOrders = rows.reduce((sum, r) => sum + r.orders, 0);
  const avgPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <DashboardLayout
      userRole={session.role}
      userName={session.username}
      title={pageTitle}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {pageTitle}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{pageSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KPICard
            title="Total Customers"
            value={totalCustomers.toLocaleString()}
            icon={<Users size={24} className="text-primary" />}
            accent="indigo"
          />
          <KPICard
            title="Total Orders"
            value={totalOrders.toLocaleString()}
            icon={<ShoppingBag size={24} className="text-emerald-600 dark:text-emerald-400" />}
            accent="emerald"
          />
          <KPICard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(0)}`}
            icon={<DollarSign size={24} className="text-amber-600 dark:text-amber-400" />}
            accent="amber"
          />
          <KPICard
            title="Avg. per Customer"
            value={`$${avgPerCustomer.toFixed(2)}`}
            icon={<Users size={24} className="text-purple-600 dark:text-purple-400" />}
            accent="purple"
          />
        </div>

        {rows.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              {session.role === 'super-admin'
                ? 'No customers yet — they show up here after placing their first order.'
                : 'No customers yet — once someone orders from your restaurant, they show up here.'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.role === 'super-admin' ? 'All Customers' : 'Your Customers'}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {rows.length} {rows.length === 1 ? 'customer' : 'customers'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate max-w-xs">{row.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-medium">{row.orders}</td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-semibold">${row.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 text-sm">
                        {formatRelativeTime(row.lastOrderAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {session.role === 'restaurant-admin' && ownedRestaurants.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            You don't have a restaurant yet. Create one from your dashboard to start receiving orders.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
