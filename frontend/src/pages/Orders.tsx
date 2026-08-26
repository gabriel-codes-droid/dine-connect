import { ShoppingBag, ShoppingCart, Users, DollarSign, Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import KPICard from '../components/cards/KPICard';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPageHeader from '../components/layout/DashboardPageHeader';
import CreateOrderForm from '../components/orders/CreateOrderForm';
import { auth } from '../services/auth';
import { orderService, restaurantService } from '../firebase';
import type { Order } from '../firebase';
import type { UserRole } from '../types';

interface KPIData {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  bgColor?: string;
  accent?: 'indigo' | 'green' | 'purple' | 'amber' | 'sky' | 'rose' | 'emerald' | 'orange';
}

function isOrderActive(status: Order['status']): boolean {
  return ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(status);
}

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
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function formatDate(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatItems(items: Order['items']): string {
  return items.map(item => `${item.name} x${item.quantity}`).join(', ');
}

export default function Orders() {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session = auth.getSession();

  useEffect(() => {
    if (!session?.authenticated) {
      setLoading(false);
      return;
    }

    let unsubscribeOrders: (() => void) | null = null;

    async function loadOrders() {
      if (!session) return;

      try {
        setLoading(true);
        setError(null);

        if (session.role === 'customer') {
          // Customer: show own orders
          unsubscribeOrders = orderService.subscribeToCustomerOrders(
            session.username,
            (customerOrders) => {
              setOrders(customerOrders);

              const totalOrders = customerOrders.length;
              const totalSpent = customerOrders
                .filter(o => o.status === 'delivered')
                .reduce((sum, order) => sum + order.total, 0);
              const loyaltyPoints = Math.floor(totalSpent * 10);

              setKpiData([
                {
                  title: 'Total Orders',
                  value: totalOrders.toString(),
                  icon: <ShoppingBag size={24} className="text-primary" />,
                  accent: 'indigo',
                },
                {
                  title: 'Total Spent',
                  value: `$${totalSpent.toFixed(2)}`,
                  icon: <DollarSign size={24} className="text-success" />,
                  accent: 'green',
                },
                {
                  title: 'Active Orders',
                  value: customerOrders.filter(o => isOrderActive(o.status)).length.toString(),
                  icon: <Clock size={24} className="text-warning" />,
                  accent: 'amber',
                },
                {
                  title: 'Loyalty Points',
                  value: loyaltyPoints.toLocaleString(),
                  icon: <ShoppingBag size={24} className="text-purple-600" />,
                  accent: 'purple',
                },
              ]);
              setLoading(false);
            }
          );
        } else if (session.role === 'restaurant-admin') {
          // Restaurant-admin: resolve restaurant first, then subscribe
          const owned = await restaurantService.getRestaurantsByOwner(session.username);
          if (!owned || owned.length === 0) {
            setError('No restaurant found. Please create one first.');
            setLoading(false);
            return;
          }

          const restaurantId = owned[0].id;
          unsubscribeOrders = orderService.subscribeToRestaurantOrders(
            restaurantId,
            (restaurantOrders) => {
              setOrders(restaurantOrders);

              const today = new Date();
              const todayOrders = restaurantOrders.filter(order => {
                const orderDate = order.createdAt?.toDate
                  ? order.createdAt.toDate()
                  : new Date();
                return orderDate.toDateString() === today.toDateString();
              });
              const todayRevenue = todayOrders
                .filter(o => o.status !== 'cancelled')
                .reduce((sum, order) => sum + order.total, 0);
              const activeCustomers = new Set(restaurantOrders.map(o => o.customerId)).size;

              setKpiData([
                {
                  title: "Today's Orders",
                  value: todayOrders.length.toString(),
                  icon: <ShoppingCart size={24} className="text-primary" />,
                  accent: 'indigo',
                },
                {
                  title: 'Active Orders',
                  value: restaurantOrders.filter(o => isOrderActive(o.status)).length.toString(),
                  icon: <Clock size={24} className="text-success" />,
                  accent: 'green',
                },
                {
                  title: 'Active Customers',
                  value: activeCustomers.toString(),
                  icon: <Users size={24} className="text-purple-600" />,
                  accent: 'purple',
                },
                {
                  title: "Today's Revenue",
                  value: `$${todayRevenue.toFixed(0)}`,
                  icon: <DollarSign size={24} className="text-warning" />,
                  accent: 'amber',
                },
              ]);
              setLoading(false);
            }
          );
        } else if (session.role === 'super-admin') {
          // Super-admin: fetch all orders
          const allOrders = await orderService.getAllOrders();
          setOrders(allOrders);

          const totalOrders = allOrders.length;
          const totalRevenue = allOrders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, order) => sum + order.total, 0);
          const activeCustomers = new Set(allOrders.map(o => o.customerId)).size;
          const activeCount = allOrders.filter(o => isOrderActive(o.status)).length;

          setKpiData([
            {
              title: 'Total Orders',
              value: totalOrders.toString(),
              icon: <ShoppingCart size={24} className="text-primary" />,
              accent: 'indigo',
            },
            {
              title: 'Total Revenue',
              value: `$${totalRevenue.toFixed(2)}`,
              icon: <DollarSign size={24} className="text-success" />,
              accent: 'green',
            },
            {
              title: 'Active Customers',
              value: activeCustomers.toString(),
              icon: <Users size={24} className="text-purple-600" />,
              accent: 'purple',
            },
            {
              title: 'Active Orders',
              value: activeCount.toString(),
              icon: <Clock size={24} className="text-warning" />,
              accent: 'amber',
            },
          ]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders. Please try again.');
        setLoading(false);
      }
    }

    loadOrders();

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [session?.username, session?.role]);

  // Redirect if not authenticated or wrong role for this page
  if (!session?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  const validRoles: UserRole[] = ['customer', 'restaurant-admin', 'super-admin'];
  if (!validRoles.includes(session.role)) {
    return <Navigate to="/login" replace />;
  }

  const pageTitle =
    session.role === 'customer'
      ? 'My Orders'
      : session.role === 'restaurant-admin'
      ? 'Restaurant Orders'
      : 'All Orders';

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
    <DashboardLayout userRole={session.role} userName={session.username} title={pageTitle}>
      <div className="space-y-6">
        <DashboardPageHeader
          eyebrow="Order centre"
          title={pageTitle}
          subtitle={
            session.role === 'customer'
              ? 'Track your order history and place a new meal order.'
              : session.role === 'restaurant-admin'
              ? 'Monitor incoming orders for your restaurant.'
              : 'View and manage all orders across the platform.'
          }
          icon={ShoppingCart}
        />

        {session.role === 'customer' && <CreateOrderForm session={session} />}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiData.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {session.role === 'customer'
                ? 'Order History'
                : session.role === 'restaurant-admin'
                ? 'Recent Orders'
                : 'All Orders'}
            </h3>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShoppingBag className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                {session.role === 'customer'
                  ? "You haven't placed any orders yet."
                  : session.role === 'restaurant-admin'
                  ? 'No orders yet. Keep an eye out!'
                  : 'No orders found in the system.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {session.role === 'customer' ? order.restaurantName : order.customerName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {formatItems(order.items)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                      {session.role === 'super-admin' && (
                        <span className="ml-2 text-gray-400">· {order.restaurantName}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${order.total.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
