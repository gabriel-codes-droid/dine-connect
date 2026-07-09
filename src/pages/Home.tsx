import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChefHat,
  Calendar,
  TrendingUp,
  ArrowRight,
  Star,
  MapPin,
} from 'lucide-react';
import { restaurants } from '../data/restaurants';

export default function Home() {
  const navigate = useNavigate();
  const featured = restaurants.filter((r) => r.featured);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="font-bold text-gray-900">DineConnect</span>
          </Link>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-gray-700">
            <Link to="/restaurants" className="hover:text-indigo-600">Restaurants</Link>
            <a href="#how" className="hover:text-indigo-600">How it works</a>
            <a href="#owners" className="hover:text-indigo-600">For owners</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-8xl">🍝</div>
          <div className="absolute top-32 right-20 text-7xl">🍣</div>
          <div className="absolute bottom-20 left-1/4 text-7xl">🥐</div>
          <div className="absolute bottom-10 right-1/3 text-8xl">🍷</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-sm font-medium mb-6">
            <Sparkles size={14} /> Restaurant management, reimagined
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            One platform.<br />
            <span className="italic text-amber-300">Every table.</span>
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Discover restaurants, book in seconds, and run your venue with tools
            built for hospitality.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
            >
              Explore restaurants <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/25 transition-colors"
            >
              Open dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              This week&apos;s standouts
            </h2>
            <p className="text-gray-500">Hand-picked favourites from our community</p>
          </div>
          <Link
            to="/restaurants"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((r) => (
            <Link
              key={r.id}
              to={`/restaurants/${r.id}`}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all"
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
                <div className="flex items-center gap-1.5 mb-2">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900">{r.rating}</span>
                  <span className="text-sm text-gray-500">({r.reviewCount})</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">{r.cuisine}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">{r.priceRange}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 mb-1">
                  {r.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{r.tagline}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin size={12} /> {r.city}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              How DineConnect works
            </h2>
            <p className="text-gray-500">Three roles. One seamless experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Diners discover',
                body: 'Browse restaurants, read real reviews, and book a table in seconds — no phone calls needed.',
                color: 'from-indigo-500 to-purple-500',
              },
              {
                icon: ChefHat,
                title: 'Owners manage',
                body: 'Track reservations, orders, and reviews from a single dashboard built for hospitality.',
                color: 'from-amber-500 to-orange-500',
              },
              {
                icon: TrendingUp,
                title: 'Admins oversee',
                body: 'Get a bird&apos;s-eye view of every venue, customer, and metric across the platform.',
                color: 'from-emerald-500 to-teal-500',
              },
            ].map(({ icon: Icon, title, body, color }) => (
              <div
                key={title}
                className="bg-slate-50 border border-gray-200 rounded-2xl p-7 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owners CTA */}
      <section
        id="owners"
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-900 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">👨‍🍳</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wide mb-4">
              <Sparkles size={12} /> For restaurant owners
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Run your restaurant like a pro
            </h2>
            <p className="text-indigo-200 text-lg mb-6">
              Reservations, orders, analytics, and customer reviews — all in one
              beautiful dashboard.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Real-time reservation management',
                'Order pipeline & table tracking',
                'Customer insights & loyalty tools',
                'Multi-location support',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-indigo-100">{feat}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
            >
              Open owner dashboard <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Avg. table turnover', value: '+18%' },
              { label: 'Reservations / wk', value: '342' },
              { label: 'Owner rating', value: '4.9★' },
              { label: 'Time saved / day', value: '3.5h' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
              >
                <div className="text-3xl font-extrabold text-amber-300 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-indigo-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="font-bold text-white">DineConnect</span>
          </div>
          <p className="text-sm">© 2026 DineConnect · Crafted with care</p>
        </div>
      </footer>
    </div>
  );
}
