import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

import Login from '../pages/auth/Login';
import SignUp from '../pages/auth/SignUp';

import CustomerOverview from '../pages/customer/Overview';
import Discover from '../pages/customer/Discover';
import RestaurantDetails from '../pages/customer/RestaurantDetails';
import CustomerPlaceholder from '../pages/customer/PlaceholderPage';

import AdminOverview from '../pages/admin/Overview';
import AdminAnalytics from '../pages/admin/Analytics';
import AdminPlaceholder from '../pages/admin/PlaceholderPage';

import RestaurantOverview from '../pages/restaurant/Overview';

function CustomerLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <DashboardLayout userRole="customer" title={title}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['super-admin']}>
      <DashboardLayout userRole="super-admin" title={title}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function RestaurantLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['restaurant-admin']}>
      <DashboardLayout userRole="restaurant-admin" title={title}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Customer Routes */}
      <Route path="/customer" element={<CustomerLayout title="Overview"><CustomerOverview /></CustomerLayout>} />
      <Route path="/customer/discover" element={<CustomerLayout title="Discover"><Discover /></CustomerLayout>} />
      <Route path="/customer/restaurants/:slug" element={<CustomerLayout title="Restaurant"><RestaurantDetails /></CustomerLayout>} />
      <Route path="/customer/orders" element={<CustomerLayout title="Orders"><CustomerPlaceholder title="Orders" description="Track all your orders in one place." /></CustomerLayout>} />
      <Route path="/customer/reservations" element={<CustomerLayout title="Reservations"><CustomerPlaceholder title="Reservations" description="Manage your table reservations." /></CustomerLayout>} />
      <Route path="/customer/favorites" element={<CustomerLayout title="Favorites"><CustomerPlaceholder title="Favorites" description="Your favorite restaurants." /></CustomerLayout>} />
      <Route path="/customer/reviews" element={<CustomerLayout title="Reviews"><CustomerPlaceholder title="Reviews" description="Your restaurant reviews." /></CustomerLayout>} />
      <Route path="/customer/notifications" element={<CustomerLayout title="Notifications"><CustomerPlaceholder title="Notifications" /></CustomerLayout>} />
      <Route path="/customer/settings" element={<CustomerLayout title="Settings"><CustomerPlaceholder title="Settings" /></CustomerLayout>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout title="Overview"><AdminOverview /></AdminLayout>} />
      <Route path="/admin/restaurants" element={<AdminLayout title="Restaurants"><AdminPlaceholder page="Restaurants" /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout title="Users"><AdminPlaceholder page="Users" /></AdminLayout>} />
      <Route path="/admin/orders" element={<AdminLayout title="Orders"><AdminPlaceholder page="Orders" /></AdminLayout>} />
      <Route path="/admin/reservations" element={<AdminLayout title="Reservations"><AdminPlaceholder page="Reservations" /></AdminLayout>} />
      <Route path="/admin/revenue" element={<AdminLayout title="Revenue"><AdminPlaceholder page="Revenue" /></AdminLayout>} />
      <Route path="/admin/analytics" element={<AdminLayout title="Analytics"><AdminAnalytics /></AdminLayout>} />
      <Route path="/admin/reports" element={<AdminLayout title="Reports"><AdminPlaceholder page="Reports" /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout title="Settings"><AdminPlaceholder page="Settings" /></AdminLayout>} />

      {/* Restaurant Admin Routes */}
      <Route path="/restaurant" element={<RestaurantLayout title="Overview"><RestaurantOverview /></RestaurantLayout>} />
      <Route path="/restaurant/orders" element={<RestaurantLayout title="Orders"><CustomerPlaceholder title="Orders" /></RestaurantLayout>} />
      <Route path="/restaurant/reservations" element={<RestaurantLayout title="Reservations"><CustomerPlaceholder title="Reservations" /></RestaurantLayout>} />
      <Route path="/restaurant/analytics" element={<RestaurantLayout title="Analytics"><RestaurantOverview /></RestaurantLayout>} />
      <Route path="/restaurant/settings" element={<RestaurantLayout title="Settings"><CustomerPlaceholder title="Settings" /></RestaurantLayout>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
