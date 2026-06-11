import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { restaurants, recentOrders, upcomingReservations } from '../../data/mockData';

const pageData: Record<string, { title: string; description: string }> = {
  Restaurants: { title: 'Restaurant Management', description: 'Manage all restaurants on the platform.' },
  Users: { title: 'User Management', description: 'View and manage platform users.' },
  Orders: { title: 'Order Monitoring', description: 'Monitor all orders across the platform.' },
  Reservations: { title: 'Reservation Monitoring', description: 'Track all reservations in real-time.' },
  Revenue: { title: 'Revenue Monitoring', description: 'Platform revenue and financial metrics.' },
  Reports: { title: 'Reports', description: 'Generate and download platform reports.' },
  Settings: { title: 'Settings', description: 'Platform configuration and preferences.' },
};

export default function AdminPlaceholderPage({ page }: { page: string }) {
  const info = pageData[page] ?? { title: page, description: '' };

  return (
    <div className="page-container">
      <div>
        <h2 className="section-title">{info.title}</h2>
        <p className="section-subtitle">{info.description}</p>
      </div>

      {page === 'Restaurants' && (
        <DataTable
          keyField="id"
          data={restaurants.map((r) => ({ id: r.id, name: r.name, cuisine: r.cuisine, rating: r.rating, orders: r.completedOrders, status: 'Active' }))}
          columns={[
            { key: 'name', header: 'Restaurant' },
            { key: 'cuisine', header: 'Cuisine' },
            { key: 'rating', header: 'Rating', render: (r) => <Badge variant="primary">{r.rating} ★</Badge> },
            { key: 'orders', header: 'Orders', render: (r) => r.orders.toLocaleString() },
            { key: 'status', header: 'Status', render: () => <Badge variant="success">Active</Badge> },
          ]}
        />
      )}

      {page === 'Orders' && (
        <DataTable
          keyField="id"
          data={recentOrders}
          columns={[
            { key: 'restaurantName', header: 'Restaurant' },
            { key: 'items', header: 'Items' },
            { key: 'total', header: 'Total' },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Delivered' ? 'success' : 'warning'}>{r.status}</Badge> },
          ]}
        />
      )}

      {page === 'Reservations' && (
        <DataTable
          keyField="id"
          data={upcomingReservations}
          columns={[
            { key: 'restaurantName', header: 'Restaurant' },
            { key: 'date', header: 'Date' },
            { key: 'time', header: 'Time' },
            { key: 'guests', header: 'Guests' },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Confirmed' ? 'success' : 'warning'}>{r.status}</Badge> },
          ]}
        />
      )}

      {!['Restaurants', 'Orders', 'Reservations'].includes(page) && (
        <div className="card-base p-16 text-center">
          <div className="w-16 h-16 bg-gradient-glass rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
          <p className="text-text-muted max-w-md mx-auto">{info.description}</p>
        </div>
      )}
    </div>
  );
}
