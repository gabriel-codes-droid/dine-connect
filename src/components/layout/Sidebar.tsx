import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, ShoppingBag, Calendar, Heart, Star, Bell, Settings,
  Building2, Users, TrendingUp, FileText, DollarSign, BarChart3, Menu, X,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface SidebarProps {
  userRole: UserRole;
}

const customerItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/customer' },
  { icon: Search, label: 'Discover Restaurants', path: '/customer/discover' },
  { icon: ShoppingBag, label: 'Orders', path: '/customer/orders' },
  { icon: Calendar, label: 'Reservations', path: '/customer/reservations' },
  { icon: Heart, label: 'Favorites', path: '/customer/favorites' },
  { icon: Star, label: 'Reviews', path: '/customer/reviews' },
  { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
  { icon: Settings, label: 'Settings', path: '/customer/settings' },
];

const adminItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Building2, label: 'Restaurants', path: '/admin/restaurants' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
  { icon: Calendar, label: 'Reservations', path: '/admin/reservations' },
  { icon: DollarSign, label: 'Revenue', path: '/admin/revenue' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: FileText, label: 'Reports', path: '/admin/reports' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const restaurantItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/restaurant' },
  { icon: ShoppingBag, label: 'Orders', path: '/restaurant/orders' },
  { icon: Calendar, label: 'Reservations', path: '/restaurant/reservations' },
  { icon: TrendingUp, label: 'Analytics', path: '/restaurant/analytics' },
  { icon: Settings, label: 'Settings', path: '/restaurant/settings' },
];

function getItems(role: UserRole) {
  if (role === 'super-admin') return adminItems;
  if (role === 'restaurant-admin') return restaurantItems;
  return customerItems;
}

function SidebarContent({ isOpen, userRole, onNavigate }: { isOpen: boolean; userRole: UserRole; onNavigate?: () => void }) {
  const items = getItems(userRole);

  return (
    <>
      <div className={`h-16 px-6 flex items-center border-b border-border dark:border-dark-border ${onNavigate ? 'mt-12' : ''}`}>
        <div className={`flex items-center gap-3 ${!isOpen && !onNavigate ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glass">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          {(isOpen || onNavigate) && (
            <div>
              <span className="font-bold text-text-main dark:text-dark-text">DineConnect</span>
              <p className="text-[10px] text-text-muted dark:text-dark-muted uppercase tracking-widest">Platform</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.label === 'Overview'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-glass'
                      : 'text-text-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-text-main dark:hover:text-dark-text'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {(isOpen || onNavigate) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-dark-card text-text-main dark:text-dark-text border border-border dark:border-dark-border shadow-card"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`${isCollapsed ? 'w-[72px]' : 'w-64'} bg-white dark:bg-dark-card border-r border-border dark:border-dark-border h-screen sticky top-0 transition-all duration-300 hidden lg:flex flex-col`}>
        <SidebarContent isOpen={!isCollapsed} userRole={userRole} />
        <div className="border-t border-border dark:border-dark-border p-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-text-muted dark:text-dark-muted hover:text-text-main dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg rounded-xl transition-all text-sm"
          >
            {isCollapsed ? <Menu size={16} /> : <><X size={16} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {isMobileOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40" onClick={() => setIsMobileOpen(false)} aria-hidden="true" />}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-dark-card border-r border-border dark:border-dark-border z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent isOpen userRole={userRole} onNavigate={() => setIsMobileOpen(false)} />
      </aside>
    </>
  );
}
