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
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];
}

function SidebarContent({
  isOpen,
  userRole,
  onNavigate,
}: {
  isOpen: boolean;
  userRole: UserRole;
  onNavigate?: () => void;
}) {
  const menuItems = getMenuItems(userRole);
  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  return (
    <>
      <div className={`h-16 px-6 flex items-center border-b border-gray-200 ${!onNavigate ? '' : 'mt-12'}`}>
        <div className={`flex items-center gap-2 ${!isOpen && !onNavigate ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          {(isOpen || onNavigate) && <span className="font-bold text-gray-900">DineConnect</span>}
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                end={item.label === 'Overview'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-primary border border-indigo-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`
                }
              >
                <Icon size={20} className="flex-shrink-0" />
                {(isOpen || onNavigate) && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {(isOpen || onNavigate) && (
          <NavLink
            to="/restaurants"
            onClick={onNavigate}
            className="mt-6 mx-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-100"
          >
            <ExternalLink size={12} /> Public restaurant site
          </NavLink>
        )}
      </nav>
    </>
  );
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-lg bg-white text-gray-900 border border-gray-200 shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 hidden lg:flex flex-col`}
      >
        <SidebarContent isOpen={!isCollapsed} userRole={userRole} />

        <div className="border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
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
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          isOpen
          userRole={userRole}
          onNavigate={() => setIsMobileOpen(false)}
        />
      </aside>
    </>
  );
}
