import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Filter,
  Sparkles,
  ChevronRight,
  Utensils,
  ArrowLeft,
} from 'lucide-react';
import {
  restaurants,
  cuisines,
  priceRanges,
  type Cuisine,
  type PriceRange,
} from '../data/restaurants';

const accentMap: Record<string, { ring: string; chip: string; glow: string }> = {
  amber: { ring: 'ring-amber-200', chip: 'bg-amber-50 text-amber-700 border-amber-200', glow: 'shadow-amber-100' },
  red: { ring: 'ring-red-200', chip: 'bg-red-50 text-red-700 border-red-200', glow: 'shadow-red-100' },
  orange: { ring: 'ring-orange-200', chip: 'bg-orange-50 text-orange-700 border-orange-200', glow: 'shadow-orange-100' },
  teal: { ring: 'ring-teal-200', chip: 'bg-teal-50 text-teal-700 border-teal-200', glow: 'shadow-teal-100' },
  sky: { ring: 'ring-sky-200', chip: 'bg-sky-50 text-sky-700 border-sky-200', glow: 'shadow-sky-100' },
  green: { ring: 'ring-emerald-200', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', glow: 'shadow-emerald-100' },
  purple: { ring: 'ring-purple-200', chip: 'bg-purple-50 text-purple-700 border-purple-200', glow: 'shadow-purple-100' },
  blue: { ring: 'ring-blue-200', chip: 'bg-blue-50 text-blue-700 border-blue-200', glow: 'shadow-blue-100' },
};

function RestaurantCard({ id }: { id: string }) {
  const r = restaurants.find((x) => x.id === id)!;
  const accent = accentMap[r.accent] ?? accentMap.amber;

  return (
    <Link
      to={`/restaurants/${r.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={r.imageUrl}
          alt={r.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />

        {r.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-gray-900 shadow-sm">
            <Sparkles size={12} className="text-amber-500" /> Featured
          </span>
        )}

        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur ${
            r.openNow
              ? 'bg-emerald-500/90 text-white'
              : 'bg-gray-900/80 text-white'
          }`}
        >
          {r.openNow ? 'Open Now' : 'Closed'}
        </span>

        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold text-gray-900 shadow-sm">
          {r.priceRange}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {r.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-900">{r.rating}</span>
            <span className="text-xs text-gray-500">({r.reviewCount})</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{r.tagline}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${accent.chip}`}>
            {r.cuisine}
          </span>
          {r.features.slice(0, 2).map((f) => (
            <span
              key={f}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200"
            >
              {f}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{r.city}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Clock size={12} />
            <span>25 min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Restaurants() {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<'All' | Cuisine>('All');
  const [price, setPrice] = useState<'Any' | PriceRange>('Any');
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const q = query.trim().toLowerCase();
      if (q && !`${r.name} ${r.cuisine} ${r.city} ${r.tagline}`.toLowerCase().includes(q)) return false;
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (price !== 'Any' && r.priceRange !== price) return false;
      if (showOpenOnly && !r.openNow) return false;
      return true;
    });
  }, [query, cuisine, price, showOpenOnly]);

  const featured = restaurants.filter((r) => r.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 text-6xl sm:text-7xl md:text-8xl">🍝</div>
          <div className="absolute top-20 right-20 text-5xl sm:text-6xl md:text-7xl">🍣</div>
          <div className="absolute bottom-10 left-1/3 text-5xl sm:text-6xl md:text-7xl">🥐</div>
          <div className="absolute bottom-20 right-1/4 text-6xl sm:text-7xl md:text-8xl">🍷</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-28 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 rounded-full bg-white/15 backdrop-blur text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Sparkles size={14} /> Over 1,200 restaurants · 12 cuisines
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
            Discover your next <span className="italic text-amber-300">favourite</span> table
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4">
            From neighbourhood gems to special-occasion splurges — browse, book, and
            taste your way through the city.
          </p>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2 mx-4">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, neighbourhoods…"
                className="w-full py-2.5 sm:py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors text-sm">
              <Utensils size={16} /> Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured carousel-ish row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10 mb-12 sm:mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {featured.map((r) => {
            const accent = accentMap[r.accent] ?? accentMap.amber;
            return (
              <Link
                key={r.id}
                to={`/restaurants/${r.id}`}
                className={`group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all ${accent.glow}`}
              >
                <div className="flex items-stretch">
                  <div className="relative w-24 sm:w-32 flex-shrink-0 overflow-hidden">
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 sm:p-5 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={12} className="text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Featured
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 text-sm sm:text-base">
                      {r.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-1">{r.tagline}</p>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <strong className="text-gray-900">{r.rating}</strong>
                      </span>
                      <span className="hidden sm:inline">{r.cuisine}</span>
                      <span className="hidden sm:inline">{r.priceRange}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Filters + grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
              All restaurants
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">{filtered.length} places to explore</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 mr-2">
              <Filter size={14} /> Filters
            </span>

            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value as 'All' | Cuisine)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All cuisines' : c}
                </option>
              ))}
            </select>

            <select
              value={price}
              onChange={(e) => setPrice(e.target.value as 'Any' | PriceRange)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {priceRanges.map((p) => (
                <option key={p} value={p}>
                  {p === 'Any' ? 'Any price' : `Price ${p}`}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
              />
              Open now
            </label>
          </div>
        </div>

        {/* Cuisine quick-chips */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={`px-3 py-1.5 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
                cuisine === c
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} id={r.id} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 md:p-16 text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🍽️</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">Try a different cuisine, or clear your filters.</p>
            <button
              onClick={() => {
                setQuery('');
                setCuisine('All');
                setPrice('Any');
                setShowOpenOnly(false);
              }}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Reset filters <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            Own a restaurant?
          </h2>
          <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Join DineConnect to manage reservations, orders, and your reputation —
            all in one place.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-xl text-sm sm:text-base"
          >
            Get started free <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
