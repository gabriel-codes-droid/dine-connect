import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from 'lucide-react';
import type { UserRole } from '../../types';
import { auth } from '../../services/auth';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  userName?: string;
  userRole?: UserRole;
  title?: string;
}

const roleLabels: Record<UserRole, string> = {
  'super-admin': 'Super Admin',
  'restaurant-admin': 'Restaurant Admin',
  customer: 'Customer',
};

export default function Navbar({
  userName = 'John Doe',
  userRole = 'super-admin',
  title = 'Dashboard',
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  // pull the real username from the session if we have it
  const session = auth.getSession();
  const displayName = session?.username || userName;
  const displayRole = session?.role || userRole;

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <nav className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          type="button"
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        <button
          type="button"
          className="hidden sm:inline-flex p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </button>

        <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-slate-700" />

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabels[displayRole]}</p>
            </div>
            <ChevronDown
              size={16}
              className={`hidden sm:block text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg py-1 z-50">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <User size={16} /> Profile
              </button>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <SettingsIcon size={16} /> Settings
              </button>
              <hr className="my-1 border-gray-200 dark:border-slate-700" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
