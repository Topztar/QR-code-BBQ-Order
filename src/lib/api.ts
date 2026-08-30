import { getToken } from 'firebase/app-check';
import { appCheck } from './firebase';

export const getAuthHeader = async () => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('sabay_jwt_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (appCheck) {
    try {
      const appCheckTokenResponse = await getToken(appCheck, false);
      headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
    } catch (err) {
      console.warn('App Check Token 獲取失敗', err);
    }
  }
  return headers;
};

export const apiFetch = async (url: string, options: any = {}) => {
  const authHeaders = await getAuthHeader();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...authHeaders,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  const response = await fetch(url, { ...options, headers, signal: controller.signal });
  clearTimeout(timeoutId);
  if (response.status === 401 || response.status === 403) {
    // 如果 token 失效，清除並可能需要重新驗證 PIN
    localStorage.removeItem('sabay_jwt_token');
  }
  return response;
};
