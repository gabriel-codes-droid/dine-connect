import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { logOut, signIn, signUp, subscribeToAuth } from '../services/authService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, fullName: string, role?: UserRole) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((profile) => {
      setUser(profile);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const profile = await signIn(email, password);
    setUser(profile);
    return profile;
  };

  const register = async (email: string, password: string, fullName: string, role?: UserRole) => {
    const profile = await signUp(email, password, fullName, role);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
