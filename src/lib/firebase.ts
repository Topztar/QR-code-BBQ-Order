import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, signInWithCustomToken, connectAuthEmulator, type User } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache, connectFirestoreEmulator, getFirestore, Firestore, enableNetwork } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07';

const isEmulatorMode = (import.meta as any).env?.VITE_USE_FIREBASE_EMULATOR === 'true';

let firestoreInstance: Firestore;

// Helper to check indexedDB availability to prevent Firestore cache boot failures in sandboxed iframes
const checkIndexedDB = (): boolean => {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && !!window.indexedDB;
  } catch (_e) {
    return false;
  }
};

try {
  if (isEmulatorMode) {
    // 🛡️ 模擬器環境強制使用記憶體快取，隔離生產環境 IndexedDB 髒資料與 Mutation Queue 衝突
    firestoreInstance = initializeFirestore(app, {
      localCache: memoryLocalCache()
    }, FIRESTORE_DATABASE_ID);

    connectFirestoreEmulator(firestoreInstance, 'localhost', 8080);
    console.log('[Firebase] Connected to Local Firestore Emulator (Port 8080) with memoryLocalCache.');
  } else if (checkIndexedDB()) {
    // Configure persistent local cache with multi-tab manager for sub-millisecond cache speed and optimal quota conservation
    firestoreInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 100 * 1024 * 1024 // 100MB — BBQ POS 尖峰營業充裕，保留 LRU GC
      })
    }, FIRESTORE_DATABASE_ID);
  } else {
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  }
} catch (error) {
  console.warn('[Firebase] Firestore initialization cache fallback or double-init check:', error);
  try {
    // IndexedDB 鎖定或孤兒租約：安全降級至記憶體快取
    firestoreInstance = initializeFirestore(app, {
      localCache: memoryLocalCache()
    }, FIRESTORE_DATABASE_ID);
    console.error('[FinOps Alert] Downgraded to memoryLocalCache due to IndexedDB failure. Cache miss rate may spike!');
    // TODO: Connect this alert to Sentry or Firebase Analytics once tracking is enabled.
  } catch (err: any) {
    // 若拋出 failed-precondition 代表 Firestore 內部已完成部分啟動，直接取回實例
    if (err?.code !== 'failed-precondition') {
      console.error('[Firebase] Critical fallback initialization failed:', err);
    }
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  }
}

import { getDatabase, type Database, connectDatabaseEmulator } from 'firebase/database';

export const db = firestoreInstance;
export const auth = getAuth(app);
export const functions = getFunctions(app, 'asia-east1');

let rtdbInstance: Database | null = null;
const rtdbUrl = (firebaseConfig as any).databaseURL || (import.meta as any).env?.VITE_FIREBASE_DATABASE_URL;

if (rtdbUrl) {
  try {
    rtdbInstance = getDatabase(app, rtdbUrl);
    if (isEmulatorMode) {
      connectDatabaseEmulator(rtdbInstance, 'localhost', 9000);
    }
  } catch (err) {
    console.warn('[Firebase] Realtime Database init warning:', err);
  }
}

export const rtdb = rtdbInstance;

if (isEmulatorMode) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('[Firebase] Connected to Local Auth (9099) & Functions (5001) Emulators.');
  } catch (emuErr) {
    console.warn('[Firebase] Emulator connection warning:', emuErr);
  }
}

export const authenticateFirebaseCustomToken = async (token: string) => {
  if (!token || !auth) return;
  try {
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
