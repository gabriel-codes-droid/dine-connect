import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import type { UserRole } from '../../types';
import { auth } from '../../services/auth';
import { reportService } from '../../firebase';
import type { IssueReport } from '../../firebase';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: UserRole;
  userName?: string;
  title?: string;
}

function reportTime(value: IssueReport['createdAt']): number {
  if (!value) return 0;
  if (typeof (value as any).toMillis === 'function') return (value as any).toMillis();
  const date = value instanceof Date ? value : new Date(value as any);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export default function DashboardLayout({
  children,
  userRole = 'super-admin',
  userName = 'John Doe',
  title = 'Dashboard',
}: DashboardLayoutProps) {
  const [unreadReports, setUnreadReports] = useState(0);
  const sessionUid = auth.getSession()?.uid;
  const location = useLocation();

  useEffect(() => {
    if (userRole !== 'restaurant-admin' || !sessionUid) {
      setUnreadReports(0);
      return;
    }

    if (location.pathname === '/reports') {
      reportService.markSeen(sessionUid);
      setUnreadReports(0);
      return;
    }

    const lastSeenAt = reportService.getLastSeenAt(sessionUid);
    const unsubscribe = reportService.subscribeToReports(null, (reports) => {
      const unread = reports.filter((report) => {
        const createdAt = reportTime(report.createdAt);
        return report.reporterId !== sessionUid && createdAt > lastSeenAt;
      }).length;
      setUnreadReports(unread);
    });

    return () => unsubscribe();
  }, [location.pathname, sessionUid, userRole]);

  const handleReportsOpened = () => {
    if (sessionUid) {
      reportService.markSeen(sessionUid);
      setUnreadReports(0);
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-gray-900 transition-colors dark:bg-dark-bg dark:text-gray-100 overflow-hidden">
      <div className="flex h-screen min-w-0">
        <Sidebar userRole={userRole} unreadReports={unreadReports} onReportsOpened={handleReportsOpened} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar userName={userName} userRole={userRole} title={title} />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="min-h-full p-4 pb-10 sm:p-6 sm:pb-12">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
