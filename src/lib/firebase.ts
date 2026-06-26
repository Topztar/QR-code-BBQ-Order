import { initializeApp } from 'firebase/app';
import { getFunctions } from "firebase/functions";
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

let firestoreInstance: Firestore;

// Helper to check indexedDB availability to prevent Firestore cache boot failures in sandboxed iframes
const checkIndexedDB = (): boolean => {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && !!window.indexedDB;
  } catch (e) {
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
    }, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
} catch (error) {
  console.warn('[Firebase] Firestore initialization cache fallback or double-init check:', error);
  try {
    // getFirestore will retrieve the already initialized instance if it exists
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.error('[Firebase] Critical fallback initialization failed:', err);
    try {
      firestoreInstance = getFirestore(app);
    } catch (finalErr) {
      // Last-ditch effort
      firestoreInstance = getFirestore();
    }
  }
}

export const db = firestoreInstance;

export const auth = getAuth();

// Validate Connection to Firestore on initial boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection validated successfully with Firestore.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log('[Firebase] Completed boot verification query.');
    }
  }
}
testConnection();

export const functions = getFunctions(app);
