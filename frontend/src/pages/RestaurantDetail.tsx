import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Clock,
  Star,
  Users,
  Calendar,
  Heart,
  Share2,
  Check,
  Sun,
  Moon,
  LogIn,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Restaurant } from '../data/restaurants';
import {
  restaurantService,
  reviewService,
  reservationService,
  favoriteService,
  type Review,
} from '../firebase';
import { auth } from '../services/auth';
import { Timestamp } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import PublicAccountControls from '../components/layout/PublicAccountControls';

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-yellow-500', 'bg-red-500', 'bg-orange-500', 'bg-green-500',
  'bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-indigo-500',
];
const avatarColorFor = (seed: string) =>
  AVATAR_COLORS[Math.abs([...seed].reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length];

const formatReviewDate = (ts: Timestamp | Date | string | undefined) => {
  if (!ts) return '';
  let d: Date;
  if (ts instanceof Date) d = ts;
  else if (typeof (ts as any).toDate === 'function') d = (ts as Timestamp).toDate();
  else d = new Date(ts as any);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff < 1) return 'Today';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return d.toLocaleDateString();
};

const menuCategories = ['Starters', 'Mains', 'Desserts', 'Drinks'] as const;
type MenuCategory = (typeof menuCategories)[number];

// --- Open-now check from the "hours" string (e.g. "Tue–Sun · 5:00 PM – 11:00 PM") ---
function isOpenNow(hours: string | undefined): boolean {
  if (!hours) return false;
  // Extract the time range — match "H:MM AM/PM – H:MM AM/PM" at the end
  const m = hours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return false;
  const toMinutes = (h: string, mm: string, ap: string) => {
    let hh = parseInt(h, 10);
    const mmm = parseInt(mm, 10);
    const upper = ap.toUpperCase();
    if (upper === 'PM' && hh !== 12) hh += 12;
    if (upper === 'AM' && hh === 12) hh = 0;
    return hh * 60 + mmm;
  };
  const openMin = toMinutes(m[1], m[2], m[3]);
  const closeMin = toMinutes(m[4], m[5], m[6]);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (closeMin > openMin) {
    return nowMin >= openMin && nowMin <= closeMin;
  }
  // Wraps past midnight
  return nowMin >= openMin || nowMin <= closeMin;
}

// --- Time slot options from the restaurant's hours string ---
function buildTimeSlots(hours: string | undefined): string[] {
  const m = hours?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return ['17:00', '18:00', '19:00', '20:00', '21:00']; // sensible fallback
  const toMinutes = (h: string, mm: string, ap: string) => {
    let hh = parseInt(h, 10);
    if (ap.toUpperCase() === 'PM' && hh !== 12) hh += 12;
    if (ap.toUpperCase() === 'AM' && hh === 12) hh = 0;
    return hh * 60 + parseInt(mm, 10);
  };
  const openMin = toMinutes(m[1], m[2], m[3]);
  const closeMin = toMinutes(m[4], m[5], m[6]);
  const start = Math.max(openMin, 16 * 60); // not before 4pm
  const end = Math.min(closeMin > openMin ? closeMin : closeMin + 24 * 60, 23 * 60);
  const slots: string[] = [];
  for (let t = start; t <= end; t += 30) {
    const hh = Math.floor(t / 60) % 24;
    const mm = t % 60;
    slots.push(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  }
  return slots.length ? slots : ['17:00', '18:00', '19:00', '20:00', '21:00'];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [formAuthor, setFormAuthor] = useState(() => auth.getSession()?.username || '');
  const [submitting, setSubmitting] = useState(false);

  const [activeCategory, setActiveCategory] = useState<MenuCategory>('Mains');
  const [activeImage, setActiveImage] = useState(0);
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState('19:00');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [reserved, setReserved] = useState(false);
  const [reservationError, setReservationError] = useState('');

  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const session = auth.getSession();
  const isAuthed = !!session?.authenticated;

  // --- Restaurant data ---
  useEffect(() => {
    let active = true;
    restaurantService
      .getRestaurantById(id!)
      .then((data) => {
        if (active) {
          setRestaurant(data);
          // Default the time selector to the restaurant's earliest available slot
          if (data?.hours) {
            const slots = buildTimeSlots(data.hours);
            setTime(slots[0]);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load restaurant:', err);
        toast.error('Could not load this restaurant.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  // --- Reviews (real-time) ---
  useEffect(() => {
    if (!id) return;
    const unsubscribe = reviewService.subscribeToReviews(id, (data) => {
      setReviews(data);
      setReviewsLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // --- Favorite status ---
  useEffect(() => {
    if (!isAuthed || !id) {
      setIsFav(false);
      return;
    }
    let active = true;
    if (!id) {
      setIsFav(false);
      return;
    }
    favoriteService
      .isFavorite(session.uid, id)
      .then((v) => { if (active) setIsFav(v); })
      .catch(() => { if (active) setIsFav(false); });
    return () => { active = false; };
  }, [id, isAuthed, session?.uid]);

  const handleToggleFavorite = async () => {
    if (!isAuthed) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!id || !session) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await favoriteService.removeFavorite(session.uid, id);
        setIsFav(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteService.addFavorite(session.uid, id);
        setIsFav(true);
        toast.success('Added to favorites');
      }
    } catch (err) {
      toast.error((err as Error).message || 'Could not update favorite');
    } finally {
      setFavLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant?.name ?? 'DineConnect',
          text: restaurant?.tagline ?? 'Check out this restaurant',
          url,
        });
      } catch {
        // user cancelled — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Could not copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!restaurant) return <Navigate to="/restaurants" replace />;

  const r = restaurant;
  const filteredMenu = r.menu.filter((m) => m.category === activeCategory);
  const timeSlots = buildTimeSlots(r.hours);
  const openNow = isOpenNow(r.hours);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Hero */}
      <section className="relative h-[420px] overflow-hidden">
        <img
          src={r.imageUrl}
          alt={r.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <Link
          to="/restaurants"
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur text-gray-900 dark:text-white font-medium text-sm hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-lg z-10"
        >
          <ArrowLeft size={16} /> All restaurants
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute top-6 right-6 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur text-gray-900 dark:text-white hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-lg z-10"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

                <div className="absolute top-20 right-6 z-10 rounded-xl bg-white/90 p-1 shadow-lg backdrop-blur dark:bg-slate-900/90">
          <PublicAccountControls />
        </div>

        <button
          onClick={handleToggleFavorite}

          disabled={favLoading}
          className="absolute top-6 right-20 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-lg disabled:opacity-50"
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            className={isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-700 dark:text-gray-200'}
          />
        </button>
        <button
          onClick={handleShare}
          className="absolute top-6 right-36 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-lg"
          aria-label="Share this restaurant"
          title="Share"
        >
          <Share2 size={18} />
        </button>

        <div className="relative max-w-7xl mx-auto px-6 pb-10 w-full h-full flex items-end">
          <div className="flex items-end gap-6">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border-2 border-white/20">
              <img
                src={r.imageUrl}
                alt={r.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur ${
                    openNow ? 'bg-emerald-500/90' : 'bg-gray-900/80'
                  }`}
                >
                  {openNow ? '● Open Now' : '● Closed'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
                  {r.cuisine}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
                  {r.priceRange}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 drop-shadow-lg">
                {r.name}
              </h1>
              <p className="text-lg text-white/90 max-w-2xl drop-shadow">{r.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats bar */}
      <section className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star size={18} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-900 dark:text-white">{r.rating}</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">({r.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <MapPin size={16} /> {r.address}, {r.city}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <Phone size={16} /> {r.phone}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <Clock size={16} /> {r.hours}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">About</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{r.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {r.features.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-100 dark:border-indigo-800"
                >
                  <Check size={14} /> {f}
                </span>
              ))}
            </div>
          </section>

          {/* Gallery */}
          {r.galleryImages && r.galleryImages.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gallery</h2>
              <div className="rounded-2xl overflow-hidden mb-3 h-80 bg-gray-100 dark:bg-slate-800 shadow-lg">
                <img
                  src={r.galleryImages[activeImage]}
                  alt={`${r.name} gallery ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {r.galleryImages.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {r.galleryImages.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 transition-all ${
                        activeImage === i
                          ? 'ring-4 ring-indigo-500 scale-95'
                          : 'hover:scale-95 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={g}
                        alt={`${r.name} gallery thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Menu */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Menu</h2>
            {r.menu.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                The restaurant hasn't published its menu yet.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-slate-800">
                  {menuCategories
                    .filter((cat) => r.menu.some((m) => m.category === cat))
                    .map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
                          activeCategory === cat
                            ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                </div>
                <div className="space-y-3">
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-800">
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-slate-800" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">{item.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                        </div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg flex-shrink-0">
                          ${item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredMenu.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No items in this category yet.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
              <button
                onClick={() => {
                  if (!isAuthed) {
                    navigate('/login', { state: { from: location.pathname } });
                    return;
                  }
                  setShowReviewForm(true);
                }}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                {isAuthed ? 'Write a review →' : 'Sign in to write a review →'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 mb-6">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    {reviews.length > 0 ? r.rating : '—'}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={
                          s <= Math.round(r.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-slate-600'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
                {reviews.length > 0 && (
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter((rv) => Math.round(rv.rating) === stars).length;
                      const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-gray-600 dark:text-gray-300 font-medium">{stars}</span>
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-white/60 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-10 text-right text-gray-600 dark:text-gray-300">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {reviewsLoading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> Loading reviews…
                </p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No reviews yet — {isAuthed ? 'be the first to write one.' : 'sign in to leave the first one.'}
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${review.avatarColor || 'bg-indigo-500'}`}
                      >
                        {(review.author || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{review.author}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatReviewDate(review.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={
                                s <= review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300 dark:text-slate-600'
                              }
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right rail — booking */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-lg p-6">
              {reserved ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Table reserved!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {partySize} {partySize === 1 ? 'guest' : 'guests'} on {date} at {time}. View it any time in My Reservations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to="/reservations"
                      className="flex-1 text-sm font-semibold text-center text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
                    >
                      My reservations
                    </Link>
                    <button
                      onClick={() => setReserved(false)}
                      className="flex-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      Make another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reserve a table</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    {isAuthed ? 'Instant confirmation · No booking fees' : 'Sign in to book a table'}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        min={todayISO()}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Time
                        </label>
                        <select
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Guests
                        </label>
                        <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setPartySize(Math.max(1, partySize - 1))}
                            className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
                            type="button"
                            aria-label="Decrease party size"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center text-sm font-semibold flex items-center justify-center gap-1 text-gray-900 dark:text-white">
                            <Users size={14} className="text-gray-400" />
                            {partySize}
                          </div>
                          <button
                            onClick={() => setPartySize(Math.min(Math.max(r.capacity, 1), partySize + 1))}
                            className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
                            type="button"
                            aria-label="Increase party size"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {isAuthed ? (
                      <button
                        onClick={async () => {
                          if (!session) return;
                          setReservationError('');
                          if (date < todayISO()) {
                            setReservationError('Pick a date in the future.');
                            return;
                          }
                          try {
                            await reservationService.createReservation(r.id, session.username, partySize, date, time);
                            setReserved(true);
                            toast.success('Reservation confirmed');
                          } catch (err) {
                            const msg = (err as Error).message || 'Could not create reservation. Please try again.';
                            setReservationError(msg);
                            toast.error(msg);
                          }
                        }}
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
                      >
                        Confirm reservation
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        state={{ from: location.pathname }}
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 inline-flex items-center justify-center gap-2"
                      >
                        <LogIn size={16} /> Sign in to reserve
                      </Link>
                    )}
                    {reservationError && (
                      <p className="text-xs text-center text-red-500 mt-2" role="alert">
                        {reservationError}
                      </p>
                    )}
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Free cancellation up to 2 hours before
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Quick info</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Cuisine</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{r.cuisine}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Price range</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{r.priceRange}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Capacity</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{r.capacity} guests</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{r.phone}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Write a review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-900 dark:text-white text-sm"
                placeholder="Your name"
                maxLength={80}
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormRating(s)}
                    aria-label={`${s} star${s === 1 ? '' : 's'}`}
                    className="p-0.5"
                  >
                    <Star
                      size={20}
                      className={s <= formRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-slate-600'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-900 dark:text-white text-sm resize-none"
              placeholder="What did you think?"
              rows={4}
              maxLength={1000}
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={async () => {
                  if (!formAuthor.trim() || formRating === 0) return;
                  setSubmitting(true);
                  try {
                    await reviewService.addReview(r.id, {
                      author: formAuthor.trim(),
                      rating: formRating,
                      comment: formComment.trim(),
                      avatarColor: avatarColorFor(formAuthor.trim()),
                    });
                    setFormAuthor(auth.getSession()?.username || '');
                    setFormRating(0);
                    setFormComment('');
                    setShowReviewForm(false);
                    toast.success('Review posted — thank you!');
                  } catch (e: any) {
                    toast.error(e.message || 'Could not submit review.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting || !formAuthor.trim() || formRating === 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
