import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/auth';
import type { UserRole } from '../../types';

function dashboardPath(role: UserRole): string {
  if (role === 'super-admin') return '/admin';
  if (role === 'restaurant-admin') return '/restaurant';
  return '/customer';
}

export default function PublicAccountControls() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => auth.getSession());

  useEffect(() => auth.subscribeToAuthState(setSession), []);

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to={dashboardPath(session.role)}
          className="hidden rounded-md px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-orange-300 sm:inline-flex"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => {
            auth.logout();
            setSession(null);
            navigate('/');
          }}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/signup"
        className="hidden rounded-md px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-orange-300 sm:inline-flex"
      >
        Sign up
      </Link>
      <Link
        to="/login"
        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8F462E]"
      >
        Sign in
      </Link>
    </div>
  );
}
