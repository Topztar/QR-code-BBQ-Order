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
    try {
      const res = await apiFetch('/api/staff/verify');
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn('Session verification failed');
    }
    sessionAuth.clear();
    return false;
  }
};
