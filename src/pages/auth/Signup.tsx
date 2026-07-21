import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Star,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Sun,
  Moon,
  Check,
  X,
} from 'lucide-react';
import type { UserRole } from '../../types';
import { auth } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';

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

function validateEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function passwordStrength(p: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (!p) return { score: 0, label: '—', color: 'bg-gray-200 dark:bg-slate-700' };
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
  const map = [
    { label: 'Too short', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-indigo-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ] as const;
  return { score: score as 0 | 1 | 2 | 3 | 4, ...map[score] };
}

export default function Signup() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailStatus, setEmailStatus] = useState<'unknown' | 'checking' | 'available' | 'taken'>('unknown');
  const [usernameStatus, setUsernameStatus] = useState<'unknown' | 'checking' | 'available' | 'taken'>('unknown');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // debounced live availability checks
  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || !validateEmail(trimmed)) {
      setEmailStatus('unknown');
      return;
    }
    setEmailStatus('checking');
    const t = setTimeout(async () => {
      try {
        const { exists } = await auth.checkEmail(trimmed);
        setEmailStatus(exists ? 'taken' : 'available');
      } catch {
        setEmailStatus('unknown');
      }
    }, 500);
    return () => clearTimeout(t);
  }, [email]);

  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      setUsernameStatus('unknown');
      return;
    }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      try {
        const { exists } = await auth.checkUsername(trimmed);
        setUsernameStatus(exists ? 'taken' : 'available');
      } catch {
        setUsernameStatus('unknown');
      }
    }, 500);
    return () => clearTimeout(t);
  }, [username]);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (username.trim().length < 3) {
      setFieldErrors({ username: 'Username must be at least 3 characters' });
      setError('Username must be at least 3 characters');
      return;
    }
    if (!validateEmail(email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setFieldErrors({ password: 'Password must be at least 6 characters' });
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      setError('Passwords do not match');
      return;
    }
    if (emailStatus === 'taken' || usernameStatus === 'taken') {
      setError('That ' + (emailStatus === 'taken' ? 'email' : 'username') + ' is already taken');
      return;
    }

    setLoading(true);
    try {
      await auth.signup({ username: username.trim(), email: email.trim(), password, role: selectedRole });
      navigate(roleRoutes[selectedRole], { replace: true });
    } catch (err) {
      const reason = (err as Error).message || 'Signup failed. Please try again.';
      setError(reason);
      const field = (err as Error & { field?: string }).field;
      if (field === 'email' || field === 'username') {
        setFieldErrors({ [field]: reason });
        if (field === 'email') setEmailStatus('taken');
        if (field === 'username') setUsernameStatus('taken');
      }
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
            <Sparkles size={12} /> Join 1,200+ restaurants
          </span>
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
            Create your<br />
            <span className="italic text-amber-300">DineConnect account.</span>
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 max-w-md mb-6 sm:mb-8">
            One account for diners, owners, and operators. Pick a role and step inside in under a minute.
          </p>

          <ul className="space-y-2.5 mb-8">
            {[
              'Book tables in seconds, no phone calls',
              'Run reservations, orders & reviews in one place',
              'Real-time analytics across every venue',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-indigo-100">
                <div className="w-5 h-5 rounded-full bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                {feat}
              </li>
            ))}
          </ul>

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
          <ShieldCheck size={14} /> Secure session · No card required
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-12 relative">
        {/* back button */}
        <Link
          to="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        
        {/* theme toggle */}
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
            Create your account
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Already a member?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6 sm:mb-8" noValidate>
            {error && (
              <div
                role="alert"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm"
              >
                <strong>Signup failed:</strong> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. gabriel_m"
                  autoComplete="username"
                  className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    fieldErrors.username || usernameStatus === 'taken'
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-gray-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-transparent'
                  }`}
                  required
                  minLength={3}
                />
                {usernameStatus === 'available' && (
                  <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
                {usernameStatus === 'taken' && (
                  <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {usernameStatus === 'checking' && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Checking availability…</p>
              )}
              {usernameStatus === 'available' && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">✓ username available</p>
              )}
              {usernameStatus === 'taken' && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  ⚠ already taken. <Link to="/login" className="underline">Sign in?</Link>
                </p>
              )}
              {fieldErrors.username && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                  {fieldErrors.username}
                </p>
              )}
            </div>

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
                  className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    fieldErrors.email || emailStatus === 'taken'
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-gray-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-transparent'
                  }`}
                  required
                />
                {emailStatus === 'available' && (
                  <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
                {emailStatus === 'taken' && (
                  <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {emailStatus === 'checking' && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Checking availability…</p>
              )}
              {emailStatus === 'available' && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">✓ email available</p>
              )}
              {emailStatus === 'taken' && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  ⚠ already registered. <Link to="/login" className="underline">Sign in?</Link>
                </p>
              )}
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                  {fieldErrors.email}
                </p>
              )}
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    fieldErrors.password
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-gray-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-transparent'
                  }`}
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
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-colors ${
                          i < strength.score ? strength.color : 'bg-gray-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                    {strength.label}
                  </span>
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    fieldErrors.confirmPassword
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-gray-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-transparent'
                  }`}
                  required
                />
                {confirmPassword && confirmPassword === password && (
                  <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                I am a…
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
              {loading ? 'Creating account…' : 'Create account'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
