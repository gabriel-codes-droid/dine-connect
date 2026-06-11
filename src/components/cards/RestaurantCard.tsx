import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, ShoppingBag, Calendar } from 'lucide-react';
import type { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'default' | 'compact';
}

export default function RestaurantCard({ restaurant, variant = 'default' }: RestaurantCardProps) {
  return (
    <div className="card-base overflow-hidden group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <img
          src={restaurant.logo}
          alt=""
          className="absolute bottom-3 left-3 w-12 h-12 rounded-xl border-2 border-white shadow-lg object-cover"
        />
        {restaurant.isNew && (
          <span className="absolute top-3 right-3 badge bg-primary text-white">New</span>
        )}
        {restaurant.isTrending && !restaurant.isNew && (
          <span className="absolute top-3 right-3 badge bg-warning text-white">Trending</span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-text-main dark:text-dark-text text-lg">{restaurant.name}</h3>
            <p className="text-sm text-text-muted dark:text-dark-muted">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
            <Star size={14} className="text-warning fill-warning" />
            <span className="text-sm font-semibold text-text-main dark:text-dark-text">{restaurant.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-text-muted dark:text-dark-muted mb-4">
          <span className="flex items-center gap-1"><MapPin size={12} />{restaurant.distance}</span>
          <span className="flex items-center gap-1"><Clock size={12} />{restaurant.deliveryTime}</span>
          <span className="flex items-center gap-1"><ShoppingBag size={12} />{restaurant.completedOrders.toLocaleString()} orders</span>
        </div>

        {variant === 'default' && (
          <div className="flex gap-2">
            <Link
              to={`/customer/restaurants/${restaurant.slug}`}
              className="flex-1 btn-secondary text-sm py-2.5 text-center"
            >
              View Restaurant
            </Link>
            <button type="button" className="flex-1 btn-primary text-sm py-2.5">
              <Calendar size={16} />
              Reserve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
