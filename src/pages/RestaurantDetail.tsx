import { useMemo, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Star,
  Users,
  Calendar,
  Heart,
  Share2,
  Check,
} from 'lucide-react';
import { restaurants } from '../data/restaurants';

const menuCategories = ['Starters', 'Mains', 'Desserts', 'Drinks'] as const;
type MenuCategory = (typeof menuCategories)[number];

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const restaurant = useMemo(() => restaurants.find((r) => r.id === id), [id]);
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

  if (!restaurant) return <Navigate to="/restaurants" replace />;

  const r = restaurant;
  const filteredMenu = r.menu.filter((m) => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section
        className="relative h-[420px] flex items-end overflow-hidden"
        style={{ background: r.heroImage }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <Link
          to="/restaurants"
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur text-gray-900 font-medium text-sm hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft size={16} /> All restaurants
        </Link>

        <button
          className="absolute top-6 right-6 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 backdrop-blur text-gray-900 hover:bg-white transition-colors shadow-lg"
          aria-label="Save to favorites"
        >
          <Heart size={18} />
        </button>
        <button
          className="absolute top-6 right-20 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 backdrop-blur text-gray-900 hover:bg-white transition-colors shadow-lg"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>

        <div className="relative max-w-7xl mx-auto px-6 pb-10 w-full">
          <div className="flex items-end gap-6">
            <div
              className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0"
              style={{ background: r.heroImage }}
            >
              <span className="text-6xl">{r.coverEmoji}</span>
            </div>
            <div className="text-white min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur ${
                    r.openNow
                      ? 'bg-emerald-500/90'
                      : 'bg-gray-900/80'
                  }`}
                >
                  {r.openNow ? '● Open Now' : '● Closed'}
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
      <section className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star size={18} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-900">{r.rating}</span>
              </div>
              <span className="text-gray-500">({r.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin size={16} /> {r.address}, {r.city}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone size={16} /> {r.phone}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{r.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {r.features.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100"
                >
                  <Check size={14} /> {f}
                </span>
              ))}
            </div>
          </section>

          {/* Gallery */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
            <div
              className="rounded-2xl overflow-hidden mb-3 h-80 flex items-center justify-center shadow-lg"
              style={{ background: r.gallery[activeImage] }}
            >
              <span className="text-9xl drop-shadow-2xl">{r.coverEmoji}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {r.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-24 rounded-xl overflow-hidden flex items-center justify-center transition-all ${
                    activeImage === i
                      ? 'ring-4 ring-indigo-500 scale-95'
                      : 'hover:scale-95 opacity-80 hover:opacity-100'
                  }`}
                  style={{ background: g }}
                >
                  <span className="text-4xl">{r.coverEmoji}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Menu */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu</h2>
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
              {menuCategories
                .filter((cat) => r.menu.some((m) => m.category === cat))
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
                      activeCategory === cat
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 border-transparent hover:text-gray-900'
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
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <span className="font-bold text-indigo-600 text-lg flex-shrink-0">
                      ${item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Write a review →
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-6">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-5xl font-extrabold text-gray-900">{r.rating}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={
                          s <= Math.round(r.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = stars === 5 ? 78 : stars === 4 ? 15 : stars === 3 ? 5 : stars === 2 ? 1 : 1;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-4 text-gray-600 font-medium">{stars}</span>
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-gray-600">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {r.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${review.avatarColor}`}
                    >
                      {review.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{review.author}</h4>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={
                              s <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right rail — booking */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              {reserved ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Table reserved!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {partySize} guests on {date} at {time}. We&apos;ve sent a confirmation to your email.
                  </p>
                  <button
                    onClick={() => setReserved(false)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Make another reservation
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={18} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">Reserve a table</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-5">
                    Instant confirmation · No booking fees
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Time
                        </label>
                        <select
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                        >
                          {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Guests
                        </label>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setPartySize(Math.max(1, partySize - 1))}
                            className="px-3 py-2.5 hover:bg-gray-50 text-gray-600"
                            type="button"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center text-sm font-semibold flex items-center justify-center gap-1">
                            <Users size={14} className="text-gray-400" />
                            {partySize}
                          </div>
                          <button
                            onClick={() => setPartySize(Math.min(r.capacity, partySize + 1))}
                            className="px-3 py-2.5 hover:bg-gray-50 text-gray-600"
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setReserved(true)}
                      className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200"
                    >
                      Confirm reservation
                    </button>
                    <p className="text-xs text-center text-gray-500">
                      Free cancellation up to 2 hours before
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-3">Quick info</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cuisine</dt>
                  <dd className="font-medium text-gray-900">{r.cuisine}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Price range</dt>
                  <dd className="font-medium text-gray-900">{r.priceRange}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Capacity</dt>
                  <dd className="font-medium text-gray-900">{r.capacity} guests</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="font-medium text-gray-900">{r.phone}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
