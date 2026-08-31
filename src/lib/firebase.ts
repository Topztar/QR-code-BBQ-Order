import { initializeApp } from 'firebase/app';
import { getFunctions } from "firebase/functions";
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore, Firestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07';

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
  if (checkIndexedDB()) {
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
export const auth = getAuth();

// Default state: Default to false (local Express server first), dynamically activated if bootstrap indicates backend enables Firebase sync
let syncEnabled = false;

export const isFirebaseSyncEnabled = () => syncEnabled;

export const stopFirebaseSync = async () => {
  syncEnabled = false;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('firebase_sync_changed', { detail: { syncEnabled: false } }));
  }
  try {
    await disableNetwork(db);
    console.log('[Firebase Sync] Firebase network synchronization is STOPPED.');
  } catch (err) {
    console.warn('[Firebase Sync] Error disabling network:', err);
  }
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

export const functions = getFunctions(app);

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


