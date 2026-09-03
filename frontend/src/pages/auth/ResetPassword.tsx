import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChefHat, ArrowLeft, Lock, Eye, EyeOff, Sun, Moon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';

function validatePassword(p: string) {
  return p.length >= 6;
}

export default function ResetPassword() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('oobCode') || params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset link. Request a new one from the forgot password page.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) return;

    if (!password) {
      setError('Please enter a new password');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword({ email: email ? email.toLowerCase() : undefined, token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError((err as Error).message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50 dark:bg-gray-950">
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
            Set a new<br />password
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-md">
            Pick something strong you haven't used before. You can change it again anytime from settings.
          </p>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} DineConnect
        </p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft size={16} /> Back to sign in
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {!done ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Choose a new password
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
                For <strong className="text-gray-900 dark:text-white break-all">{email || 'your account'}</strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={!token}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type={show ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      disabled={!token}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Password reset
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
                You're signed in. You can keep using the app or head to the sign-in page.
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Go to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
