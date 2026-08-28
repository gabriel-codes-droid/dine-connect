import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../pages/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import AdminOverview from '../pages/AdminOverview';
import RestaurantOverview from '../pages/RestaurantOverview';
import CustomerOverview from '../pages/CustomerOverview';
import Restaurants from '../pages/Restaurants';
import RestaurantDetail from '../pages/RestaurantDetail';
import Home from '../pages/Home';
import Orders from '../pages/Orders';
import Reservations from '../pages/Reservations';
import Analytics from '../pages/Analytics';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import type { UserRole } from '../types';
import { auth } from '../services/auth';
import Customers from '../pages/Customers';

function getStoredRole(): UserRole | null {
  const session = auth.getSession();
  if (!session?.authenticated) return null;
  if (session.role === 'super-admin' || session.role === 'restaurant-admin' || session.role === 'customer') {
    return session.role;
  }
  return null;
}

function getStoredName(): string {
  return auth.getSession()?.username || 'Sarah Anderson';
}

function getDashboardPath(role: UserRole): string {
  if (role === 'super-admin') return '/admin';
  if (role === 'restaurant-admin') return '/restaurant';
  return '/customer';
}

function ProtectedDashboard({
  role,
  title,
  children,
}: {
  role: UserRole;
  title: string;
  children: ReactNode;
}) {
  const storedRole = getStoredRole();
  if (!storedRole) return <Navigate to="/login" replace />;
  // Keep authenticated users inside their own dashboard when a role-specific route is opened.
  if (storedRole !== role) return <Navigate to={getDashboardPath(storedRole)} replace />;

  return (
    <DashboardLayout userRole={role} userName={getStoredName()} title={title}>
      {children}
    </DashboardLayout>
  );
}

function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const storedRole = getStoredRole();
  if (!storedRole) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(storedRole)) return <Navigate to={getDashboardPath(storedRole)} replace />;

  return <>{children}</>;
}

// Public route that preserves authentication when navigating from protected areas
function PublicRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/restaurants" element={<PublicRoute><Restaurants /></PublicRoute>} />
      <Route path="/restaurants/:id" element={<PublicRoute><RestaurantDetail /></PublicRoute>} />

      <Route
        path="/admin"
        element={
          <ProtectedDashboard role="super-admin" title="Overview">
            <AdminOverview />
          </ProtectedDashboard>
        }
      />
      <Route
        path="/restaurant"
        element={
          <ProtectedDashboard role="restaurant-admin" title="Overview">
            <RestaurantOverview />
          </ProtectedDashboard>
        }
      />
      <Route
        path="/customer"
        element={
          <ProtectedDashboard role="customer" title="Overview">
            <CustomerOverview />
          </ProtectedDashboard>
        }
      />

      <Route 
        path="/orders" 
        element={
          <ProtectedRoute allowedRoles={['customer', 'restaurant-admin', 'super-admin']}>
            <Orders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reservations" 
        element={
          <ProtectedRoute allowedRoles={['customer', 'restaurant-admin', 'super-admin']}>
            <Reservations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['restaurant-admin', 'super-admin']}>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRoles={['customer', 'restaurant-admin', 'super-admin']}>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customers" 
        element={
          <ProtectedRoute allowedRoles={['restaurant-admin', 'super-admin']}>
            <Customers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={['customer', 'restaurant-admin', 'super-admin']}>
            <Settings />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
