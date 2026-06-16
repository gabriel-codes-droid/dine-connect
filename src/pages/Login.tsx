import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, ArrowRight, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { UserRole } from '../types';

const roles: { value: UserRole; label: string; description: string; icon: string }[] = [
  { value: 'super-admin', label: 'Super Admin', description: 'Platform-wide oversight', icon: '🛡️' },
  { value: 'restaurant-admin', label: 'Restaurant Admin', description: 'Manage a single venue', icon: '👨‍🍳' },
  { value: 'customer', label: 'Customer', description: 'Browse & book tables', icon: '🍽️' },
];

const roleRoutes: Record<UserRole, string> = {
  'super-admin': '/admin',
  'restaurant-admin': '/restaurant',
  customer: '/customer',
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const navigate = useNavigate();

  const handleLogin = () => {
    sessionStorage.setItem('dineconnect_role', selectedRole);
    navigate(roleRoutes[selectedRole]);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Left — visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-16 left-12 text-9xl">🍝</div>
          <div className="absolute top-1/3 right-16 text-8xl">🥐</div>
          <div className="absolute bottom-32 left-20 text-8xl">🍣</div>
          <div className="absolute bottom-16 right-12 text-9xl">🍷</div>
        </div>

        <Link to="/" className="relative flex items-center gap-2">
          <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
            <ChefHat size={20} />
          </div>
          <span className="text-xl font-bold">DineConnect</span>
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-4">
            <Sparkles size={12} /> Trusted by 1,200+ restaurants
          </span>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
            Welcome to the<br />
            <span className="italic text-amber-300">future of dining.</span>
          </h1>
          <p className="text-indigo-100 text-lg max-w-md mb-8">
            One platform connecting diners, restaurants, and operators. Pick your
            role to step inside.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500'].map((c, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full ${c} border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-amber-300 text-amber-300" />
              ))}
              <span className="text-sm text-indigo-100 ml-1.5">4.9 · 12k reviews</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-indigo-200">
          <ShieldCheck size={14} /> Secure session · No data stored
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <ChefHat size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DineConnect</span>
            </Link>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Step inside
          </h2>
          <p className="text-gray-500 mb-8">
            Choose how you&apos;ll use DineConnect today.
          </p>

          <div className="space-y-3 mb-8">
            {roles.map((role) => {
              const active = selectedRole === role.value;
              return (
                <label
                  key={role.value}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    active
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
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
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      active ? 'bg-white shadow-sm' : 'bg-gray-50'
                    }`}
                  >
                    {role.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{role.label}</p>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      active ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}
                  >
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight size={18} />
          </button>

          <p className="text-center text-gray-400 text-sm mt-6">
            Demo mode — no password required
          </p>

          <div className="mt-6 text-center">
            <Link
              to="/restaurants"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Or browse restaurants first →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
