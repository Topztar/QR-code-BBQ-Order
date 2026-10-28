import { getToken } from 'firebase/app-check';
import { appCheck } from './firebase';

let _cachedAppCheckToken: string | null = null;
let _appCheckTokenExpiry: number = 0;

export const getAuthHeader = async (opts: { skipAuth?: boolean; skipAppCheck?: boolean } = {}) => {
  const headers: Record<string, string> = {};
  if (!opts.skipAuth) {
    const token = (typeof localStorage !== 'undefined' ? localStorage.getItem('sabay_jwt_token') : null) || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('staff_token') : null);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (appCheck && !opts.skipAppCheck) {
    try {
      const now = Date.now();
      // If we have a valid unexpired token, reuse it directly
      if (_cachedAppCheckToken && now <= _appCheckTokenExpiry) {
        headers['X-Firebase-AppCheck'] = _cachedAppCheckToken;
      } else if (now > _appCheckTokenExpiry) {
        // Enforce 2.5s hard timeout for App Check to prevent iOS WebKit background suspension hangs
        const tokenPromise = getToken(appCheck, false);
        const timeoutPromise = new Promise<{ token: string }>((_, reject) =>
          setTimeout(() => reject(new Error('AppCheck getToken timeout (2500ms)')), 2500)
        );
        const appCheckTokenResponse = await Promise.race([tokenPromise, timeoutPromise]);
        _cachedAppCheckToken = appCheckTokenResponse.token;
        _appCheckTokenExpiry = now + 55 * 60 * 1000;
        headers['X-Firebase-AppCheck'] = _cachedAppCheckToken;
      }
    } catch (err) {
      console.warn('App Check Token 獲取超時或失敗 (暫緩重試 60 秒，軟性放行):', err);
      // Back off for 60 seconds so subsequent requests don't repeatedly block
      _appCheckTokenExpiry = Date.now() + 60 * 1000;
    }
  }
  return headers;
};

export const apiFetch = async (url: string, options: any = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const isPublicGet = method === 'GET' && /^\/api\/(bootstrap|store-status|menu|categories|settings\/version)/.test(url);
  const skipAuth = options.skipAuth ?? (isPublicGet && !options.forceAuth && !/[?&]fresh=/.test(url));

  // 🛡️ Global timeout controller starts BEFORE getAuthHeader to guarantee bounded execution on iOS WebKit
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 20000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // ⚡ 公開 GET (bootstrap/store-status/menu) 不等待 reCAPTCHA App Check：
    // 後端 requireAppCheck 為軟性放行，iOS WebKit (Safari/Firefox, ITP) 取得 token 常耗時數秒，阻塞菜單首載
    const authHeaders = await getAuthHeader({ skipAuth, skipAppCheck: isPublicGet && !options.forceAuth });
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...authHeaders,
    };

    let signal = controller.signal;
    if (options.signal) {
      if (typeof (AbortSignal as any).any === 'function') {
        signal = (AbortSignal as any).any([options.signal, controller.signal]);
      } else if (options.signal.aborted) {
        controller.abort();
      } else {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    const response = await fetch(url, { ...options, headers, signal });

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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sabay_permission_denied', { detail: { url, status: 403, message: '權限不足 (Insufficient permissions)' } }));
      }
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};
