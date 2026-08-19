import type { Theme } from '../types/theme';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  return localStorage.getItem('dineconnect_token');
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

export const preferences = {
  async getTheme(): Promise<Theme | null> {
    if (!getToken()) return null;
    try {
      const data = await apiCall<{ user: { preferences?: { theme?: Theme } } }>('/users/me');
      return data.user?.preferences?.theme ?? 'light';
    } catch {
      return null;
    }
  },

  async setTheme(theme: Theme): Promise<void> {
    if (!getToken()) return;
    await apiCall('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    });
  },
};
