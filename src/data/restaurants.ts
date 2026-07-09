export type Cuisine =
  | 'Italian'
  | 'Japanese'
  | 'American'
  | 'Mexican'
  | 'Indian'
  | 'French'
  | 'Chinese'
  | 'Thai'
  | 'Mediterranean'
  | 'Seafood';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Starters' | 'Mains' | 'Desserts' | 'Drinks';
  image?: string;   // optional food photo path
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatarColor: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: Cuisine;
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  phone: string;
  hours: string;
  capacity: number;
  features: string[];
  heroImage: string;       // CSS gradient fallback
  imageUrl: string;        // real restaurant photo (used in cards, hero, thumbnails)
  accent: string;          // tailwind color, e.g. "rose"
  coverEmoji: string;      // small visual stand-in (kept as overlay accent on cards)
  gallery: string[];       // gradient stops for the gallery (fallback)
  galleryImages: string[]; // real photos for gallery carousel
  menu: MenuItem[];
  reviews: Review[];
  featured?: boolean;
  openNow?: boolean;
}

const gradient = (from: string, to: string) =>
  `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;

export const restaurants: Restaurant[] = [
  {
    id: 'golden-fork',
    name: 'The Golden Fork',
    tagline: 'Refined modern European cuisine',
    description:
      'A neighbourhood institution since 2014, The Golden Fork blends classical technique with seasonal ingredients from local farms. Intimate lighting, an award-winning wine list, and a chef’s table experience make it the city’s go-to for special occasions.',
    cuisine: 'French',
    priceRange: '$$$$',
    rating: 4.8,
    reviewCount: 1284,
    address: '218 Maple Street',
    city: 'Downtown',
    phone: '(555) 014-2200',
    hours: 'Tue–Sun · 5:00 PM – 11:00 PM',
    capacity: 64,
    features: ['Wine Pairing', 'Private Dining', 'Chef’s Table', 'Valet'],
    heroImage: gradient('#1f2937', '#b45309'),
    imageUrl: '/images/restaurants/golden-fork.jpg',
    accent: 'amber',
    coverEmoji: '🍷',
    gallery: [gradient('#7c2d12', '#fbbf24'), gradient('#451a03', '#d97706'), gradient('#92400e', '#f59e0b')],
    galleryImages: ['/images/restaurants/golden-fork-g1.jpg', '/images/restaurants/golden-fork-g2.jpg', '/images/restaurants/golden-fork-g3.jpg'],
    featured: true,
    openNow: true,
    menu: [
      { id: 'gf-1', name: 'Beef Tartare', description: 'Hand-cut fillet, quail yolk, toasted brioche', price: 22, category: 'Starters', image: '/images/menu/french-fine.jpg' },
      { id: 'gf-2', name: 'Pan-Seared Foie Gras', description: 'Sauternes gel, fig compote, pain d’épices', price: 28, category: 'Starters', image: '/images/menu/french-fine.jpg' },
      { id: 'gf-3', name: 'Duck Confit', description: 'Slow-cooked leg, lentils du Puy, cherry reduction', price: 42, category: 'Mains', image: '/images/menu/steak-frites.jpg' },
      { id: 'gf-4', name: 'Rack of Lamb', description: 'Herb crust, ratatouille, lamb jus', price: 48, category: 'Mains', image: '/images/menu/steak-frites.jpg' },
      { id: 'gf-5', name: 'Crème Brûlée', description: 'Madagascar vanilla, caramelized sugar', price: 14, category: 'Desserts', image: '/images/menu/tarte-tatin.jpg' },
      { id: 'gf-6', name: 'Sommelier Selection', description: 'Three-glass pairing', price: 65, category: 'Drinks' },
    ],
    reviews: [
      { id: 'gf-r1', author: 'Olivia M.', rating: 5, date: '2 days ago', comment: 'The duck confit was unreal. Service was attentive without being overbearing.', avatarColor: 'bg-rose-500' },
      { id: 'gf-r2', author: 'James K.', rating: 5, date: '1 week ago', comment: 'Best wine list in the city. Period.', avatarColor: 'bg-amber-500' },
      { id: 'gf-r3', author: 'Priya R.', rating: 4, date: '3 weeks ago', comment: 'Lovely date-night spot. Reservations a must.', avatarColor: 'bg-emerald-500' },
    ],
  },
  {
    id: 'urban-bistro',
    name: 'Urban Bistro',
    tagline: 'Casual French-American comfort',
    description:
      'Where Parisian café culture meets Brooklyn cool. All-day brunch, hand-rolled pastas, and a backyard patio that locals fight over on weekends.',
    cuisine: 'French',
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 892,
    address: '94 Lumen Avenue',
    city: 'Riverside',
    phone: '(555) 014-3344',
    hours: 'Daily · 8:00 AM – 10:00 PM',
    capacity: 120,
    features: ['Outdoor Seating', 'Brunch', 'Pet Friendly', 'Wi-Fi'],
    heroImage: gradient('#0f766e', '#fbbf24'),
    imageUrl: '/images/restaurants/urban-bistro.jpg',
    accent: 'teal',
    coverEmoji: '🥐',
    gallery: [gradient('#0f766e', '#fef3c7'), gradient('#134e4a', '#fcd34d'), gradient('#115e59', '#fde68a')],
    galleryImages: ['/images/restaurants/urban-bistro-g1.jpg', '/images/restaurants/urban-bistro-g2.jpg', '/images/restaurants/urban-bistro-g3.jpg'],
    featured: true,
    openNow: true,
    menu: [
      { id: 'ub-1', name: 'Truffle Croque Madame', description: 'Gruyère, mornay, sunny-side egg', price: 16, category: 'Starters', image: '/images/menu/croque.jpg' },
      { id: 'ub-2', name: 'Steak Frites', description: 'Bavette, herb butter, hand-cut fries', price: 26, category: 'Mains', image: '/images/menu/steak-frites.jpg' },
      { id: 'ub-3', name: 'Cacio e Pepe', description: 'Tonnarelli, pecorino, black pepper', price: 22, category: 'Mains', image: '/images/menu/cacio-e-pepe.jpg' },
      { id: 'ub-4', name: 'Buttermilk Pancakes', description: 'Bourbon maple, brown butter', price: 14, category: 'Starters', image: '/images/menu/pancakes.jpg' },
      { id: 'ub-5', name: 'Tarte Tatin', description: 'Caramelized apple, crème fraîche', price: 11, category: 'Desserts', image: '/images/menu/tarte-tatin.jpg' },
    ],
    reviews: [
      { id: 'ub-r1', author: 'Marco D.', rating: 5, date: '4 days ago', comment: 'Croque madame is life-changing. Patio was packed at 11am.', avatarColor: 'bg-teal-500' },
      { id: 'ub-r2', author: 'Elena S.', rating: 4, date: '2 weeks ago', comment: 'Great brunch, slightly slow service. Worth the wait.', avatarColor: 'bg-yellow-500' },
    ],
  },
  {
    id: 'taste-of-asia',
    name: 'Taste of Asia',
    tagline: 'Pan-Asian, modern soul',
    description:
      'A late-night izakaya spirit by day, a sleek dim-sum hall by night. Hand-pulled noodles, robatayaki, and a sake program that punches well above its weight.',
    cuisine: 'Japanese',
    priceRange: '$$$',
    rating: 4.7,
    reviewCount: 1547,
    address: '7 Sakura Plaza',
    city: 'East District',
    phone: '(555) 014-7788',
    hours: 'Daily · 12:00 PM – 1:00 AM',
    capacity: 90,
    features: ['Sake Bar', 'Late Night', 'Vegan Menu', 'Reservations'],
    heroImage: gradient('#7f1d1d', '#dc2626'),
    imageUrl: '/images/restaurants/taste-of-asia.jpg',
    accent: 'red',
    coverEmoji: '🍜',
    gallery: [gradient('#7f1d1d', '#fef2f2'), gradient('#991b1b', '#fca5a5'), gradient('#450a0a', '#ef4444')],
    galleryImages: ['/images/restaurants/taste-of-asia-g1.jpg', '/images/restaurants/taste-of-asia-g2.jpg', '/images/restaurants/taste-of-asia-g3.jpg'],
    featured: true,
    openNow: true,
    menu: [
      { id: 'ta-1', name: 'Tonkotsu Ramen', description: '18-hour pork broth, chashu, ajitama', price: 18, category: 'Mains', image: '/images/menu/ramen.jpg' },
      { id: 'ta-2', name: 'Xiaolongbao', description: 'Pork & crab soup dumplings, ginger vinegar', price: 14, category: 'Starters', image: '/images/menu/dumplings.jpg' },
      { id: 'ta-3', name: 'Wagyu Robatayaki', description: 'A5 striploin, yuzu kosho, sea salt', price: 38, category: 'Mains', image: '/images/menu/wagyu.jpg' },
      { id: 'ta-4', name: 'Mapo Tofu', description: 'Sichuan peppercorn, silken tofu, ground pork', price: 19, category: 'Mains', image: '/images/menu/dumplings.jpg' },
      { id: 'ta-5', name: 'Mochi Ice Cream Trio', description: 'Matcha, black sesame, mango', price: 9, category: 'Desserts', image: '/images/menu/mango-sticky.jpg' },
    ],
    reviews: [
      { id: 'ta-r1', author: 'Hiroshi T.', rating: 5, date: '1 day ago', comment: 'Tonkotsu broth is the real deal. Sake list = chef’s kiss.', avatarColor: 'bg-red-500' },
      { id: 'ta-r2', author: 'Sara N.', rating: 5, date: '5 days ago', comment: 'Took the whole team here. Service was flawless.', avatarColor: 'bg-orange-500' },
    ],
  },
  {
    id: 'pizza-paradise',
    name: 'Pizza Paradise',
    tagline: 'Wood-fired Neapolitan, the way it should be',
    description:
      'A 90-second wood-fired crust imported from Naples, San Marzano tomatoes, and buffalo mozzarella that arrives fresh from Campania every Wednesday.',
    cuisine: 'Italian',
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 2103,
    address: '12 Vesuvio Lane',
    city: 'Old Town',
    phone: '(555) 014-9090',
    hours: 'Daily · 11:30 AM – 11:00 PM',
    capacity: 75,
    features: ['Wood-Fired Oven', 'Family Friendly', 'Takeout', 'Catering'],
    heroImage: gradient('#b91c1c', '#fbbf24'),
    imageUrl: '/images/restaurants/pizza-paradise.jpg',
    accent: 'orange',
    coverEmoji: '🍕',
    gallery: [gradient('#b91c1c', '#fde68a'), gradient('#991b1b', '#fbbf24'), gradient('#7f1d1d', '#f59e0b')],
    galleryImages: ['/images/restaurants/pizza-paradise-g1.jpg', '/images/restaurants/pizza-paradise-g2.jpg', '/images/restaurants/pizza-paradise-g3.jpg'],
    openNow: true,
    menu: [
      { id: 'pp-1', name: 'Margherita DOP', description: 'San Marzano, fior di latte, basil', price: 16, category: 'Mains', image: '/images/menu/pizza-margherita.jpg' },
      { id: 'pp-2', name: 'Diavola', description: 'Spicy soppressata, chili oil, mozzarella', price: 19, category: 'Mains', image: '/images/menu/pizza-diavola.jpg' },
      { id: 'pp-3', name: 'Burrata e Prosciutto', description: '24-month prosciutto, heirloom tomato', price: 15, category: 'Starters', image: '/images/menu/burrata.jpg' },
      { id: 'pp-4', name: 'Tiramisu', description: 'Mascarpone, espresso, savoiardi', price: 9, category: 'Desserts', image: '/images/menu/tiramisu.jpg' },
    ],
    reviews: [
      { id: 'pp-r1', author: 'Lucia F.', rating: 5, date: '3 days ago', comment: 'Authentic Neapolitan. Crust is perfect.', avatarColor: 'bg-orange-500' },
      { id: 'pp-r2', author: 'Tom B.', rating: 4, date: '2 weeks ago', comment: 'Bring the kids, they loved it.', avatarColor: 'bg-yellow-500' },
    ],
  },
  {
    id: 'seafood-delights',
    name: 'Seafood Delights',
    tagline: 'Catch of the day, ocean-to-table',
    description:
      'Boats dock at sunrise, your plate lands by sunset. A raw bar that spans three coasts and a chef who treats fish like a love letter.',
    cuisine: 'Seafood',
    priceRange: '$$$',
    rating: 4.9,
    reviewCount: 743,
    address: '3 Harbor Drive',
    city: 'Marina District',
    phone: '(555) 014-1616',
    hours: 'Wed–Sun · 12:00 PM – 10:00 PM',
    capacity: 80,
    features: ['Raw Bar', 'Ocean View', 'Sustainable', 'Wine List'],
    heroImage: gradient('#0c4a6e', '#06b6d4'),
    imageUrl: '/images/restaurants/seafood-delights.jpg',
    accent: 'sky',
    coverEmoji: '🦞',
    gallery: [gradient('#0c4a6e', '#a5f3fc'), gradient('#075985', '#67e8f9'), gradient('#164e63', '#22d3ee')],
    galleryImages: ['/images/restaurants/seafood-delights-g1.jpg', '/images/restaurants/seafood-delights-g2.jpg', '/images/restaurants/seafood-delights-g3.jpg'],
    openNow: false,
    menu: [
      { id: 'sd-1', name: 'Oyster Trio', description: 'Kumamoto, Blue Point, Kumiai', price: 24, category: 'Starters', image: '/images/menu/oysters.jpg' },
      { id: 'sd-2', name: 'Whole Branzino', description: 'Salt-crusted, lemon, olive oil', price: 46, category: 'Mains', image: '/images/menu/branzino.jpg' },
      { id: 'sd-3', name: 'Lobster Risotto', description: 'Maine lobster, saffron, parmesan', price: 42, category: 'Mains', image: '/images/menu/lobster-risotto.jpg' },
      { id: 'sd-4', name: 'Seared Scallops', description: 'Cauliflower purée, brown butter', price: 34, category: 'Mains', image: '/images/menu/scallops.jpg' },
    ],
    reviews: [
      { id: 'sd-r1', author: 'Diana L.', rating: 5, date: 'Today', comment: 'Lobster risotto is the best I’ve had anywhere.', avatarColor: 'bg-sky-500' },
      { id: 'sd-r2', author: 'Chris P.', rating: 5, date: '1 week ago', comment: 'Sunset + raw bar + great wine = perfection.', avatarColor: 'bg-cyan-500' },
    ],
  },
  {
    id: 'saffron-palace',
    name: 'Saffron Palace',
    tagline: 'Royal Indian, regional soul',
    description:
      'Tandoor classics, coastal curries, and a thali that tells the story of India from Kerala to Punjab. Family-run, three generations deep.',
    cuisine: 'Indian',
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 1129,
    address: '88 Bazaar Road',
    city: 'Heritage Quarter',
    phone: '(555) 014-2244',
    hours: 'Daily · 11:00 AM – 11:00 PM',
    capacity: 100,
    features: ['Vegetarian Menu', 'Tandoor', 'Family Style', 'Catering'],
    heroImage: gradient('#7c2d12', '#f59e0b'),
    imageUrl: '/images/restaurants/saffron-palace.jpg',
    accent: 'orange',
    coverEmoji: '🍛',
    gallery: [gradient('#7c2d12', '#fde68a'), gradient('#9a3412', '#fb923c'), gradient('#431407', '#ea580c')],
    galleryImages: ['/images/restaurants/saffron-palace-g1.jpg', '/images/restaurants/saffron-palace-g2.jpg', '/images/restaurants/saffron-palace-g3.jpg'],
    openNow: true,
    menu: [
      { id: 'sp-1', name: 'Butter Chicken', description: 'Tandoor-roasted, tomato-cream, fenugreek', price: 18, category: 'Mains', image: '/images/menu/butter-chicken.jpg' },
      { id: 'sp-2', name: 'Lamb Biryani', description: 'Saffron, cardamom, slow-cooked', price: 22, category: 'Mains', image: '/images/menu/biryani.jpg' },
      { id: 'sp-3', name: 'Paneer Tikka', description: 'Yogurt-marinated, mint chutney', price: 14, category: 'Starters', image: '/images/menu/paneer.jpg' },
      { id: 'sp-4', name: 'Gulab Jamun', description: 'Cardamom syrup, pistachio', price: 7, category: 'Desserts', image: '/images/menu/gulab-jamun.jpg' },
    ],
    reviews: [
      { id: 'sp-r1', author: 'Anita V.', rating: 5, date: '2 days ago', comment: 'Most authentic thali in town. Generations of love in every bite.', avatarColor: 'bg-orange-500' },
    ],
  },
  {
    id: 'casa-mexicana',
    name: 'Casa Mexicana',
    tagline: 'Oaxacan soul, modern flair',
    description:
      'Heirloom corn tortillas pressed in-house, mezcal cocktails that tell stories, and a Tuesday taco special that locals guard with their lives.',
    cuisine: 'Mexican',
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 1672,
    address: '44 Fiesta Way',
    city: 'West Side',
    phone: '(555) 014-5050',
    hours: 'Daily · 11:00 AM – 12:00 AM',
    capacity: 95,
    features: ['Mezcal Bar', 'Vegan Options', 'Live Music', 'Patio'],
    heroImage: gradient('#15803d', '#fbbf24'),
    imageUrl: '/images/restaurants/casa-mexicana.jpg',
    accent: 'green',
    coverEmoji: '🌮',
    gallery: [gradient('#15803d', '#fef9c3'), gradient('#166534', '#facc15'), gradient('#14532d', '#eab308')],
    galleryImages: ['/images/restaurants/casa-mexicana-g1.jpg', '/images/restaurants/casa-mexicana-g2.jpg', '/images/restaurants/casa-mexicana-g3.jpg'],
    openNow: true,
    menu: [
      { id: 'cm-1', name: 'Al Pastor Tacos', description: 'Pineapple, cilantro, salsa verde', price: 4, category: 'Mains', image: '/images/menu/tacos.jpg' },
      { id: 'cm-2', name: 'Mole Negro Enchiladas', description: '26-ingredient mole, queso fresco', price: 18, category: 'Mains', image: '/images/menu/enchiladas.jpg' },
      { id: 'cm-3', name: 'Guacamole', description: 'Tableside, smoked salt, lime', price: 12, category: 'Starters', image: '/images/menu/guacamole.jpg' },
      { id: 'cm-4', name: 'Churros', description: 'Cinnamon sugar, dark chocolate', price: 8, category: 'Desserts', image: '/images/menu/churros.jpg' },
    ],
    reviews: [
      { id: 'cm-r1', author: 'Diego R.', rating: 5, date: '5 days ago', comment: 'Mole is a religious experience. Mezcal flight = must.', avatarColor: 'bg-green-500' },
    ],
  },
  {
    id: 'thai-baan',
    name: 'Thai Baan',
    tagline: 'Bangkok street food, elevated',
    description:
      'A mother-daughter kitchen serving recipes from their family in Chiang Mai. Heat levels calibrated for both the brave and the curious.',
    cuisine: 'Thai',
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 938,
    address: '15 Lotus Lane',
    city: 'Chinatown',
    phone: '(555) 014-7070',
    hours: 'Tue–Sun · 11:30 AM – 10:30 PM',
    capacity: 55,
    features: ['Spice Levels', 'Family Recipes', 'Quick Bites', 'Takeout'],
    heroImage: gradient('#7e22ce', '#ec4899'),
    imageUrl: '/images/restaurants/thai-baan.jpg',
    accent: 'purple',
    coverEmoji: '🍲',
    gallery: [gradient('#7e22ce', '#fbcfe8'), gradient('#6b21a8', '#f472b6'), gradient('#581c87', '#db2777')],
    galleryImages: ['/images/restaurants/thai-baan-g1.jpg', '/images/restaurants/thai-baan-g2.jpg', '/images/restaurants/thai-baan-g3.jpg'],
    openNow: true,
    menu: [
      { id: 'tb-1', name: 'Pad Thai', description: 'Tamarind, peanuts, lime, choice of protein', price: 15, category: 'Mains', image: '/images/menu/pad-thai.jpg' },
      { id: 'tb-2', name: 'Green Curry', description: 'Coconut, Thai basil, eggplant, bamboo', price: 17, category: 'Mains', image: '/images/menu/green-curry.jpg' },
      { id: 'tb-3', name: 'Mango Sticky Rice', description: 'Coconut cream, toasted sesame', price: 8, category: 'Desserts', image: '/images/menu/mango-sticky.jpg' },
      { id: 'tb-4', name: 'Tom Yum', description: 'Lemongrass, galangal, lime, prawns', price: 9, category: 'Starters', image: '/images/menu/tom-yum.jpg' },
    ],
    reviews: [
      { id: 'tb-r1', author: 'Lina S.', rating: 5, date: 'Today', comment: 'Tastes like my grandma’s kitchen in Bangkok. I cried a little.', avatarColor: 'bg-purple-500' },
    ],
  },
  {
    id: 'azure-mediterranean',
    name: 'Azure Mediterranean',
    tagline: 'Coastal Greek & Levantine',
    description:
      'Whole grilled fish, house-made hummus, and a terrace that catches the last light of the day. A love letter to the Aegean.',
    cuisine: 'Mediterranean',
    priceRange: '$$$',
    rating: 4.7,
    reviewCount: 612,
    address: '27 Cypress Hill',
    city: 'Hillside',
    phone: '(555) 014-1818',
    hours: 'Wed–Sun · 5:00 PM – 11:00 PM',
    capacity: 70,
    features: ['Terrace Dining', 'Whole Fish', 'Natural Wines', 'Vegetarian'],
    heroImage: gradient('#1e3a8a', '#06b6d4'),
    imageUrl: '/images/restaurants/azure-mediterranean.jpg',
    accent: 'blue',
    coverEmoji: '🐟',
    gallery: [gradient('#1e3a8a', '#a5f3fc'), gradient('#1e40af', '#67e8f9'), gradient('#172554', '#22d3ee')],
    galleryImages: ['/images/restaurants/azure-mediterranean-g1.jpg', '/images/restaurants/azure-mediterranean-g2.jpg', '/images/restaurants/azure-mediterranean-g3.jpg'],
    openNow: false,
    menu: [
      { id: 'am-1', name: 'Mezze Platter', description: 'Hummus, baba ganoush, dolmades, olives', price: 22, category: 'Starters', image: '/images/menu/mezze.jpg' },
      { id: 'am-2', name: 'Whole Grilled Branzino', description: 'Lemon, oregano, olive oil', price: 38, category: 'Mains', image: '/images/menu/whole-fish.jpg' },
      { id: 'am-3', name: 'Lamb Souvlaki', description: 'Yogurt marinade, pita, tzatziki', price: 28, category: 'Mains', image: '/images/menu/souvlaki.jpg' },
      { id: 'am-4', name: 'Baklava', description: 'Walnut, honey, rose water', price: 9, category: 'Desserts', image: '/images/menu/baklava.jpg' },
    ],
    reviews: [
      { id: 'am-r1', author: 'Niko A.', rating: 5, date: '4 days ago', comment: 'Terrace at sunset is unbeatable. Fish was pristine.', avatarColor: 'bg-blue-500' },
    ],
  },
  {
    id: 'burger-foundry',
    name: 'The Burger Foundry',
    tagline: 'Smashed patties, serious sides',
    description:
      'Dry-aged beef smashed on a flat-top, crinkle fries hand-cut daily, and a milkshake menu that leans into the ridiculous.',
    cuisine: 'American',
    priceRange: '$',
    rating: 4.5,
    reviewCount: 2841,
    address: '1 Foundry Square',
    city: 'Industrial District',
    phone: '(555) 014-1234',
    hours: 'Daily · 11:00 AM – 11:00 PM',
    capacity: 60,
    features: ['Quick Service', 'Milkshakes', 'Family Friendly', 'Late Night'],
    heroImage: gradient('#92400e', '#f59e0b'),
    imageUrl: '/images/restaurants/burger-foundry.jpg',
    accent: 'amber',
    coverEmoji: '🍔',
    gallery: [gradient('#92400e', '#fde68a'), gradient('#78350f', '#fbbf24'), gradient('#451a03', '#f59e0b')],
    galleryImages: ['/images/restaurants/burger-foundry-g1.jpg', '/images/restaurants/burger-foundry-g2.jpg', '/images/restaurants/burger-foundry-g3.jpg'],
    openNow: true,
    menu: [
      { id: 'bf-1', name: 'Classic Smash', description: 'Double patty, American cheese, pickles', price: 11, category: 'Mains', image: '/images/menu/smash-burger.jpg' },
      { id: 'bf-2', name: 'Truffle Burger', description: 'Brisket blend, truffle aioli, gruyère', price: 16, category: 'Mains', image: '/images/menu/truffle-burger.jpg' },
      { id: 'bf-3', name: 'Crinkle Fries', description: 'Hand-cut, garlic salt, fry sauce', price: 6, category: 'Starters', image: '/images/menu/fries.jpg' },
      { id: 'bf-4', name: 'Bourbon Milkshake', description: 'Vanilla bean, bourbon, caramel', price: 9, category: 'Drinks', image: '/images/menu/milkshake.jpg' },
    ],
    reviews: [
      { id: 'bf-r1', author: 'Marcus J.', rating: 5, date: 'Today', comment: 'Cheese pull is real. Milkshake = heart attack in a glass.', avatarColor: 'bg-amber-500' },
    ],
  },
];

export const cuisines: ('All' | Cuisine)[] = [
  'All',
  'Italian',
  'Japanese',
  'American',
  'Mexican',
  'Indian',
  'French',
  'Chinese',
  'Thai',
  'Mediterranean',
  'Seafood',
];

export const priceRanges: ('Any' | PriceRange)[] = ['Any', '$', '$$', '$$$', '$$$$'];
