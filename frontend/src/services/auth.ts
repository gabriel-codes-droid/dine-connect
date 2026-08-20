// Real auth service using backend API
import type { UserRole } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'dineconnect_token';
const SESSION_KEY = 'dineconnect_session';

export interface Session {
  username: string;
  email: string;
  role: UserRole;
  authenticated: boolean;
  profilePicture?: string | null;
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
async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
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
      const data = await apiCall<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(e)}`);
      return data;
    } catch {
      return { exists: false };
    }
  },

  async checkUsername(username: string): Promise<{ exists: boolean }> {
    const u = username.trim();
    if (!u) return { exists: false };
    try {
      const data = await apiCall<{ exists: boolean }>(`/auth/check-username?username=${encodeURIComponent(u)}`);
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
      const data = await apiCall<{ token: string; user: { username: string; email: string; role: UserRole } }>('/auth/signup', {
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
    const { password } = input;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const data = await apiCall<{ token: string; user: { username: string; email: string; role: UserRole } }>('/auth/login', {
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

  // --- password reset ---

  async forgotPassword(email: string): Promise<void> {
    const e = email.toLowerCase().trim();
    if (!e) throw new Error('Email is required');
    // Don't use apiCall here — we want the 404 to bubble up so the UI can decide
    // whether to swallow it (we don't want to leak account existence to random
    // visitors, but we also want the user to know "no such account" when they
    // typed it themselves intentionally).
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
  },

  async resetPassword(input: {
    email: string;
    token: string;
    newPassword: string;
  }): Promise<Session> {
    const e = input.email.toLowerCase().trim();
    if (!e || !input.token || !input.newPassword) {
      throw new Error('Email, token, and new password are required');
    }
    if (input.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const data = await apiCall<{ token: string; user: { username: string; email: string; role: UserRole } }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({
          email: e,
          token: input.token,
          newPassword: input.newPassword,
        }),
      },
    );

    // Server returns a fresh JWT on successful reset, so log the user in immediately
    setToken(data.token);

    const session: Session = {
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
      authenticated: true,
    };

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.sessionStorage.setItem('dineconnect_role', data.user.role);
    window.sessionStorage.setItem('dineconnect_email', data.user.email);
    window.sessionStorage.setItem('dineconnect_authenticated', 'true');
    window.sessionStorage.setItem('dineconnect_username', data.user.username);

    return session;
  },

  // ---- email verification (change email) ----
  async sendVerificationCode(newEmail: string): Promise<{ message: string }> {
    const e = newEmail.toLowerCase().trim();
    if (!e) throw new Error('Email is required');
    return apiCall<{ message: string }>('/users/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ newEmail: e }),
    });
  },

  async confirmEmailChange(code: string): Promise<{ email: string }> {
    if (!code) throw new Error('Verification code is required');
    const data = await apiCall<{ message: string; email: string; user: any }>(
      '/users/confirm-email-change',
      { method: 'POST', body: JSON.stringify({ code }) }
    );
    // Update session storage with new email
    const session = auth.getSession();
    if (session) {
      session.email = data.email;
      (session as any).profilePicture = data.user?.profilePicture ?? session.profilePicture;
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.sessionStorage.setItem('dineconnect_email', data.email);
    }
    return { email: data.email };
  },

  // ---- profile picture ----
  async updateProfilePicture(url: string): Promise<void> {
    if (!url) throw new Error('Picture URL is required');
    const data = await apiCall<{ message: string; profilePicture: string }>(
      '/users/me/profile-picture',
      { method: 'PATCH', body: JSON.stringify({ url }) }
    );
    const session = auth.getSession();
    if (session) {
      session.profilePicture = data.profilePicture;
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  },
};
