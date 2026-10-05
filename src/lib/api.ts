import { getToken } from 'firebase/app-check';
import { appCheck } from './firebase';

let _cachedAppCheckToken: string | null = null;
let _appCheckTokenExpiry: number = 0;

export const getAuthHeader = async (opts: { skipAuth?: boolean } = {}) => {
  const headers: Record<string, string> = {};
  if (!opts.skipAuth) {
    const token = localStorage.getItem('sabay_jwt_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (appCheck) {
    try {
      const now = Date.now();
      if (!_cachedAppCheckToken || now > _appCheckTokenExpiry) {
        const appCheckTokenResponse = await getToken(appCheck, false);
        _cachedAppCheckToken = appCheckTokenResponse.token;
        _appCheckTokenExpiry = now + 55 * 60 * 1000;
      }
      headers['X-Firebase-AppCheck'] = _cachedAppCheckToken;
    } catch (err) {
      console.warn('App Check Token 獲取失敗 (暫緩重試 60 秒):', err);
      _appCheckTokenExpiry = Date.now() + 60 * 1000;
    }
  }
  return headers;
};

export const apiFetch = async (url: string, options: any = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const isPublicGet = method === 'GET' && /^\/api\/(bootstrap|store-status|menu|categories|settings\/version)/.test(url);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('sabay_jwt_token');
  const skipAuth = options.skipAuth ?? (isPublicGet && !options.forceAuth && !hasToken);

  const authHeaders = await getAuthHeader({ skipAuth });
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
