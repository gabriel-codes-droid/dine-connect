import { ShoppingCart, Calendar, Users, DollarSign, Loader2, Store } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import KPICard from '../components/cards/KPICard';
import { OrdersBarChart, DonutChart } from '../components/charts/Charts';
import MenuEditor from '../components/restaurant/MenuEditor';
import { auth } from '../services/auth';
import { orderService, restaurantService } from '../firebase';
import type { Order } from '../firebase';
import type { Restaurant, Cuisine } from '../data/restaurants';

interface KPIData {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  bgColor: string;
}

const CUISINE_OPTIONS: Cuisine[] = [
  'Italian', 'Japanese', 'American', 'Mexican', 'Indian',
  'French', 'Chinese', 'Thai', 'Mediterranean', 'Seafood',
];

// Shown once, the first time a restaurant-admin logs in with no restaurant yet.
function CreateRestaurantForm({ ownerId, onCreated }: { ownerId: string; onCreated: (r: Restaurant) => void }) {
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState<Cuisine>('American');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Restaurant name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const id = await restaurantService.saveRestaurant({
        name: name.trim(),
        tagline: '',
        description: description.trim(),
        cuisine,
        priceRange: '$$',
        rating: 0,
        reviewCount: 0,
        address: address.trim(),
        city: '',
        phone: '',
        hours: '',
        capacity: 0,
        features: [],
        heroImage: '',
        imageUrl: '',
        accent: 'indigo',
        coverEmoji: '🍽️',
        gallery: [],
        galleryImages: [],
        menu: [],
        reviews: [],
        openNow: true,
        ownerId,
      });
      onCreated({
        id,
        name: name.trim(),
        tagline: '',
        description: description.trim(),
        cuisine,
        priceRange: '$$',
        rating: 0,
        reviewCount: 0,
        address: address.trim(),
        city: '',
        phone: '',
        hours: '',
        capacity: 0,
        features: [],
        heroImage: '',
        imageUrl: '',
        accent: 'indigo',
        coverEmoji: '🍽️',
        gallery: [],
        galleryImages: [],
        menu: [],
        reviews: [],
        openNow: true,
        ownerId,
      });
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError('Failed to create restaurant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
          <Store className="text-primary" size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Set up your restaurant</h2>
        <p className="text-gray-500 text-sm mt-1">
          This only takes a minute — you can fill in the rest later.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. The Golden Fork"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value as Cuisine)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CUISINE_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Street, city"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What makes your restaurant worth a visit?"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          {saving ? 'Creating…' : 'Create restaurant'}
        </button>
      </form>
    </div>
  );
}

export default function RestaurantOverview() {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [resolvingRestaurant, setResolvingRestaurant] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu'>('overview');

  const session = auth.getSession();
  const sessionUid = session?.uid;

  // Compute chart data from orders
  const dailyOrdersData = (() => {
    const counts = new Array(7).fill(0);
    orders.forEach(order => {
      const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
      counts[d.getDay()]++;
    });
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
      label,
      orders: counts[(i + 1) % 7],
    }));
  })();

  const revenueByCategoryData = (() => {
    const catMap: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const revenue = (item.price || 0) * item.quantity;
        catMap[item.name] = (catMap[item.name] || 0) + revenue;
      });
    });
    const colors = ['#6366F1', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value: Math.round(value), color: colors[i % colors.length] }));
  })();

  // Step 1: find the restaurant owned by this admin (or none yet)
  useEffect(() => {
    if (!sessionUid || !session || session.role !== 'restaurant-admin') {
      setResolvingRestaurant(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const owned = await restaurantService.getRestaurantsByOwner(sessionUid);
        if (!cancelled) {
          setRestaurant(owned[0] ?? null);
          setResolvingRestaurant(false);
        }
      } catch (err) {
        console.error('Error resolving restaurant:', err);
        if (!cancelled) {
          setError('Failed to load your restaurant. Please try again.');
          setResolvingRestaurant(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [sessionUid, session?.role]);

  const handleCreated = useCallback((r: Restaurant) => setRestaurant(r), []);

  // Step 2: once we know the restaurant, subscribe to its real orders
  useEffect(() => {
    if (!restaurant) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const safetyTimeout = setTimeout(() => setLoading(false), 8000);
    const unsubscribe = orderService.subscribeToRestaurantOrders(
      restaurant.id,
      (restaurantOrders) => {
        setOrders(restaurantOrders);

        const today = new Date();
        const todayOrders = restaurantOrders.filter(order => {
          const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
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
            bgColor: 'bg-indigo-50',
          },
          {
            title: 'Active Orders',
            value: restaurantOrders.filter(o =>
              ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
            ).length.toString(),
            icon: <Calendar size={24} className="text-success" />,
            bgColor: 'bg-green-50',
          },
          {
            title: 'Active Customers',
            value: activeCustomers.toString(),
            icon: <Users size={24} className="text-purple-600" />,
            bgColor: 'bg-purple-50',
          },
          {
            title: "Today's Revenue",
            value: `$${todayRevenue.toFixed(0)}`,
            icon: <DollarSign size={24} className="text-warning" />,
            bgColor: 'bg-amber-50',
          },
        ]);
        setLoading(false);
      }
    );

    return () => { clearTimeout(safetyTimeout); unsubscribe(); };
  }, [restaurant]);

  if (!session || session.role !== 'restaurant-admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Restaurant admin access required.</p>
      </div>
    );
  }

  if (resolvingRestaurant) {
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

  if (!restaurant) {
    return <CreateRestaurantForm ownerId={session.username} onCreated={handleCreated} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{restaurant.name}</h2>
        <p className="text-gray-500">Manage your restaurant operations and track performance.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'menu'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Menu Management
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiData.map((kpi) => (
              <KPICard key={kpi.title} {...kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Orders</h3>
              {orders.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  No orders yet
                </div>
              ) : (
                <OrdersBarChart data={dailyOrdersData} />
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
              {revenueByCategoryData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  No orders yet
                </div>
              ) : (
                <DonutChart data={revenueByCategoryData} />
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {order.createdAt?.toDate ?
                          new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(order.createdAt.toDate()) :
                          'Unknown'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-50 text-success' :
                        order.status === 'cancelled' ? 'bg-red-50 text-danger' :
                        'bg-amber-50 text-warning'
                      }`}>
                        {order.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'menu' && (
        <MenuEditor restaurantId={restaurant.id} />
      )}
    </div>
  );
}
