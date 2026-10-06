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
  const skipAuth = options.skipAuth ?? (isPublicGet && !options.forceAuth);

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

  // 🛡️ 區分 401 (認證失效) 與 403 (權限不足/規則拒絕)
  if (response.status === 401) {
    // 401 Unauthorized: 憑證已過期或失效，徹底清除所有快取並派發登出事件
    try {
      localStorage.removeItem('sabay_jwt_token');
      localStorage.removeItem('sabay-staff-auth');
      sessionStorage.removeItem('staff_token');
      sessionStorage.removeItem('sabay_jwt_token');
      sessionStorage.removeItem('sabay-staff-auth');
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sabay_auth_expired', { detail: { url, status: 401 } }));
    }
  } else if (response.status === 403) {
    // 403 Forbidden: 憑證有效但操作被拒 (如權限不符或業務規則限制)，保留憑證不觸發無限登出迴圈
    console.warn(`[apiFetch] 403 Forbidden for ${url}. Preserving staff session (permission/rule constraint).`);
  }

  return response;
};
