import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ShoppingCart,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface SidebarProps {
  userRole: UserRole;
  unreadReports?: number;
  onReportsOpened?: () => void;
}

const overviewPaths: Record<UserRole, string> = {
  'super-admin': '/admin',
  'restaurant-admin': '/restaurant',
  customer: '/customer',
};

function getMenuItems(role: UserRole) {
  return [
    { icon: BarChart3, label: 'Overview', path: overviewPaths[role] },
    { icon: Building2, label: 'Restaurants', path: '/restaurants', roles: ['super-admin'] as UserRole[] },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Calendar, label: 'Reservations', path: '/reservations' },
    { icon: Users, label: 'Customers', path: '/customers', roles: ['super-admin', 'restaurant-admin'] as UserRole[] },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics', roles: ['restaurant-admin', 'super-admin'] as UserRole[] },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];
}

function SidebarContent({
  isOpen,
  userRole,
  onNavigate,
  unreadReports = 0,
  onReportsOpened,
}: {
  isOpen: boolean;
  userRole: UserRole;
  onNavigate?: () => void;
  unreadReports?: number;
  onReportsOpened?: () => void;
}) {
  const menuItems = getMenuItems(userRole);
  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  return (
    <>
      <div className={`h-16 px-6 flex items-center border-b border-gray-200 dark:border-slate-800 ${!onNavigate ? '' : 'mt-12'}`}>
        <div className={`flex items-center gap-2 ${!isOpen && !onNavigate ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          {(isOpen || onNavigate) && <span className="font-bold text-gray-900 dark:text-white">DineConnect</span>}
        </div>
      </div>

      <nav className="flex-1 px-4 py-8">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  onNavigate?.();
                  if (item.label === 'Reports') onReportsOpened?.();
                }}
                end={item.label === 'Overview'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#F5E7DF] dark:bg-[#392B25] text-primary border border-[#E6C9B9] dark:border-[#6F493A]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-[#F5F0E8] dark:hover:bg-[#303831] border border-transparent'
                  }`
                }
              >
                <Icon size={20} className="flex-shrink-0" />
                {(isOpen || onNavigate) && (
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm font-medium">
                    <span>{item.label}</span>
                    {item.label === 'Reports' && unreadReports > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-none text-white" aria-label={`${unreadReports} unread reports`}>
                        {unreadReports > 99 ? '99+' : unreadReports}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {(isOpen || onNavigate) && (
          <NavLink
            to="/restaurants"
            onClick={onNavigate}
            className="mt-6 mx-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-primary dark:text-[#D9855F] bg-[#F5E7DF]/70 dark:bg-[#392B25] hover:bg-[#F0DCD1] dark:hover:bg-[#4A342B] border border-[#E6C9B9] dark:border-[#6F493A]"
          >
            <ExternalLink size={12} /> Public restaurant site
          </NavLink>
        )}
      </nav>
    </>
  );
}

export default function Sidebar({ userRole, unreadReports = 0, onReportsOpened }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 sticky top-0 h-screen self-start transition-all duration-300 hidden lg:flex flex-col`}
      >
        <SidebarContent isOpen={!isCollapsed} userRole={userRole} unreadReports={unreadReports} onReportsOpened={onReportsOpened} />

        <div className="border-t border-gray-200 dark:border-slate-800 p-4">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            {isCollapsed ? (
              <Menu size={18} />
            ) : (
              <>
                <X size={18} />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          isOpen
          userRole={userRole}
          unreadReports={unreadReports}
          onReportsOpened={onReportsOpened}
          onNavigate={() => setIsMobileOpen(false)}
        />
      </aside>
    </>
  );
}
