import type { ComponentType } from 'react';

export type UserRole = 'super-admin' | 'restaurant-admin' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export interface SidebarItem {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
  roles?: UserRole[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  distance: string;
  deliveryTime: string;
  completedOrders: number;
  coverImage: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  description: string;
  isTrending?: boolean;
  isNew?: boolean;
  isNearby?: boolean;
  revenueGrowth?: number;
  reservationGrowth?: number;
  menu: MenuCategory[];
  reviews: Review[];
  gallery: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: string;
  total: string;
  status: 'Delivered' | 'In Progress' | 'Cancelled' | 'Pending';
  date: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface KPIData {
  title: string;
  value: string | number;
  change?: number;
  icon: import('react').ReactNode;
  bgColor?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface LeaderboardEntry {
  rank: number;
  restaurant: Restaurant;
  score: number;
  orders: number;
  revenueGrowth: number;
  rating: number;
}
