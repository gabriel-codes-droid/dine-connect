import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../pages/Login';
import AdminOverview from '../pages/AdminOverview';
import RestaurantOverview from '../pages/RestaurantOverview';
import CustomerOverview from '../pages/CustomerOverview';
import type { UserRole } from '../types';

function getStoredRole(): UserRole | null {
  const role = sessionStorage.getItem('dineconnect_role');
  if (role === 'super-admin' || role === 'restaurant-admin' || role === 'customer') {
    return role;
  }
  return null;
}

function PlaceholderPage({ title }: { title: string }) {
  const role = getStoredRole();
  if (!role) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout userRole={role} userName="Sarah Anderson" title={title}>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">This section is coming soon.</p>
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
    <DashboardLayout userRole={role} userName="Sarah Anderson" title={title}>
      {children}
    </DashboardLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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

      <Route path="/restaurants" element={<PlaceholderPage title="Restaurants" />} />
      <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
      <Route path="/reservations" element={<PlaceholderPage title="Reservations" />} />
      <Route path="/customers" element={<PlaceholderPage title="Customers" />} />
      <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
      <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
      <Route path="/settings" element={<PlaceholderPage title="Settings" />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
