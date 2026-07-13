// Local auth "service" for the demo. No backend yet — uses localStorage.
// Mirrors the shape of a real API so we can swap to fetch/axios later
// without touching the pages.

import type { UserRole } from '../types';

const USERS_KEY = 'dineconnect_users';
const SESSION_KEY = 'dineconnect_session';

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  password: string; // demo only — never do this in production
  role: UserRole;
  createdAt: string;
}

export interface Session {
  username: string;
  email: string;
  role: UserRole;
  authenticated: boolean;
}

function readUsers(): StoredUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const auth = {
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const e = email.toLowerCase().trim();
    if (!e) return { exists: false };
    const users = readUsers();
    return { exists: users.some((u) => u.email === e) };
  },

  async checkUsername(username: string): Promise<{ exists: boolean }> {
    const u = username.trim();
    if (!u) return { exists: false };
    const users = readUsers();
    return { exists: users.some((x) => x.username === u) };
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

    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      const err = new Error('That email is already registered. Try signing in instead.');
      (err as Error & { field?: string }).field = 'email';
      throw err;
    }
    if (users.some((u) => u.username === username)) {
      const err = new Error('That username is already taken. Please choose another.');
      (err as Error & { field?: string }).field = 'username';
      throw err;
    }

    const newUser: StoredUser = {
      id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      username,
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);

    const session: Session = { username, email, role, authenticated: true };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // mirror keys the existing app already reads (Navbar / Sidebar)
    window.sessionStorage.setItem('dineconnect_role', role);
    window.sessionStorage.setItem('dineconnect_email', email);
    window.sessionStorage.setItem('dineconnect_authenticated', 'true');
    window.sessionStorage.setItem('dineconnect_username', username);
    return session;
  },

  async login(input: { email: string; password: string; role: UserRole }): Promise<Session> {
    const email = input.email.toLowerCase().trim();
    const { password, role } = input;
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('No account found with that email');
    }
    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const session: Session = { username: user.username, email: user.email, role, authenticated: true };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.sessionStorage.setItem('dineconnect_role', role);
    window.sessionStorage.setItem('dineconnect_email', email);
    window.sessionStorage.setItem('dineconnect_authenticated', 'true');
    window.sessionStorage.setItem('dineconnect_username', user.username);
    return session;
  },

  logout() {
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
