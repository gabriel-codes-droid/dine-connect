import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'super-admin', label: 'Super Admin', description: 'Platform administration' },
  { value: 'restaurant-admin', label: 'Restaurant Admin', description: 'Restaurant management' },
  { value: 'customer', label: 'Customer', description: 'Customer portal' },
];

const roleRoutes: Record<UserRole, string> = {
  'super-admin': '/admin',
  'restaurant-admin': '/restaurant',
  customer: '/customer',
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('super-admin');
  const navigate = useNavigate();

  const handleLogin = () => {
    sessionStorage.setItem('dineconnect_role', selectedRole);
    navigate(roleRoutes[selectedRole]);
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 pointer-events-none" />

      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">DC</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">DineConnect</h1>
        <p className="text-center text-gray-500 mb-8">Restaurant Management Platform</p>

        <div className="space-y-3 mb-8">
          {roles.map((role) => (
            <label
              key={role.value}
              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedRole === role.value
                  ? 'border-primary bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={() => setSelectedRole(role.value)}
                className="w-4 h-4 text-primary accent-primary cursor-pointer"
              />
              <div className="ml-4">
                <p className="font-semibold text-gray-900">{role.label}</p>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-all duration-200 shadow-lg shadow-indigo-200"
        >
          Login to Dashboard
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Select a role and click login to enter the demo.
        </p>
      </div>
    </div>
  );
}
