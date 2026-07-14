// Real auth service using backend API
import type { UserRole } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'dineconnect_token';
const SESSION_KEY = 'dineconnect_session';

export interface Session {
  username: string;
  email: string;
  role: UserRole;
  authenticated: boolean;
}

// Helper to get token
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Helper to set token
function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Helper to clear token
function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// API helper with auth
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

export const auth = {
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const e = email.toLowerCase().trim();
    if (!e) return { exists: false };
    try {
      const data = await apiCall(`/auth/check-email?email=${encodeURIComponent(e)}`);
      return data;
    } catch {
      return { exists: false };
    }
  },

  async checkUsername(username: string): Promise<{ exists: boolean }> {
    const u = username.trim();
    if (!u) return { exists: false };
    try {
      const data = await apiCall(`/auth/check-username?username=${encodeURIComponent(u)}`);
      return data;
    } catch {
      return { exists: false };
    }
  },

  async signup(input: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<Session> {
    const username = input.username.trim();
    const email = input.email.toLowerCase().trim();
    const { password, role } = input;

    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      const data = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role }),
      });

      setToken(data.token);
      
      const session: Session = { 
        username: data.user.username, 
        email: data.user.email, 
        role: data.user.role, 
        authenticated: true 
      };
      
      // Store session for compatibility
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.sessionStorage.setItem('dineconnect_role', data.user.role);
      window.sessionStorage.setItem('dineconnect_email', data.user.email);
      window.sessionStorage.setItem('dineconnect_authenticated', 'true');
      window.sessionStorage.setItem('dineconnect_username', data.user.username);
      
      return session;
    } catch (err) {
      const error = err as Error & { field?: string };
      if (error.message.includes('email')) {
        (error as Error & { field?: string }).field = 'email';
      } else if (error.message.includes('username')) {
        (error as Error & { field?: string }).field = 'username';
      }
      throw error;
    }
  },

  async login(input: { email: string; password: string; role: UserRole }): Promise<Session> {
    const email = input.email.toLowerCase().trim();
    const { password, role } = input;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      
      const session: Session = { 
        username: data.user.username, 
        email: data.user.email, 
        role: data.user.role, 
        authenticated: true 
      };
      
      // Store session for compatibility
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.sessionStorage.setItem('dineconnect_role', data.user.role);
      window.sessionStorage.setItem('dineconnect_email', data.user.email);
      window.sessionStorage.setItem('dineconnect_authenticated', 'true');
      window.sessionStorage.setItem('dineconnect_username', data.user.username);
      
      return session;
    } catch (err) {
      throw err;
    }
  },

  logout() {
    clearToken();
    window.sessionStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem('dineconnect_role');
    window.sessionStorage.removeItem('dineconnect_email');
    window.sessionStorage.removeItem('dineconnect_authenticated');
    window.sessionStorage.removeItem('dineconnect_username');
  },

  getSession(): Session | null {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },
};
