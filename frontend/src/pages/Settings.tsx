import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Shield, Sun, Moon, Heart, Star, Building2, ShoppingBag } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { auth } from '../services/auth';
import { useTheme } from '../context/ThemeContext';
import { orderService, restaurantService, favoriteService } from '../firebase';
import type { Restaurant } from '../data/restaurants';
import type { UserRole } from '../types';
import InstallPrompt from '../pwa/InstallPrompt';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const session = auth.getSession();

  useEffect(() => {
    if (!session?.authenticated) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  const role = session?.role as UserRole | undefined;

  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  const [adminRestaurant, setAdminRestaurant] = useState<Restaurant | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const [totalRestaurants, setTotalRestaurants] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [superLoading, setSuperLoading] = useState(false);

  useEffect(() => {
    if (role !== 'customer' || !session) return;
    let cancelled = false;
    (async () => {
      setCustomerLoading(true);
      try {
        const orders = await orderService.getCustomerOrders(session.username);
        const deliveredTotal = orders
          .filter((o) => o.status === 'delivered')
          .reduce((sum, o) => sum + o.total, 0);
        if (!cancelled) setLoyaltyPoints(Math.floor(deliveredTotal * 10));
        const favs = await favoriteService.getCustomerFavorites(session.username);
        if (!cancelled) setFavoriteCount(favs.length);
      } catch (err) {
        console.error('Error loading customer data:', err);
      } finally {
        if (!cancelled) setCustomerLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role, session?.username]);

  useEffect(() => {
    if (role !== 'restaurant-admin' || !session) return;
    let cancelled = false;
    (async () => {
      setAdminLoading(true);
      try {
        const restaurants = await restaurantService.getRestaurantsByOwner(session.username);
        if (!cancelled) {
          setAdminRestaurant(restaurants.length > 0 ? restaurants[0] : null);
        }
      } catch (err) {
        console.error('Error loading restaurant admin data:', err);
      } finally {
        if (!cancelled) setAdminLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role, session?.username]);

  useEffect(() => {
    if (role !== 'super-admin') return;
    let cancelled = false;
    (async () => {
      setSuperLoading(true);
      try {
        const [restaurants, orders] = await Promise.all([
          restaurantService.getAllRestaurants(),
          orderService.getAllOrders(),
        ]);
        if (!cancelled) {
          setTotalRestaurants(restaurants.length);
          setTotalOrders(orders.length);
        }
      } catch (err) {
        console.error('Error loading super-admin data:', err);
      } finally {
        if (!cancelled) setSuperLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role]);

  if (!session?.authenticated) {
    return null;
  }

  return (
    <DashboardLayout userRole={role} userName={session.username} title="Settings">
      <InstallPrompt />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account, preferences, and view your information.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400"><User className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                {session.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{session.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 rounded-lg px-3 py-2">
              <Shield className="h-4 w-4 text-indigo-500" />
              <span>Role:</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400 capitalize">{session.role}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400"><Sun className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? 'Dark theme is currently active' : 'Light theme is currently active'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                {theme === 'dark' ? (
                  <><Sun className="h-4 w-4" />Light</>
                ) : (
                  <><Moon className="h-4 w-4" />Dark</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400"><LogOut className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Sign out of your account. You will be redirected to the login page.
            </p>
            <button
              onClick={() => { auth.logout(); navigate('/login', { replace: true }); }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />Sign out
            </button>
          </div>
        </div>

        {role === 'customer' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
              <div className="text-indigo-600 dark:text-indigo-400"><Star className="h-5 w-5" /></div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Rewards</h2>
            </div>
            <div className="px-6 py-5">
              {customerLoading ? (
                <div className="space-y-4">
                  <div className="h-10 w-32 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-10 w-32 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-center gap-3">
                      <Star className="h-6 w-6 text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Loyalty Points</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{loyaltyPoints?.toLocaleString() ?? '—'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">10 pts per $1 spent on delivered orders</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-100 dark:border-rose-800">
                    <div className="flex items-center gap-3">
                      <Heart className="h-6 w-6 text-rose-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Favorite Restaurants</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{favoriteCount ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {role === 'restaurant-admin' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
              <div className="text-indigo-600 dark:text-indigo-400"><Building2 className="h-5 w-5" /></div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Restaurant</h2>
            </div>
            <div className="px-6 py-5">
              {adminLoading ? (
                <div className="h-14 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
              ) : adminRestaurant ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{adminRestaurant.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{adminRestaurant.cuisine}</p>
                  </div>
                  <Link to="/restaurant" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                    Open Dashboard
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No restaurant found under your account.</p>
              )}
            </div>
          </div>
        )}

        {role === 'super-admin' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
              <div className="text-indigo-600 dark:text-indigo-400"><Shield className="h-5 w-5" /></div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Stats</h2>
            </div>
            <div className="px-6 py-5">
              {superLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-16 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <Building2 className="h-6 w-6 text-indigo-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Restaurants</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalRestaurants?.toLocaleString() ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800">
                    <ShoppingBag className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Orders</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalOrders?.toLocaleString() ?? '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
