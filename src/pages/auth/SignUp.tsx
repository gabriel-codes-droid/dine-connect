import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../services/authService';
import heroImage from '../../assets/hero.png';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Please enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password, fullName);
      toast.success('Account created successfully!');
      navigate('/customer');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? 'unknown';
      const message = getAuthErrorMessage(code);
      toast.error(message);
      if (code === 'auth/email-already-in-use') setErrors({ email: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroImage} alt="Restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-primary/70 to-secondary/90" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Join DineConnect</h2>
          <p className="text-lg text-white/80 max-w-md">
            Discover restaurants, book tables, and enjoy a seamless dining experience.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-bg-light dark:bg-dark-bg">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glass">
              <span className="text-white font-bold text-xl">DC</span>
            </div>
            <h1 className="text-2xl font-bold text-text-main dark:text-dark-text">Create your account</h1>
            <p className="text-text-muted dark:text-dark-muted mt-1">Start your DineConnect journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }}
              error={errors.fullName}
              icon={<User size={18} />}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              error={errors.email}
              icon={<Mail size={18} />}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"><Lock size={18} /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                  className={`input-base pl-11 pr-11 ${errors.password ? 'border-danger' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
              error={errors.confirmPassword}
              icon={<Lock size={18} />}
            />

            <button type="submit" disabled={loading} className="w-full btn-primary mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted dark:text-dark-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-secondary">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
