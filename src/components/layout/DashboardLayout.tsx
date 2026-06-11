import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import type { UserRole } from '../../types';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  title?: string;
}

export default function DashboardLayout({ children, userRole, title = 'Dashboard' }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-bg-light dark:bg-dark-bg">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar title={title} userRole={userRole} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
