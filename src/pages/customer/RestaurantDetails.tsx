import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Mail, Plus, ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getRestaurantBySlug } from '../../data/mockData';

const tabs = ['Overview', 'Menu', 'Reservations', 'Reviews', 'Gallery'] as const;

export default function RestaurantDetails() {
  const { slug } = useParams<{ slug: string }>();
  const restaurant = getRestaurantBySlug(slug ?? '');
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Overview');
  const [showReserve, setShowReserve] = useState(false);
  const [reserveDate, setReserveDate] = useState('');
  const [reserveTime, setReserveTime] = useState('');
  const [reserveGuests, setReserveGuests] = useState(2);

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Restaurant not found</h2>
        <Link to="/customer/discover" className="text-primary">Back to Discover</Link>
      </div>
    );
  }

  const handleReserve = () => {
    toast.success(`Table reserved at ${restaurant.name} for ${reserveGuests} guests!`);
    setShowReserve(false);
  };

  return (
    <div className="page-container -m-6">
      <div className="relative h-72 overflow-hidden">
        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <Link to="/customer/discover" className="absolute top-6 left-6 p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
          <img src={restaurant.logo} alt="" className="w-20 h-20 rounded-2xl border-4 border-white shadow-elevated object-cover" />
          <div className="text-white flex-1">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
              <span className="flex items-center gap-1"><Star size={14} className="fill-warning text-warning" />{restaurant.rating} ({restaurant.reviewCount} reviews)</span>
              <span>{restaurant.cuisine}</span>
              <span className="flex items-center gap-1"><MapPin size={14} />{restaurant.distance}</span>
            </div>
          </div>
          <button type="button" onClick={() => setShowReserve(true)} className="btn-primary hidden sm:flex">
            <Calendar size={18} /> Book Table
          </button>
        </div>
      </div>

      <div className="px-6">
        <div className="flex gap-1 border-b border-border dark:border-dark-border mt-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="card-base p-6">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-text-muted dark:text-dark-muted">{restaurant.description}</p>
              </div>
              <div className="card-base p-6">
                <h3 className="font-semibold mb-3">Opening Hours</h3>
                <p className="text-text-muted flex items-center gap-2"><Clock size={16} />{restaurant.openingHours}</p>
              </div>
            </div>
            <div className="card-base p-6 space-y-4 h-fit">
              <h3 className="font-semibold">Contact</h3>
              <p className="flex items-center gap-2 text-sm text-text-muted"><MapPin size={16} />{restaurant.address}</p>
              <p className="flex items-center gap-2 text-sm text-text-muted"><Phone size={16} />{restaurant.phone}</p>
              <p className="flex items-center gap-2 text-sm text-text-muted"><Mail size={16} />{restaurant.email}</p>
            </div>
          </div>
        )}

        {activeTab === 'Menu' && (
          <div className="mt-6 space-y-8">
            {restaurant.menu.map((cat) => (
              <div key={cat.id}>
                <h3 className="text-lg font-semibold mb-4">{cat.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((item) => (
                    <div key={item.id} className="card-base p-4 flex gap-4 hover:shadow-card transition-shadow">
                      <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            {item.popular && <Badge variant="primary">Popular</Badge>}
                          </div>
                          <span className="font-bold text-primary">${item.price}</span>
                        </div>
                        <p className="text-sm text-text-muted mt-1">{item.description}</p>
                        <button type="button" onClick={() => toast.success(`${item.name} added to cart`)} className="mt-2 flex items-center gap-1 text-sm text-primary font-medium hover:text-secondary">
                          <Plus size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Reservations' && (
          <div className="mt-6 max-w-lg">
            <div className="card-base p-6 space-y-4">
              <h3 className="font-semibold">Book a Table</h3>
              <input type="date" value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} className="input-base" />
              <input type="time" value={reserveTime} onChange={(e) => setReserveTime(e.target.value)} className="input-base" />
              <input type="number" min={1} max={20} value={reserveGuests} onChange={(e) => setReserveGuests(Number(e.target.value))} className="input-base" placeholder="Guests" />
              <button type="button" onClick={handleReserve} className="w-full btn-primary">Confirm Reservation</button>
            </div>
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="mt-6 space-y-4">
            <div className="card-base p-6 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{restaurant.rating}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(restaurant.rating) ? 'fill-warning text-warning' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-sm text-text-muted mt-1">{restaurant.reviewCount} reviews</p>
              </div>
            </div>
            {restaurant.reviews.map((review) => (
              <div key={review.id} className="card-base p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">{review.avatar}</div>
                  <div>
                    <p className="font-medium">{review.author}</p>
                    <p className="text-xs text-text-muted">{review.date}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-warning text-warning" />
                    ))}
                  </div>
                </div>
                <p className="text-text-muted">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Gallery' && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {restaurant.gallery.map((img, i) => (
              <img key={i} src={img} alt="" className="rounded-2xl h-48 w-full object-cover hover:scale-[1.02] transition-transform" />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showReserve} onClose={() => setShowReserve(false)} title={`Reserve at ${restaurant.name}`}>
        <div className="space-y-4">
          <input type="date" value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} className="input-base" />
          <input type="time" value={reserveTime} onChange={(e) => setReserveTime(e.target.value)} className="input-base" />
          <input type="number" min={1} max={20} value={reserveGuests} onChange={(e) => setReserveGuests(Number(e.target.value))} className="input-base" />
          <button type="button" onClick={handleReserve} className="w-full btn-primary">Confirm Reservation</button>
        </div>
      </Modal>
    </div>
  );
}
