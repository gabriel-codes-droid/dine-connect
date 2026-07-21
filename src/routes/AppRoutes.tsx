import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../pages/Login';
import Signup from '../pages/auth/Signup';
import AdminOverview from '../pages/AdminOverview';
import RestaurantOverview from '../pages/RestaurantOverview';
import CustomerOverview from '../pages/CustomerOverview';
import Restaurants from '../pages/Restaurants';
import RestaurantDetail from '../pages/RestaurantDetail';
import Home from '../pages/Home';
import type { UserRole } from '../types';
import { auth } from '../services/auth';

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

function PlaceholderPage({ title }: { title: string }) {
  const role = getStoredRole();
  if (!role) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout userRole={role} userName={getStoredName()} title={title}>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400">This section is coming soon.</p>
      </div>
    </DashboardLayout>
  );
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
  if (storedRole !== role) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout userRole={role} userName={getStoredName()} title={title}>
      {children}
    </DashboardLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurants/:id" element={<RestaurantDetail />} />

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

      <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
      <Route path="/reservations" element={<PlaceholderPage title="Reservations" />} />
      <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
      <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
      <Route path="/settings" element={<PlaceholderPage title="Settings" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
