import { ShoppingBag, Heart, Clock, Star, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import KPICard from '../components/cards/KPICard';
import { auth } from '../services/auth';
import { orderService, favoriteService } from '../firebase';
import type { Order } from '../firebase';

interface KPIData {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  bgColor: string;
}

export default function CustomerOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session = auth.getSession();
  // Safe string primitive extraction to prevent object reference loops
  const username = session?.username; 

  // 1. Manage real-time orders subscription
  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribeOrders = orderService.subscribeToCustomerOrders(
      username,
      (customerOrders) => {
        setOrders(customerOrders);
        setLoading(false);
      },
    );

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [username]);

  // 2. Fetch favorites count separately (only runs when username changes)
  useEffect(() => {
    if (!username) return;

        const customerId = username;
    async function loadFavorites() {
      try {
        const favorites = await favoriteService.getCustomerFavorites(customerId);

        setFavoriteCount(favorites.length);
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    }
    loadFavorites();
  }, [username]);

  // 🚀 CRITICAL FIX: Calculate KPIs instantly on the fly during render!
  // No setKpiData states needed, eliminating loop triggers.
  const totalOrders = orders.length;
  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + order.total, 0);
  
  const loyaltyPoints = Math.floor(totalSpent * 10);
  const activeOrdersCount = orders.filter(o => 
    ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
  ).length;

  const kpiData: KPIData[] = [
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: <ShoppingBag size={24} className="text-primary" />,
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Favorite Restaurants',
      value: favoriteCount.toString(),
      icon: <Heart size={24} className="text-danger" />,
      bgColor: 'bg-red-50',
    },
    {
      title: 'Active Orders',
      value: activeOrdersCount.toString(),
      icon: <Clock size={24} className="text-warning" />,
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Loyalty Points',
      value: loyaltyPoints.toLocaleString(),
      icon: <Star size={24} className="text-success" />,
      bgColor: 'bg-green-50',
    },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-success';
      case 'cancelled': return 'bg-red-50 text-danger';
      case 'placed': return 'bg-blue-50 text-primary';
      case 'confirmed': return 'bg-indigo-50 text-indigo-600';
      case 'preparing': return 'bg-amber-50 text-warning';
      case 'out_for_delivery': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const formatStatus = (status: Order['status']) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatItems = (items: Order['items']) => {
    return items.map(item => `${item.name} x${item.quantity}`).join(', ');
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your dashboard.</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Dashboard</h2>
        <p className="text-gray-500">Track your orders, reservations, and rewards.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
        </div>
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No orders yet. Start ordering to see your history here!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{order.restaurantName}</p>
                  <p className="text-sm text-gray-500">{formatItems(order.items)}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
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
  );
}
