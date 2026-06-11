import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../services/authService';
import type { UserRole } from '../../types';
import heroImage from '../../assets/hero.png';

const roleRoutes: Record<UserRole, string> = {
  'super-admin': '/admin',
  'restaurant-admin': '/restaurant',
  customer: '/customer',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Please enter a valid email';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const profile = await login(email, password);
      if (rememberMe) localStorage.setItem('dineconnect_remember', email);
      toast.success(`Welcome back, ${profile.fullName}!`);
      navigate(roleRoutes[profile.role]);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? 'unknown';
      const message = getAuthErrorMessage(code);
      toast.error(message);
      if (code === 'auth/user-not-found') setErrors({ email: message });
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroImage} alt="Restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-primary/90" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">The future of restaurant management</h2>
          <p className="text-lg text-white/80 max-w-md">
            Connect customers, restaurants, and administrators on one premium platform.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-bg-light dark:bg-dark-bg">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glass">
              <span className="text-white font-bold text-xl">DC</span>
            </div>
            <h1 className="text-2xl font-bold text-text-main dark:text-dark-text">Welcome back</h1>
            <p className="text-text-muted dark:text-dark-muted mt-1">Sign in to your DineConnect account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              error={errors.email}
              icon={<Mail size={18} />}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-main dark:text-dark-text">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  className={`input-base pl-11 pr-11 ${errors.password ? 'border-danger' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-text-muted dark:text-dark-muted">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:text-secondary font-medium">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted dark:text-dark-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:text-secondary">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
