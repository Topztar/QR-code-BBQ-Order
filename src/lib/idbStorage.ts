/**
 * Lightweight native IndexedDB wrapper for durable, high-capacity offline storage
 * Prevents main-thread blocking on large JSON payloads on iOS/Android WebKit
 */

const DB_NAME = 'sabay_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv_store';

let dbPromise: Promise<IDBDatabase | null> | null = null;

export function isIndexedDbSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && !!window.indexedDB;
  } catch {
    return false;
  }
}

function openIdb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbSupported()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (err) => {
        console.warn('[idbStorage] Failed to open IndexedDB:', err);
        resolve(null);
      };

      request.onblocked = () => {
        console.warn('[idbStorage] IndexedDB open blocked');
        resolve(null);
      };
    } catch (err) {
      console.warn('[idbStorage] IndexedDB exception on open:', err);
      resolve(null);
    }
  });

  return dbPromise;
}

export async function getIdbItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openIdb();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

export async function setIdbItem<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = await openIdb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

export async function removeIdbItem(key: string): Promise<boolean> {
  try {
    const db = await openIdb();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}
