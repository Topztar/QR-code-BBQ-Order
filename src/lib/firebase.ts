import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, signInWithCustomToken, connectAuthEmulator } from 'firebase/auth';
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
        tabManager: persistentMultipleTabManager()
      })
    }, FIRESTORE_DATABASE_ID);
  } else {
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  }
} catch (error) {
  console.warn('[Firebase] Firestore initialization cache fallback or double-init check:', error);
  try {
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  } catch (err) {
    console.error('[Firebase] Critical fallback initialization failed:', err);
    firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
  }
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const functions = getFunctions(app, 'asia-east1');

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
    if (auth.currentUser) return;
    await signInWithCustomToken(auth, token);
    console.log('[Firebase Auth] Authenticated staff with Custom Token successfully!');
  } catch (err) {
    console.warn('[Firebase Auth] Custom Token login failed:', err);
  }
};

// 🛡️ 模擬器模式下預設主動解鎖即時同步，使 onSnapshot 於前端初始化時能順利向模擬器註冊
let syncEnabled = isEmulatorMode;

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
