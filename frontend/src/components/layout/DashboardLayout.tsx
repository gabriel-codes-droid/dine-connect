import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import type { UserRole } from '../../types';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: UserRole;
  userName?: string;
  title?: string;
}

export default function DashboardLayout({
  children,
  userRole = 'super-admin',
  userName = 'John Doe',
  title = 'Dashboard',
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-bg-light dark:bg-slate-950 transition-colors">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar userName={userName} userRole={userRole} title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 text-gray-900 dark:text-gray-100">{children}</div>
        </main>
      </div>
    </div>
  );
}
