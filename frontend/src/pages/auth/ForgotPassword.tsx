import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowLeft, Mail, Sun, Moon, CheckCircle2, AlertCircle } from 'lucide-react';
import { auth } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';

function validateEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function ForgotPassword() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await auth.forgotPassword(email.toLowerCase().trim());
      setSent(true);
    } catch (err) {
      const msg = (err as Error).message || 'Something went wrong';
      // Backend returns 404 for unknown email — don't leak existence, show generic
      if (msg.toLowerCase().includes('not found')) {
        setSent(true);
      } else {
        setError(msg);
      }
    } finally {
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
            Forgot your<br />password?
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-md">
            No worries. Enter your email and we'll send you a link to reset it.
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
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {!sent ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Reset your password
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
                Enter the email associated with your account and we'll send a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="you@example.com"
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
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Check your email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                If an account exists for <strong className="text-gray-900 dark:text-white">{email}</strong>,
                we just sent a password reset link. The link expires in 1 hour.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-8">
                Didn't get it? Check spam, or{' '}
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  try again
                </button>
                .
              </p>
              <Link
                to="/login"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
