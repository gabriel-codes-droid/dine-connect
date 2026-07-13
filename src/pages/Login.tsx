import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChefHat,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react';
import type { UserRole } from '../types';
import { auth } from '../services/auth';
import { useTheme } from '../context/ThemeContext';

const roles: { value: UserRole; label: string; description: string; icon: string }[] = [
  { value: 'customer', label: 'Customer', description: 'Browse & book tables', icon: '🍽️' },
  { value: 'restaurant-admin', label: 'Restaurant Admin', description: 'Manage a single venue', icon: '👨‍🍳' },
  { value: 'super-admin', label: 'Super Admin', description: 'Platform-wide oversight', icon: '🛡️' },
];

const roleRoutes: Record<UserRole, string> = {
  customer: '/customer',
  'restaurant-admin': '/restaurant',
  'super-admin': '/admin',
};

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await auth.login({ email, password, role: selectedRole });
      navigate(roleRoutes[selectedRole], { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* Left — visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-16 left-12 text-7xl sm:text-8xl md:text-9xl">🍝</div>
          <div className="absolute top-1/3 right-16 text-6xl sm:text-7xl md:text-8xl">🥐</div>
          <div className="absolute bottom-32 left-20 text-6xl sm:text-7xl md:text-8xl">🍣</div>
          <div className="absolute bottom-16 right-12 text-7xl sm:text-8xl md:text-9xl">🍷</div>
        </div>

        <Link to="/" className="relative flex items-center gap-2">
          <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
            <ChefHat size={20} />
          </div>
          <span className="text-lg sm:text-xl font-bold">DineConnect</span>
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-4">
            <Sparkles size={12} /> Trusted by 1,200+ restaurants
          </span>
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
            Welcome to the<br />
            <span className="italic text-amber-300">future of dining.</span>
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 max-w-md mb-6 sm:mb-8">
            One platform connecting diners, restaurants, and operators. Pick your
            role to step inside.
          </p>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex -space-x-2">
              {['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500'].map((c, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${c} border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-amber-300 text-amber-300" />
              ))}
              <span className="text-xs sm:text-sm text-indigo-100 ml-1.5">4.9 · 12k reviews</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs sm:text-sm text-indigo-200">
          <ShieldCheck size={14} /> Secure session · No data stored
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-12 relative">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <ChefHat size={20} className="text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">DineConnect</span>
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Sign in to your account
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            New here?{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleLogin} className="space-y-4 mb-6 sm:mb-8" noValidate>
            {error && (
              <div
                role="alert"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm"
              >
                <strong>Sign in failed:</strong> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select your role
              </label>
              <div className="space-y-2">
                {roles.map((role) => {
                  const active = selectedRole === role.value;
                  return (
                    <label
                      key={role.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        active
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={active}
                        onChange={() => setSelectedRole(role.value)}
                        className="sr-only"
                      />
                      <div className="text-2xl">{role.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{role.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          active ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 sm:py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center space-y-2">
            <Link
              to="/restaurants"
              className="block text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              Or browse restaurants first →
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No account?{' '}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
