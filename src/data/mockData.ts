import type { ChartDataPoint, LeaderboardEntry, Order, Reservation, Restaurant } from '../types';

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=800&h=600&fit=crop&auto=format`;

const logo = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=100&h=100&fit=crop&auto=format`;

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Slate & Fork',
    slug: 'slate-and-fork',
    cuisine: 'Modern American',
    rating: 4.9,
    reviewCount: 1248,
    distance: '0.8 mi',
    deliveryTime: '25-35 min',
    completedOrders: 15420,
    coverImage: img('1414235077428-338989a2e8c0'),
    logo: logo('1555396273-367ea4eb4db5'),
    address: '142 Market Street, San Francisco, CA',
    phone: '+1 (415) 555-0142',
    email: 'hello@slateandfork.com',
    openingHours: 'Mon–Sun: 11:00 AM – 11:00 PM',
    description: 'Elevated dining with locally sourced ingredients and a curated wine selection.',
    isTrending: true,
    isNearby: true,
    revenueGrowth: 34,
    reservationGrowth: 28,
    menu: [
      {
        id: 'm1',
        name: 'Starters',
        items: [
          { id: 'i1', name: 'Truffle Arancini', description: 'Crispy risotto balls with black truffle', price: 16, image: img('1544025162-d76694265947'), popular: true },
          { id: 'i2', name: 'Burrata Caprese', description: 'Fresh burrata, heirloom tomatoes, basil oil', price: 18, image: img('1608897012096-3f55d1fd593c') },
        ],
      },
      {
        id: 'm2',
        name: 'Mains',
        items: [
          { id: 'i3', name: 'Wagyu Ribeye', description: '12oz prime cut, bone marrow butter', price: 68, image: img('1546833999-b9f581a1996d'), popular: true },
          { id: 'i4', name: 'Pan-Seared Salmon', description: 'Lemon beurre blanc, asparagus', price: 38, image: img('1467003909585-2f8a72700288') },
        ],
      },
    ],
    reviews: [
      { id: 'r1', author: 'Emily Chen', avatar: 'EC', rating: 5, comment: 'Absolutely phenomenal. The wagyu was cooked to perfection.', date: '2 days ago' },
      { id: 'r2', author: 'Marcus Webb', avatar: 'MW', rating: 5, comment: 'Best dining experience in the city. Service was impeccable.', date: '1 week ago' },
    ],
    gallery: [img('1414235077428-338989a2e8c0'), img('1517248135467-4c7edcad34c4'), img('1559339352-11d035aa65de')],
  },
  {
    id: '2',
    name: 'The Golden Fork',
    slug: 'the-golden-fork',
    cuisine: 'Italian',
    rating: 4.8,
    reviewCount: 892,
    distance: '1.2 mi',
    deliveryTime: '30-40 min',
    completedOrders: 12850,
    coverImage: img('1555396273-367ea4eb4db5'),
    logo: logo('1565299624946-b28f40a0ae38'),
    address: '88 Columbus Ave, San Francisco, CA',
    phone: '+1 (415) 555-0188',
    email: 'info@goldenfork.com',
    openingHours: 'Tue–Sun: 12:00 PM – 10:00 PM',
    description: 'Authentic Italian cuisine with handmade pasta and wood-fired pizzas.',
    isTrending: true,
    isNearby: true,
    revenueGrowth: 28,
    reservationGrowth: 22,
    menu: [
      {
        id: 'm1',
        name: 'Pasta',
        items: [
          { id: 'i1', name: 'Truffle Pasta', description: 'Fresh fettuccine, black truffle cream', price: 28, image: img('1621996346565-e3dbc646d9a9'), popular: true },
          { id: 'i2', name: 'Carbonara', description: 'Guanciale, pecorino, egg yolk', price: 24, image: img('1612874747220-4e4c4c4c4c4c') },
        ],
      },
    ],
    reviews: [
      { id: 'r1', author: 'Sofia Rossi', avatar: 'SR', rating: 5, comment: 'The truffle pasta is divine!', date: '3 days ago' },
    ],
    gallery: [img('1555396273-367ea4eb4db5'), img('1565299624946-b28f40a0ae38')],
  },
  {
    id: '3',
    name: 'Taste of Asia',
    slug: 'taste-of-asia',
    cuisine: 'Asian Fusion',
    rating: 4.7,
    reviewCount: 654,
    distance: '2.1 mi',
    deliveryTime: '35-45 min',
    completedOrders: 9870,
    coverImage: img('1559339352-11d035aa65de'),
    logo: logo('1585034270456-bc04b1f14a8b'),
    address: '220 Geary Blvd, San Francisco, CA',
    phone: '+1 (415) 555-0220',
    email: 'contact@tasteofasia.com',
    openingHours: 'Daily: 11:30 AM – 10:30 PM',
    description: 'A fusion of Japanese, Thai, and Korean flavors in a modern setting.',
    isNew: true,
    revenueGrowth: 45,
    reservationGrowth: 38,
    menu: [
      {
        id: 'm1',
        name: 'Signature',
        items: [
          { id: 'i1', name: 'Dragon Roll', description: 'Eel, avocado, spicy mayo', price: 22, image: img('1579584425555-c3ce17fd4351'), popular: true },
        ],
      },
    ],
    reviews: [],
    gallery: [img('1559339352-11d035aa65de')],
  },
  {
    id: '4',
    name: 'Urban Bistro',
    slug: 'urban-bistro',
    cuisine: 'French',
    rating: 4.6,
    reviewCount: 521,
    distance: '1.5 mi',
    deliveryTime: '28-38 min',
    completedOrders: 8420,
    coverImage: img('1517248135467-4c7edcad34c4'),
    logo: logo('1550965293-4ba9cda1f69d'),
    address: '55 Hayes St, San Francisco, CA',
    phone: '+1 (415) 555-0055',
    email: 'bonjour@urbanbistro.com',
    openingHours: 'Wed–Mon: 5:00 PM – 11:00 PM',
    description: 'Classic French bistro fare with a California twist.',
    isNearby: true,
    revenueGrowth: 18,
    reservationGrowth: 15,
    menu: [],
    reviews: [],
    gallery: [],
  },
  {
    id: '5',
    name: 'Pizza Paradise',
    slug: 'pizza-paradise',
    cuisine: 'Pizza',
    rating: 4.5,
    reviewCount: 1102,
    distance: '0.5 mi',
    deliveryTime: '20-30 min',
    completedOrders: 18200,
    coverImage: img('1565299624946-b28f40a0ae38'),
    logo: logo('1574071318508-1cdbab1ae783'),
    address: '12 Valencia St, San Francisco, CA',
    phone: '+1 (415) 555-0012',
    email: 'orders@pizzaparadise.com',
    openingHours: 'Daily: 11:00 AM – 12:00 AM',
    description: 'Neapolitan-style wood-fired pizzas made with imported ingredients.',
    isTrending: true,
    isNew: true,
    revenueGrowth: 52,
    reservationGrowth: 12,
    menu: [],
    reviews: [],
    gallery: [],
  },
  {
    id: '6',
    name: 'Seafood Delights',
    slug: 'seafood-delights',
    cuisine: 'Seafood',
    rating: 4.9,
    reviewCount: 743,
    distance: '3.0 mi',
    deliveryTime: '40-50 min',
    completedOrders: 7650,
    coverImage: img('1559339352-11d035aa65de'),
    logo: logo('1559843772-2199d1f3b9a2'),
    address: '300 Embarcadero, San Francisco, CA',
    phone: '+1 (415) 555-0300',
    email: 'fresh@seafooddelights.com',
    openingHours: 'Tue–Sat: 4:00 PM – 10:00 PM',
    description: 'Fresh catch daily, sustainably sourced from local fishermen.',
    revenueGrowth: 22,
    reservationGrowth: 30,
    menu: [],
    reviews: [],
    gallery: [],
  },
];

export const recentOrders: Order[] = [
  { id: '1', restaurantId: '1', restaurantName: 'Slate & Fork', items: 'Wagyu Ribeye, Truffle Arancini', total: '$84.00', status: 'Delivered', date: '2 hours ago' },
  { id: '2', restaurantId: '2', restaurantName: 'The Golden Fork', items: 'Truffle Pasta, Tiramisu', total: '$42.50', status: 'In Progress', date: 'Today' },
  { id: '3', restaurantId: '5', restaurantName: 'Pizza Paradise', items: 'Margherita x2, Garlic Bread', total: '$28.00', status: 'Delivered', date: 'Yesterday' },
];

export const upcomingReservations: Reservation[] = [
  { id: '1', restaurantId: '1', restaurantName: 'Slate & Fork', date: 'Jun 14, 2026', time: '7:30 PM', guests: 4, status: 'Confirmed' },
  { id: '2', restaurantId: '3', restaurantName: 'Taste of Asia', date: 'Jun 18, 2026', time: '6:00 PM', guests: 2, status: 'Pending' },
];

export const monthlyOrders: ChartDataPoint[] = [
  { name: 'Jan', value: 12, orders: 12 },
  { name: 'Feb', value: 18, orders: 18 },
  { name: 'Mar', value: 15, orders: 15 },
  { name: 'Apr', value: 22, orders: 22 },
  { name: 'May', value: 28, orders: 28 },
  { name: 'Jun', value: 24, orders: 24 },
];

export const monthlyReservations: ChartDataPoint[] = [
  { name: 'Jan', value: 3, reservations: 3 },
  { name: 'Feb', value: 5, reservations: 5 },
  { name: 'Mar', value: 4, reservations: 4 },
  { name: 'Apr', value: 7, reservations: 7 },
  { name: 'May', value: 8, reservations: 8 },
  { name: 'Jun', value: 6, reservations: 6 },
];

export const platformRevenue: ChartDataPoint[] = [
  { name: 'Jan', value: 42000, revenue: 42000 },
  { name: 'Feb', value: 48000, revenue: 48000 },
  { name: 'Mar', value: 52000, revenue: 52000 },
  { name: 'Apr', value: 61000, revenue: 61000 },
  { name: 'May', value: 72000, revenue: 72000 },
  { name: 'Jun', value: 85000, revenue: 85000 },
];

export const platformOrders: ChartDataPoint[] = [
  { name: 'Jan', value: 8420, orders: 8420 },
  { name: 'Feb', value: 9100, orders: 9100 },
  { name: 'Mar', value: 9800, orders: 9800 },
  { name: 'Apr', value: 11200, orders: 11200 },
  { name: 'May', value: 12800, orders: 12800 },
  { name: 'Jun', value: 15420, orders: 15420 },
];

export const cuisinePopularity: ChartDataPoint[] = [
  { name: 'Italian', value: 28 },
  { name: 'American', value: 22 },
  { name: 'Asian', value: 18 },
  { name: 'French', value: 14 },
  { name: 'Seafood', value: 10 },
  { name: 'Pizza', value: 8 },
];

export function getLeaderboard(): LeaderboardEntry[] {
  return [...restaurants]
    .sort((a, b) => {
      const scoreA = a.completedOrders * 0.3 + (a.revenueGrowth ?? 0) * 0.3 + a.rating * 20 + (a.reservationGrowth ?? 0) * 0.2;
      const scoreB = b.completedOrders * 0.3 + (b.revenueGrowth ?? 0) * 0.3 + b.rating * 20 + (b.reservationGrowth ?? 0) * 0.2;
      return scoreB - scoreA;
    })
    .slice(0, 3)
    .map((restaurant, i) => ({
      rank: i + 1,
      restaurant,
      score: Math.round(restaurant.completedOrders * 0.001 + (restaurant.revenueGrowth ?? 0) + restaurant.rating * 10),
      orders: restaurant.completedOrders,
      revenueGrowth: restaurant.revenueGrowth ?? 0,
      rating: restaurant.rating,
    }));
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return restaurants.find((r) => r.slug === slug);
}

export const cuisines = ['All', 'Italian', 'American', 'Asian Fusion', 'French', 'Pizza', 'Seafood', 'Modern American'];
