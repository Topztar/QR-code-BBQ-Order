import { apiFetch } from './api';

export const sessionAuth = {
  getToken: () => {
    try {
      return localStorage.getItem('sabay_jwt_token');
    } catch { return null; }
  },
  setToken: (token: string) => {
    try {
      localStorage.setItem('sabay_jwt_token', token);
      localStorage.setItem('sabay-staff-auth', 'true');
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem('sabay_jwt_token');
      localStorage.removeItem('sabay-staff-auth');
    } catch {}
  },
  isAuthenticated: () => {
    try {
      return localStorage.getItem('sabay-staff-auth') === 'true' && !!localStorage.getItem('sabay_jwt_token');
    } catch { return false; }
  },
  verify: async (): Promise<boolean> => {
    if (!sessionAuth.isAuthenticated()) {
      sessionAuth.clear();
      return false;
    }
    // If device is currently offline, preserve authenticated state locally
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }
    try {
      const res = await apiFetch('/api/staff/verify');
      if (res.ok) {
        return true;
      }
      // Only clear credentials if the server explicitly tells us the token is invalid/expired
      if (res.status === 401 || res.status === 403) {
        sessionAuth.clear();
        return false;
      }
      // For transient 5xx server issues, retain existing session to prevent work disruption
      return true;
    } catch (e) {
      console.warn('Session verification network check failed, preserving local session:', e);
      return true;
    }
  }
};
