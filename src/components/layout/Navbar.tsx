import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Settings, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface NavbarProps {
  title?: string;
  userRole?: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  'super-admin': 'Super Admin',
  'restaurant-admin': 'Restaurant Admin',
  customer: 'Customer',
};

export default function Navbar({ title = 'Dashboard', userRole = 'customer' }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-border dark:border-dark-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-text-main dark:text-dark-text">{title}</h1>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-dark-bg border border-border dark:border-dark-border">
          <Search size={16} className="text-text-muted dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-40 text-text-main dark:text-dark-text placeholder:text-text-muted"
          />
        </div>

        <button type="button" onClick={toggleTheme} className="p-2.5 rounded-xl text-text-muted dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button type="button" className="relative p-2.5 rounded-xl text-text-muted dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div className="w-px h-6 bg-border dark:bg-dark-border mx-1" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {(user?.fullName ?? 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-text-main dark:text-dark-text">{user?.fullName ?? 'User'}</p>
              <p className="text-xs text-text-muted dark:text-dark-muted">{roleLabels[userRole]}</p>
            </div>
            <ChevronDown size={14} className={`text-text-muted transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 card-base shadow-elevated py-1 z-50 animate-slide-in">
              <button type="button" className="w-full px-4 py-2.5 text-left text-sm text-text-main dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-2">
                <User size={16} /> Profile
              </button>
              <button type="button" className="w-full px-4 py-2.5 text-left text-sm text-text-main dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-2">
                <Settings size={16} /> Settings
              </button>
              <hr className="my-1 border-border dark:border-dark-border" />
              <button type="button" onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
