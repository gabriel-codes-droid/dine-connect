import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Loader2,
  MapPin,
  Star,
  Clock,
  Filter,
  Sparkles,
  ChevronRight,
  Utensils,
  ArrowLeft,
  Sun,
  Moon,
  Navigation,
  X,
  Map,
  Grid,
} from 'lucide-react';
import {
  cuisines,
  priceRanges,
  type Cuisine,
  type PriceRange,
  type Restaurant,
} from '../data/restaurants';
import { restaurantService } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import RestaurantMap from '../components/map/RestaurantMap';

const accentMap: Record<string, { ring: string; chip: string; glow: string }> = {
  amber: { ring: 'ring-amber-200 dark:ring-amber-800', chip: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800', glow: 'shadow-amber-100 dark:shadow-amber-900/20' },
  red: { ring: 'ring-red-200 dark:ring-red-800', chip: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800', glow: 'shadow-red-100 dark:shadow-red-900/20' },
  orange: { ring: 'ring-orange-200 dark:ring-orange-800', chip: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800', glow: 'shadow-orange-100 dark:shadow-orange-900/20' },
  teal: { ring: 'ring-teal-200 dark:ring-teal-800', chip: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800', glow: 'shadow-teal-100 dark:shadow-teal-900/20' },
  sky: { ring: 'ring-sky-200 dark:ring-sky-800', chip: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800', glow: 'shadow-sky-100 dark:shadow-sky-900/20' },
  green: { ring: 'ring-emerald-200 dark:ring-emerald-800', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800', glow: 'shadow-emerald-100 dark:shadow-emerald-900/20' },
  purple: { ring: 'ring-purple-200 dark:ring-purple-800', chip: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800', glow: 'shadow-purple-100 dark:shadow-purple-900/20' },
  blue: { ring: 'ring-blue-200 dark:ring-blue-800', chip: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800', glow: 'shadow-blue-100 dark:shadow-blue-900/20' },
};

function RestaurantCard({ restaurant, distance }: { restaurant: Restaurant; distance?: number }) {
  const r = restaurant;
  const accent = accentMap[r.accent] ?? accentMap.amber;

  return (
    <Link
      to={`/restaurants/${r.id}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {r.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">{r.rating}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({r.reviewCount})</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{r.tagline}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${accent.chip}`}>
            {r.cuisine}
          </span>
          {r.features.slice(0, 2).map((f) => (
            <span
              key={f}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
            >
              {f}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{r.city}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Clock size={12} />
            <span>{distance !== undefined ? `${distance.toFixed(1)} mi` : '25 min'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Restaurants() {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<'All' | Cuisine>('All');
  const [price, setPrice] = useState<'Any' | PriceRange>('Any');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // Timeout after 8s so the page doesn't spin forever if Firebase hangs
    const timeout = setTimeout(() => {
      if (active) {
        setLoading(false);
        setError('Loading timed out. Check your Firebase config in .env');
      }
    }, 8000);
    restaurantService
      .getAllRestaurants()
      .then((data) => {
        if (active) setRestaurants(data);
      })
      .catch((err) => {
        console.error('Failed to load restaurants:', err);
        if (active) setError('Failed to load restaurants. Check Firebase config.');
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setUseLocation(true);
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enable location services.');
        console.error('Geolocation error:', error);
      }
    );
  };

  const clearLocation = () => {
    setUserLocation(null);
    setUseLocation(false);
    setLocationError(null);
  };

  const filtered = useMemo(() => {
    let results = restaurants.filter((r) => {
      const q = query.trim().toLowerCase();
      // Enhanced search: search name, cuisine, city, tagline, features, address
      const searchableText = `${r.name} ${r.cuisine} ${r.city} ${r.tagline} ${r.features.join(' ')} ${r.address}`.toLowerCase();
      if (q && !searchableText.includes(q)) return false;
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (price !== 'Any' && r.priceRange !== price) return false;
      if (showOpenOnly && !r.openNow) return false;
      return true;
    });

    // Sort by distance if location is enabled
    if (useLocation && userLocation) {
      results = results
        .filter(r => r.latitude && r.longitude)
        .map(r => ({
          ...r,
          distance: calculateDistance(userLocation.lat, userLocation.lng, r.latitude!, r.longitude!)
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    return results;
  }, [query, cuisine, price, showOpenOnly, useLocation, userLocation, restaurants]);

  const featured = restaurants.filter((r) => r.featured).slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Back button */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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

          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-2 flex items-center gap-2 mx-4">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={18} className="text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, features, address…"
                className="w-full py-2.5 sm:py-3 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors text-sm">
              <Utensils size={16} /> Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured carousel-ish row */}
      {!useLocation && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {featured.map((r) => {
              const accent = accentMap[r.accent] ?? accentMap.amber;
              return (
                <Link
                  key={r.id}
                  to={`/restaurants/${r.id}`}
                  className={`group relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all border border-transparent dark:border-slate-800 ${accent.glow}`}
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
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                          Featured
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm sm:text-base">
                        {r.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{r.tagline}</p>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <strong className="text-gray-900 dark:text-white">{r.rating}</strong>
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
      )}

      {/* Filters + grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
              {useLocation ? 'Restaurants Near You' : 'All restaurants'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              {filtered.length} {useLocation ? 'restaurants nearby' : 'places to explore'}
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
              title="Grid view"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
              title="Map view"
            >
              <Map size={20} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
              <Filter size={14} /> Filters
            </span>

            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value as 'All' | Cuisine)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {priceRanges.map((p) => (
                <option key={p} value={p}>
                  {p === 'Any' ? 'Any price' : `Price ${p}`}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
              />
              Open now
            </label>

            {/* Geolocation button */}
            {!useLocation ? (
              <button
                onClick={getUserLocation}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                title="Find restaurants near me"
              >
                <Navigation size={14} />
                Near Me
              </button>
            ) : (
              <button
                onClick={clearLocation}
                className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                title="Clear location filter"
              >
                <X size={14} />
                Clear Location
              </button>
            )}
          </div>

          {/* Location error message */}
          {locationError && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 text-sm text-red-700 dark:text-red-300">
              {locationError}
            </div>
          )}

          {/* Location status */}
          {useLocation && userLocation && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 text-sm text-green-700 dark:text-green-300">
              Showing restaurants sorted by distance from your location
            </div>
          )}
        </div>

        {/* Cuisine quick-chips */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={`px-3 py-1.5 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
                cuisine === c
                  ? 'bg-gray-900 dark:bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid or Map View */}
        {filtered.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((r) => (
                  <RestaurantCard 
                    key={r.id} 
                    restaurant={r} 
                    distance={useLocation && userLocation && r.latitude && r.longitude ? 
                      calculateDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude) : 
                      undefined
                    } 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                <RestaurantMap 
                  restaurants={filtered} 
                  userLocation={userLocation}
                  onRestaurantClick={(restaurant) => {
                    // Navigate to restaurant detail page
                    window.location.href = `/restaurants/${restaurant.id}`;
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No restaurants found matching your criteria.</p>
            <button
              onClick={() => {
                setQuery('');
                setCuisine('All');
                setPrice('Any');
                setShowOpenOnly(false);
                setUseLocation(false);
                setUserLocation(null);
              }}
              className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-[#202522] dark:bg-[#111512] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            Own a restaurant?
          </h2>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Join DineConnect to manage reservations, orders, and your reputation —
            all in one place.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary dark:bg-primary text-white font-semibold px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 rounded-md hover:bg-[#8F462E] transition-colors shadow-card text-sm sm:text-base"
          >
            Get started free <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
