import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Shield, Sun, Moon, Heart, Star, Building2, ShoppingBag, Mail, Image as ImageIcon } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPageHeader from '../components/layout/DashboardPageHeader';

import { auth } from '../services/auth';
import { useTheme } from '../context/ThemeContext';
import { orderService, restaurantService, favoriteService } from '../firebase';
import type { Restaurant } from '../data/restaurants';
import type { UserRole } from '../types';
import InstallPrompt from '../pwa/InstallPrompt';

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSize = 256;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      const compressed = canvas.toDataURL('image/jpeg', 0.78);
      resolve(compressed.length > 90000 ? canvas.toDataURL('image/jpeg', 0.55) : compressed);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('The selected image could not be read.'));
    };
    image.src = objectUrl;
  });
}

export default function Settings() {

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const session = auth.getSession();

  useEffect(() => {
    if (!session?.authenticated) {
      navigate('/login', { replace: true });
    }
  }, [session?.authenticated, navigate]);

  const role = session?.role as UserRole | undefined;

  // Email verification state
  const [verificationStep, setVerificationStep] = useState<'idle' | 'code-sent' | 'confirmed'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Profile picture state
  const [pictureUrl, setPictureUrl] = useState<string | null>(session?.profilePicture ?? null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [pictureLoading, setPictureLoading] = useState(false);

  const [pictureSuccess, setPictureSuccess] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
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
        <DashboardPageHeader
          eyebrow="Account"
          title="Settings"
          subtitle="Manage your account, preferences, and profile photo."
          icon={User}
        />

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

        {/* ── Email ── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400"><Mail className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Email</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Current email: <span className="font-medium text-gray-900 dark:text-white">{session.email}</span>
            </p>

            {emailError && (
              <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-300">{emailError}</p>
              </div>
            )}
            {emailSuccess && (
              <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-600 dark:text-green-300">{emailSuccess}</p>
              </div>
            )}

            {verificationStep === 'idle' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter new email address"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setEmailError(null); setEmailSuccess(null); }}
                  disabled={emailLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <button
                  onClick={async () => {
                    setEmailError(null); setEmailSuccess(null);
                    if (!newEmail) return setEmailError('Please enter a new email address');
                    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail.trim())) return setEmailError('Please enter a valid email address');
                    setEmailLoading(true);
                    try {
                      await auth.sendVerificationCode(newEmail);
                      setVerificationStep('code-sent');
                      setEmailSuccess('Verification code sent to your new email');
                    } catch (err: any) {
                      setEmailError(err.message || 'Failed to send code');
                    } finally {
                      setEmailLoading(false);
                    }
                  }}
                  disabled={emailLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium disabled:opacity-50 transition-colors"
                >
                  {emailLoading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            )}

            {verificationStep === 'code-sent' && (
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Verification code</label>
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={verificationCode}
                    onChange={(e) => { setVerificationCode(e.target.value); setEmailError(null); }}
                    disabled={emailLoading}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={async () => {
                    setEmailError(null); setEmailSuccess(null);
                    if (!verificationCode) return setEmailError('Please enter the verification code');
                    setEmailLoading(true);
                    try {
                      const result = await auth.confirmEmailChange(verificationCode);
                      setVerificationStep('confirmed');
                      setEmailSuccess(result.email);
                      setNewEmail('');
                      setVerificationCode('');
                      // Force a re-render so session.email updates in the profile section
                      window.dispatchEvent(new StorageEvent('storage', { key: 'dineconnect_session' }));
                    } catch (err: any) {
                      setEmailError(err.message || 'Failed to verify code');
                    } finally {
                      setEmailLoading(false);
                    }
                  }}
                  disabled={emailLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium disabled:opacity-50 transition-colors"
                >
                  {emailLoading ? 'Verifying...' : 'Confirm'}
                </button>
                <button
                  onClick={() => { setVerificationStep('idle'); setVerificationCode(''); setEmailError(null); setEmailSuccess(null); }}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {verificationStep === 'confirmed' && (
              <p className="text-sm text-green-600 dark:text-green-300">
                Email successfully updated to <span className="font-medium">{emailSuccess}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── Profile Picture ── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400"><ImageIcon className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Picture</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-4 mb-4">
              {pictureUrl ? (
                <img
                  src={pictureUrl}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
                  onError={(e) => { (e.target as HTMLImageElement).src = ''; setPictureUrl(null); }}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-2xl">
                  {session.username?.charAt(0).toUpperCase() ?? '?'}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {pictureUrl ? 'Custom picture set' : 'Using default avatar'}
                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Choose an image file. It will be resized securely for your profile.</p>

              </div>
            </div>

            {pictureSuccess && (
              <div className="mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-600 dark:text-green-300">{pictureSuccess}</p>
              </div>
            )}

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-200 cursor-pointer hover:border-indigo-400 transition-colors">
                <ImageIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium truncate">{pictureFile ? pictureFile.name : 'Choose an image file'}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP · up to 10 MB</span>
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setPictureFile(file);
                    setPictureSuccess(null);
                  }}
                  disabled={pictureLoading}
                  className="sr-only"
                />
              </label>
              <button
                onClick={async () => {
                  if (!pictureFile) return;
                  setPictureSuccess(null);
                  setPictureLoading(true);
                  try {
                    const compressedImage = await compressImage(pictureFile);
                    await auth.updateProfilePicture(compressedImage);
                    setPictureUrl(compressedImage);
                    setPictureFile(null);
                    setPictureSuccess('Profile picture uploaded successfully.');
                  } catch (err: any) {
                    setPictureSuccess(err?.message || 'Could not upload the profile picture.');
                  } finally {
                    setPictureLoading(false);
                  }
                }}
                disabled={pictureLoading || !pictureFile}
                className="px-4 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium disabled:opacity-50 transition-colors"
              >
                {pictureLoading ? 'Uploading...' : 'Upload photo'}
              </button>
            </div>

          </div>
        </div>

        {/* ── Account ── */}
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
