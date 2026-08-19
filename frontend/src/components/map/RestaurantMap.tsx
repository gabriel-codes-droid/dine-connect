import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Restaurant } from '../../data/restaurants';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RestaurantMapProps {
  restaurants: Restaurant[];
  userLocation?: { lat: number; lng: number } | null;
  onRestaurantClick?: (restaurant: Restaurant) => void;
}

export default function RestaurantMap({ restaurants, userLocation, onRestaurantClick }: RestaurantMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  // Center map on user location or first restaurant
  const center = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : restaurants.length > 0 && restaurants[0].latitude && restaurants[0].longitude
    ? [restaurants[0].latitude, restaurants[0].longitude]
    : [40.7128, -74.0060]; // Default to NYC

  // Fit bounds when restaurants or user location changes
  useEffect(() => {
    if (map) {
      const bounds = L.latLngBounds(
        restaurants
          .filter(r => r.latitude && r.longitude)
          .map(r => [r.latitude!, r.longitude!])
      );
      
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, restaurants, userLocation]);

  return (
    <MapContainer
      center={center as L.LatLngExpression}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      
      {/* Restaurant markers */}
      {restaurants
        .filter(r => r.latitude && r.longitude)
        .map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude!, restaurant.longitude!]}
            eventHandlers={{
              click: () => onRestaurantClick?.(restaurant),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                <p className="text-sm text-gray-600">{restaurant.address}</p>
                <p className="text-sm font-semibold mt-2">
                  Rating: {restaurant.rating} ⭐
                </p>
                <p className="text-sm">{restaurant.priceRange}</p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
