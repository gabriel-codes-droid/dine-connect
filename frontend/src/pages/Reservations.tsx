import { Calendar, Users, Clock, Check, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import KPICard from '../components/cards/KPICard';
import DashboardLayout from '../components/layout/DashboardLayout';
import { auth } from '../services/auth';
import { reservationService } from '../firebase/reservationService';
import { restaurantService } from '../firebase';
import type { Reservation } from '../firebase/reservationService';
import type { UserRole } from '../types';

// --- Helpers ----------------------------------------------------------------

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function isUpcoming(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const resDate = new Date(dateStr + 'T00:00:00');
  return resDate >= today;
}

function getStatusColor(status: Reservation['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
    case 'confirmed':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700';
  }
}

function formatStatus(status: Reservation['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// --- Page component --------------------------------------------------------

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const session = auth.getSession();

  // --- Data loading --------------------------------------------------------
  useEffect(() => {
    if (!session?.authenticated) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    async function loadReservations() {
      if (!session) return;
      try {
        setLoading(true);
        setError(null);

        if (session.role === 'customer') {
          // Customer: subscribe to own reservations
          unsubscribe = reservationService.subscribeToReservationsByCustomer(
            session.username,
            (res) => {
              setReservations(res);
              setLoading(false);
            }
          );
        } else if (session.role === 'restaurant-admin') {
          // Restaurant-admin: find owned restaurant, then subscribe
          const owned = await restaurantService.getRestaurantsByOwner(session.username);
          if (!owned || owned.length === 0) {
            setError('No restaurant found. Please create one first.');
            setLoading(false);
            return;
          }
          const restaurantId = owned[0].id;
          unsubscribe = reservationService.subscribeToReservationsByRestaurant(
            restaurantId,
            (res) => {
              setReservations(res);
              setLoading(false);
            }
          );
        } else if (session.role === 'super-admin') {
          // Super-admin: subscribe to ALL reservations
          const { db } = await import('../firebase/config');
          const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
          const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
          unsubscribe = onSnapshot(q, (snapshot) => {
            const all = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            } as Reservation));
            setReservations(all);
            setLoading(false);
          });
        }
      } catch (err) {
        console.error('Error loading reservations:', err);
        setError('Failed to load reservations. Please try again.');
        setLoading(false);
      }
    }

    loadReservations();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [session]);

  // --- Auth guard ----------------------------------------------------------
  if (!session?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  const validRoles: UserRole[] = ['customer', 'restaurant-admin', 'super-admin'];
  if (!validRoles.includes(session.role)) {
    return <Navigate to="/login" replace />;
  }

  // --- Compute KPIs from current data ------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReservations = reservations.filter((r) => {
    const resDate = new Date(r.date + 'T00:00:00');
    return resDate >= today && r.status !== 'cancelled';
  });
  const confirmedReservations = reservations.filter(
    (r) => r.status === 'confirmed'
  );
  const cancelledReservations = reservations.filter(
    (r) => r.status === 'cancelled'
  );

  const kpiData = [
    {
      title: 'Upcoming',
      value: upcomingReservations.length.toString(),
      icon: <Calendar size={24} className="text-primary" />,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Confirmed',
      value: confirmedReservations.length.toString(),
      icon: <Check size={24} className="text-success" />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Cancelled',
      value: cancelledReservations.length.toString(),
      icon: <X size={24} className="text-danger" />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Total',
      value: reservations.length.toString(),
      icon: <Users size={24} className="text-purple-600 dark:text-purple-400" />,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  // --- Filter logic --------------------------------------------------------
  let filteredReservations: Reservation[];

  if (filter === 'upcoming') {
    filteredReservations = reservations.filter((r) => {
      const resDate = new Date(r.date + 'T00:00:00');
      return resDate >= today && r.status !== 'cancelled';
    });
  } else if (filter === 'past') {
    filteredReservations = reservations.filter((r) => {
      const resDate = new Date(r.date + 'T00:00:00');
      return resDate < today || r.status === 'cancelled';
    });
  } else {
    filteredReservations = [...reservations];
  }

  // Sort: upcoming first, then past; within each group by date desc
  filteredReservations.sort((a, b) => {
    const aUpcoming = isUpcoming(a.date) && a.status !== 'cancelled';
    const bUpcoming = isUpcoming(b.date) && b.status !== 'cancelled';
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
  });

  // --- Resolve restaurant names (cached per render) -----------------------
  // Build a map of restaurantId -> name by fetching in parallel when needed.
  // We do this inside a useEffect to avoid blocking render.
  const [restaurantNames, setRestaurantNames] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (reservations.length === 0) return;
    const ids = [...new Set(reservations.map((r) => r.restaurantId))];
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      const names: Record<string, string> = {};
      for (const id of ids) {
        try {
          const r = await restaurantService.getRestaurantById(id);
          if (!cancelled && r) names[id] = r.name;
        } catch {
          // leave blank
        }
      }
      if (!cancelled) setRestaurantNames(names);
    })();
    return () => {
      cancelled = true;
    };
  }, [reservations]);

  const getRestaurantName = (id: string) => restaurantNames[id] || 'Restaurant';

  // --- Page title ----------------------------------------------------------
  const pageTitle =
    session.role === 'customer'
      ? 'My Reservations'
      : session.role === 'restaurant-admin'
      ? 'Restaurant Reservations'
      : 'All Reservations';

  const pageSubtitle =
    session.role === 'customer'
      ? 'View and manage your table bookings.'
      : session.role === 'restaurant-admin'
      ? 'Manage reservations for your restaurant.'
      : 'View and manage all reservations across the platform.';

  // --- Loading / error states ---------------------------------------------
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

  // --- Render --------------------------------------------------------------
  return (
    <DashboardLayout
      userRole={session.role}
      userName={session.username}
      title={pageTitle}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {pageTitle}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{pageSubtitle}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiData.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-slate-800">
          {(
            [
              ['upcoming', 'Upcoming'],
              ['past', 'Past'],
              ['all', 'All'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                filter === value
                  ? 'text-primary border-b-2 border-primary -mb-px'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent -mb-px'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reservation Cards */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-12 text-center">
              <Calendar
                className="mx-auto text-gray-300 dark:text-slate-600 mb-4"
                size={48}
              />
              <p className="text-gray-500 dark:text-gray-400">
                {session.role === 'customer'
                  ? 'You haven\'t made any reservations yet.'
                  : session.role === 'restaurant-admin'
                  ? 'No reservations yet for your restaurant.'
                  : 'No reservations found in the system.'}
              </p>
            </div>
          ) : (
            filteredReservations.map((res) => {
              const isOwn = session.role === 'customer';
              const canCancel =
                (isOwn && res.status !== 'cancelled') ||
                (session.role === 'restaurant-admin' &&
                  res.status !== 'cancelled') ||
                session.role === 'super-admin';

              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar
                          size={18}
                          className="text-primary flex-shrink-0"
                        />
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {getRestaurantName(res.restaurantId)}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(res.date)} · {formatTime(res.time)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users size={14} />
                          {res.partySize} {res.partySize === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>
                      {/* Status + customer info */}
                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(
                            res.status
                          )}`}
                        >
                          {formatStatus(res.status)}
                        </span>
                        {!isOwn && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Customer: {res.customerId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {canCancel && (
                        <button
                          onClick={async () => {
                            setActionLoading(res.id);
                            try {
                              await reservationService.cancelReservation(res.id);
                            } catch (err) {
                              console.error('Cancel failed:', err);
                              setError('Failed to cancel reservation.');
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                          disabled={actionLoading === res.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === res.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <X size={14} />
                          )}
                          Cancel
                        </button>
                      )}
                      {session.role === 'restaurant-admin' &&
                        res.status === 'pending' && (
                          <button
                            onClick={async () => {
                              setActionLoading(res.id);
                              try {
                                await reservationService.updateReservationStatus(
                                  res.id,
                                  'confirmed'
                                );
                              } catch (err) {
                                console.error('Confirm failed:', err);
                                setError('Failed to confirm reservation.');
                              } finally {
                                setActionLoading(null);
                              }
                            }}
                            disabled={actionLoading === res.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === res.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                            Confirm
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
