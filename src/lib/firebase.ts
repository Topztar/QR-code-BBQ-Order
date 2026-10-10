import { initializeApp } from 'firebase/app';
import type { User } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  persistentSingleTabManager,
  memoryLocalCache, 
  connectFirestoreEmulator, 
  getFirestore, 
  Firestore, 
  enableNetwork 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);

export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07';

const isEmulatorMode = (import.meta as any).env?.VITE_USE_FIREBASE_EMULATOR === 'true';

let firestoreInstance: Firestore;

// Helper to check indexedDB availability to prevent Firestore cache boot failures in sandboxed iframes and iOS WebKit Private Browsing
const checkIndexedDB = (): boolean => {
  try {
    if (typeof window === 'undefined' || !('indexedDB' in window) || !window.indexedDB) {
      return false;
    }
    // Safari Private Browsing / strict sandboxes throw SecurityError on open() synchronously
    const probeReq = window.indexedDB.open('__sabay_idb_probe__');
    probeReq.onerror = (e) => {
      // Prevent unhandled error event bubbling
      e.preventDefault?.();
    };
    return true;
  } catch (err) {
    console.warn('[Firebase] IndexedDB probe blocked (WebKit/Private Mode/Sandbox):', err);
    return false;
  }
};

const isIOSSafari = typeof navigator !== 'undefined' && 
  /iPad|iPhone|iPod/.test(navigator.userAgent) && 
  /Safari/.test(navigator.userAgent) && 
  !/Chrome/.test(navigator.userAgent);

// Check if multi-tab coordination (BroadcastChannel) is supported
const isBroadcastChannelSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;

try {
  if (isEmulatorMode) {
    // 🛡️ 模擬器環境強制使用記憶體快取，隔離生產環境 IndexedDB 髒資料與 Mutation Queue 衝突
    firestoreInstance = initializeFirestore(app, {
      localCache: memoryLocalCache()
    }, FIRESTORE_DATABASE_ID);

    connectFirestoreEmulator(firestoreInstance, 'localhost', 8080);
    console.log('[Firebase] Connected to Local Firestore Emulator (Port 8080) with memoryLocalCache.');
  } else if (checkIndexedDB()) {
    try {
      // WebKit / iOS compatibility:
      // If BroadcastChannel is unavailable or on iOS Safari, multi-tab locks can deadlock.
      // Use persistentMultipleTabManager if BroadcastChannel exists, or fallback to persistentSingleTabManager.
      const tabManager = (isBroadcastChannelSupported && !isIOSSafari) 
        ? persistentMultipleTabManager() 
        : persistentSingleTabManager();

      firestoreInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager,
          cacheSizeBytes: isIOSSafari ? 20 * 1024 * 1024 : 100 * 1024 * 1024 // 縮減 iOS 配額
        })
      }, FIRESTORE_DATABASE_ID);
    } catch (cacheErr: any) {
      console.warn('[Firebase Cache] Persistent cache setup failed. Degrading to memoryLocalCache:', cacheErr);
      firestoreInstance = initializeFirestore(app, {
        localCache: memoryLocalCache()
      }, FIRESTORE_DATABASE_ID);
    }
  } else {
    // IndexedDB completely unavailable / restricted
    try {
      firestoreInstance = initializeFirestore(app, {
        localCache: memoryLocalCache()
      }, FIRESTORE_DATABASE_ID);
    } catch {
      firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
    }
  }
} catch (error: any) {
  if (error?.code === 'failed-precondition') {
    // Firestore already initialized (e.g. strict mode double-render), directly use it
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  } else {
    console.warn('[Firebase] Firestore initialization cache fallback or double-init check:', error);
    try {
      // IndexedDB 鎖定或孤兒租約：安全降級至記憶體快取
      firestoreInstance = initializeFirestore(app, {
        localCache: memoryLocalCache()
      }, FIRESTORE_DATABASE_ID);
      console.error('[FinOps Alert] Downgraded to memoryLocalCache due to IndexedDB failure. Cache miss rate may spike!');
    } catch (err: any) {
      if (err?.code !== 'failed-precondition') {
        console.error('[Firebase] Critical fallback initialization failed:', err);
      }
      firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
    }
  }
}

export const db = firestoreInstance;

// Asynchronous probe to detect and quietly handle latent IndexedDB SecurityError / QuotaExceededError in WebKit
if (typeof window !== 'undefined' && !isEmulatorMode) {
  setTimeout(async () => {
    try {
      const { doc, getDocFromCache } = await import('firebase/firestore');
      const probeDoc = doc(firestoreInstance, '_system', 'probe');
      await getDocFromCache(probeDoc).catch((e: any) => {
        // Document not existing in cache is normal ('unavailable'); catch actual storage security/quota errors
        if (e?.name === 'SecurityError' || e?.name === 'QuotaExceededError') {
          console.warn('[Firebase Cache Probe] IndexedDB storage quota or security constraint detected:', e);
        }
      });
    } catch {
      // Benign probe failure
    }
  }, 100);
}

let rtdbInstance: any = null;
export const getLazyRtdb = async () => {
  if (rtdbInstance) return rtdbInstance;
  const rtdbUrl = (firebaseConfig as any).databaseURL || (import.meta as any).env?.VITE_FIREBASE_DATABASE_URL;
  if (!rtdbUrl) return null;
  
  try {
    const { getDatabase, connectDatabaseEmulator } = await import('firebase/database');
    rtdbInstance = getDatabase(app, rtdbUrl);
    const isEmulatorMode = (import.meta as any).env?.VITE_USE_FIREBASE_EMULATOR === 'true';
    if (isEmulatorMode) {
      connectDatabaseEmulator(rtdbInstance, 'localhost', 9000);
    }
  } catch (err) {
    console.warn('[Firebase] Realtime Database init warning:', err);
  }
  return rtdbInstance;
};

if (isEmulatorMode) {
  // Auth emulator will be connected lazily when auth is requested
  console.log('[Firebase] Running in emulator mode.');
}

let authInstance: any = null;

const getLazyAuth = async () => {
  if (authInstance) return authInstance;
  const { getAuth, connectAuthEmulator } = await import('firebase/auth');
  authInstance = getAuth(app);
  if (isEmulatorMode) {
    try {
      connectAuthEmulator(authInstance, 'http://localhost:9099', { disableWarnings: true });
      console.log('[Firebase] Connected to Local Auth (9099) Emulator.');
    } catch (emuErr) {
      console.warn('[Firebase] Auth Emulator connection warning:', emuErr);
    }
  }
  return authInstance;
};

export const authenticateFirebaseCustomToken = async (token: string) => {
  if (!token) return;
  try {
    const { signInWithCustomToken } = await import('firebase/auth');
    const auth = await getLazyAuth();
    // 🛡️ 不再早期返回：允許過期 Token 重新簽入，防止 F5 重載後 auth 過期導致 permission-denied 循環
    await signInWithCustomToken(auth, token);
    console.log('[Firebase Auth] Authenticated staff with Custom Token successfully!');
  } catch (err) {
    console.warn('[Firebase Auth] Custom Token login failed:', err);
  }
};

/**
 * 等待 Firebase Auth 狀態恢復（F5 重載後 SDK 從 IndexedDB 自動恢復）
 * 超時 3 秒保底，避免離線或 IndexedDB 損壞時永久阻塞
 */
export const ensureFirebaseAuthReady = async (timeoutMs = 3000): Promise<User | null> => {
  const auth = await getLazyAuth();
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser;
  try {
    await Promise.race([
      auth.authStateReady(),
      new Promise((resolve) => setTimeout(resolve, timeoutMs))
    ]);
  } catch (e) {
    console.warn('[Firebase Auth] authStateReady wait failed:', e);
  }
  return auth.currentUser;
};

// 🛡️ 生產環境預設啟用即時同步，Bootstrap API 仍可動態覆蓋此值
// 注意：舊有 `isEmulatorMode` 判斷已移除，避免生產環境冷啟動時監聽器停擺長達 10-30s
let syncEnabled = true;

export const isFirebaseSyncEnabled = () => syncEnabled;

export const stopFirebaseSync = async () => {
  syncEnabled = false;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('firebase_sync_changed', { detail: { syncEnabled: false } }));
  }
  console.log('[Firebase Sync] Firebase network synchronization is STOPPED (disableNetwork omitted to preserve manual queries).');
};

export const startFirebaseSync = async () => {
  syncEnabled = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('firebase_sync_changed', { detail: { syncEnabled: true } }));
  }
  try {
    await enableNetwork(db);
    console.log('[Firebase Sync] Firebase network synchronization is ENABLED.');
  } catch (err) {
    console.warn('[Firebase Sync] Error enabling network:', err);
  }
};

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// 🤖 Firebase App Check (Bot & Abuse Protection)
let appCheckInstance: any = null;
if (typeof window !== 'undefined') {
  const recaptchaSiteKey = (window as any).__FIREBASE_APPCHECK_KEY__ || (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
  if (recaptchaSiteKey) {
    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('[Firebase AppCheck] Initialized successfully with ReCaptchaV3Provider');
    } catch (err) {
      console.warn('[Firebase AppCheck] Initialization skipped or debug fallback active:', err);
    }
  }
}
export const appCheck = appCheckInstance;

// 🚀 Firebase Performance Monitoring (生產環境非同步動態載入，零首屏體積負擔)
if (typeof window !== 'undefined' && (import.meta as any).env?.PROD && !isEmulatorMode) {
  import('firebase/performance').then(({ getPerformance }) => {
    try {
      getPerformance(app);
      console.log('[Firebase Performance] Initialized Core Web Vitals monitoring.');
    } catch (_err) {}
  }).catch(() => {});
}

