import { useEffect, useState } from 'react';
import { Calendar, Clock, Loader2, MapPin, Users } from 'lucide-react';
import { reservationService, restaurantService } from '../../firebase';
import type { Restaurant } from '../../data/restaurants';
import type { Session } from '../../services/auth';

interface CreateReservationFormProps {
  session: Session;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function buildTimeSlots(hours: string | undefined): string[] {
  const match = hours?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
  const toMinutes = (hour: string, minute: string, period: string) => {
    let value = Number(hour);
    if (period.toUpperCase() === 'PM' && value !== 12) value += 12;
    if (period.toUpperCase() === 'AM' && value === 12) value = 0;
    return value * 60 + Number(minute);
  };
  const start = Math.max(toMinutes(match[1], match[2], match[3]), 16 * 60);
  const end = Math.min(toMinutes(match[4], match[5], match[6]), 23 * 60);
  const slots: string[] = [];
  for (let minutes = start; minutes <= end; minutes += 30) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return slots.length > 0 ? slots : ['17:00', '18:00', '19:00', '20:00', '21:00'];
}

export default function CreateReservationForm({ session }: CreateReservationFormProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [date, setDate] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return next.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    restaurantService.getAllRestaurants()
      .then((items) => {
        if (cancelled) return;
        setRestaurants(items);
        if (items.length > 0) {
          setRestaurantId(items[0].id);
          setTime(buildTimeSlots(items[0].hours)[0]);
        }
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
  const timeSlots = buildTimeSlots(restaurant?.hours);

  function changeRestaurant(nextId: string) {
    setRestaurantId(nextId);
    const nextRestaurant = restaurants.find((item) => item.id === nextId);
    if (nextRestaurant) setTime(buildTimeSlots(nextRestaurant.hours)[0]);
    setFeedback(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!restaurantId || !restaurant) {
      setFeedback({ type: 'error', message: 'Choose a restaurant before continuing.' });
      return;
    }
    if (date < todayISO()) {
      setFeedback({ type: 'error', message: 'Choose today or a future date.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await reservationService.createReservation(
        restaurantId,
        session.uid,
        partySize,
        date,
        time,
      );
      setFeedback({ type: 'success', message: `Reservation requested at ${restaurant.name} for ${date} at ${time}.` });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not create the reservation. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-[#E8EFE4] dark:bg-[#29352C]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-secondary dark:text-[#9CAF93] mb-1"><Calendar size={18} /><span className="text-xs font-semibold uppercase tracking-wider">Plan ahead</span></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reserve your table</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Choose the restaurant, date, time, and party size in one place.</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-md bg-white/80 dark:bg-gray-900/70 text-secondary dark:text-[#9CAF93]"><Calendar size={22} /></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {feedback && <div className={`rounded-md border px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`} role="status">{feedback.message}</div>}

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2" htmlFor="reservation-restaurant">Restaurant</label>
          <select id="reservation-restaurant" value={restaurantId} onChange={(event) => changeRestaurant(event.target.value)} disabled={loadingRestaurants || submitting} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-60">
            {loadingRestaurants ? <option>Loading restaurants…</option> : restaurants.length === 0 ? <option value="">No restaurants available</option> : restaurants.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.cuisine}</option>)}
          </select>
          {restaurant && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"><MapPin size={13} className="inline mr-1" />{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2" htmlFor="reservation-date"><Calendar size={15} className="inline mr-1" />Date</label>
            <input id="reservation-date" type="date" min={todayISO()} value={date} onChange={(event) => setDate(event.target.value)} disabled={submitting} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2" htmlFor="reservation-time"><Clock size={15} className="inline mr-1" />Time</label>
            <select id="reservation-time" value={time} onChange={(event) => setTime(event.target.value)} disabled={submitting} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary">{timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"><Users size={15} className="inline mr-1" />Guests</label>
            <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"><button type="button" onClick={() => setPartySize((current) => Math.max(1, current - 1))} disabled={submitting || partySize <= 1} className="px-4 py-3 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">−</button><span className="flex-1 text-center font-semibold text-gray-900 dark:text-white">{partySize}</span><button type="button" onClick={() => setPartySize((current) => Math.min(20, current + 1))} disabled={submitting || partySize >= 20} className="px-4 py-3 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">+</button></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2"><div><p className="text-xs text-gray-500 dark:text-gray-400">Booking policy</p><p className="font-semibold text-gray-900 dark:text-white">Free cancellation up to 2 hours before</p></div><button type="submit" disabled={submitting || loadingRestaurants || !restaurantId} className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary hover:bg-[#5D6D58] text-white font-semibold px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{submitting && <Loader2 size={17} className="animate-spin" />}{submitting ? 'Reserving…' : 'Confirm reservation'}</button></div>
      </form>
    </section>
  );
}
