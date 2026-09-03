import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, Loader2, MapPin } from 'lucide-react';
import { orderService, restaurantService } from '../../firebase';
import type { Restaurant } from '../../data/restaurants';
import type { Session } from '../../services/auth';

interface CreateOrderFormProps {
  session: Session;
}

export default function CreateOrderForm({ session }: CreateOrderFormProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    restaurantService.getAllRestaurants()
      .then((items) => {
        if (cancelled) return;
        setRestaurants(items);
        if (items.length > 0) setRestaurantId(items[0].id);
      })
      .catch(() => {
        if (!cancelled) setFeedback({ type: 'error', message: 'Restaurants could not be loaded.' });
      })
      .finally(() => {
        if (!cancelled) setLoadingRestaurants(false);
      });
    return () => { cancelled = true; };
  }, []);

  const restaurant = restaurants.find((item) => item.id === restaurantId) ?? null;
  const selectedItems = useMemo(
    () => restaurant?.menu.filter((item) => (quantities[item.id] ?? 0) > 0) ?? [],
    [restaurant, quantities],
  );
  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] ?? 0),
    0,
  );

  function changeRestaurant(nextId: string) {
    setRestaurantId(nextId);
    setQuantities({});
    setFeedback(null);
  }

  function changeQuantity(itemId: string, delta: number) {
    setQuantities((current) => {
      const nextQuantity = Math.max(0, (current[itemId] ?? 0) + delta);
      const next = { ...current };
      if (nextQuantity === 0) delete next[itemId];
      else next[itemId] = nextQuantity;
      return next;
    });
    setFeedback(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!restaurant || selectedItems.length === 0) {
      setFeedback({ type: 'error', message: 'Choose a restaurant and at least one menu item.' });
      return;
    }
    if (!deliveryAddress.trim()) {
      setFeedback({ type: 'error', message: 'Add a delivery address before placing the order.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await orderService.createOrder({
        customerId: session.uid,
        customerName: session.username,
        customerEmail: session.email,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: selectedItems.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: quantities[item.id] ?? 0,
        })),
        total,
        status: 'placed',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        deliveryAddress: deliveryAddress.trim(),
        specialInstructions: specialInstructions.trim() || undefined,
      });
      setQuantities({});
      setDeliveryAddress('');
      setSpecialInstructions('');
      setFeedback({ type: 'success', message: 'Order placed successfully. It will appear in your order history.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not place the order. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary dark:text-orange-500 mb-1">
              <ShoppingBag size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">Quick order</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Build your next meal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Choose a restaurant, customize your basket, and send the order.</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-md bg-white/80 dark:bg-gray-900/70 text-primary dark:text-orange-500">
            <ShoppingBag size={22} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {feedback && (
          <div className={`rounded-md border px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`} role="status">
            {feedback.message}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2" htmlFor="order-restaurant">Restaurant</label>
          <select
            id="order-restaurant"
            value={restaurantId}
            onChange={(event) => changeRestaurant(event.target.value)}
            disabled={loadingRestaurants || submitting}
            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          >
            {loadingRestaurants ? <option>Loading restaurants…</option> : restaurants.length === 0 ? <option value="">No restaurants available</option> : restaurants.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.cuisine}</option>)}
          </select>
          {restaurant && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Menu</label>
            <span className="text-xs text-gray-500 dark:text-gray-400">Tap + to add items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {restaurant?.menu.map((item) => {
              const quantity = quantities[item.id] ?? 0;
              return (
                <div key={item.id} className={`rounded-md border p-4 transition-colors ${quantity > 0 ? 'border-orange-200 bg-orange-50 dark:border-orange-800/50 dark:bg-orange-950/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      <p className="text-sm font-bold text-primary dark:text-orange-500 mt-2">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => changeQuantity(item.id, -1)} disabled={quantity === 0 || submitting} aria-label={`Remove one ${item.name}`} className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 inline-flex items-center justify-center disabled:opacity-40"><Minus size={14} /></button>
                      <span className="w-5 text-center text-sm font-semibold text-gray-900 dark:text-white">{quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item.id, 1)} disabled={submitting} aria-label={`Add one ${item.name}`} className="w-8 h-8 rounded-md bg-primary hover:bg-orange-700 text-white inline-flex items-center justify-center disabled:opacity-40"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {restaurant && restaurant.menu.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 rounded-md bg-gray-50 dark:bg-gray-800 p-4">This restaurant has not published a menu yet.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2" htmlFor="order-address"><MapPin size={15} className="inline mr-1" />Delivery address</label>
            <input id="order-address" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} disabled={submitting} placeholder="Street, building, apartment" className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2" htmlFor="order-notes">Special instructions <span className="font-normal text-gray-400">(optional)</span></label>
            <input id="order-notes" value={specialInstructions} onChange={(event) => setSpecialInstructions(event.target.value)} disabled={submitting} placeholder="Allergies or delivery notes" className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Payment method</p><p className="font-semibold text-gray-900 dark:text-white">Cash on delivery</p></div>
          <div className="flex items-center gap-4"><div className="text-right"><p className="text-xs text-gray-500 dark:text-gray-400">Order total</p><p className="text-2xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</p></div><button type="submit" disabled={submitting || loadingRestaurants || selectedItems.length === 0} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-[#8F462E] text-white font-semibold px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{submitting && <Loader2 size={17} className="animate-spin" />}{submitting ? 'Placing…' : 'Place order'}</button></div>
        </div>
      </form>
    </section>
  );
}
