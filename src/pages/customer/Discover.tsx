import { useState, useMemo } from 'react';
import { Search, MapPin, Star, SlidersHorizontal } from 'lucide-react';
import RestaurantCard from '../../components/cards/RestaurantCard';
import LeaderboardCard from '../../components/cards/LeaderboardCard';
import { restaurants, cuisines, getLeaderboard } from '../../data/mockData';

export default function Discover() {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState('All');

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
      const matchCuisine = cuisine === 'All' || r.cuisine.includes(cuisine);
      const matchRating = r.rating >= minRating;
      const matchLocation = location === 'All' || (location === 'Nearby' && r.isNearby);
      return matchSearch && matchCuisine && matchRating && matchLocation;
    });
  }, [search, cuisine, minRating, location]);

  const nearby = restaurants.filter((r) => r.isNearby);
  const trending = restaurants.filter((r) => r.isTrending);
  const newest = restaurants.filter((r) => r.isNew);
  const leaderboard = getLeaderboard();

  return (
    <div className="page-container">
      <div>
        <h2 className="section-title">Discover Restaurants</h2>
        <p className="section-subtitle">Find your next favorite dining experience.</p>
      </div>

      <div className="card-base p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCuisine(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cuisine === c ? 'bg-gradient-primary text-white shadow-glass' : 'bg-gray-50 dark:bg-dark-bg text-text-muted dark:text-dark-muted hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-text-muted" />
            <span className="text-sm text-text-muted">Rating:</span>
            {[0, 4, 4.5, 4.8].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMinRating(r)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                  minRating === r ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-dark-bg'
                }`}
              >
                {r === 0 ? 'All' : <><Star size={12} className="fill-warning text-warning" />{r}+</>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-text-muted" />
            <span className="text-sm text-text-muted">Location:</span>
            {['All', 'Nearby'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocation(l)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  location === l ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-dark-bg'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-main dark:text-dark-text mb-4">Top Rising Restaurants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {leaderboard.map((entry) => <LeaderboardCard key={entry.rank} entry={entry} />)}
        </div>
      </div>

      {search || cuisine !== 'All' || minRating > 0 || location !== 'All' ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Search Results ({filtered.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </div>
      ) : (
        <>
          <Section title="Nearby Restaurants" items={nearby} />
          <Section title="Trending Now" items={trending} />
          <Section title="New on DineConnect" items={newest} />
        </>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: typeof restaurants }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-main dark:text-dark-text mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
      </div>
    </div>
  );
}
