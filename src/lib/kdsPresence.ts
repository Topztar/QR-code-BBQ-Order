import { rtdb } from './firebase';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';

export interface KdsPresenceSession {
  activeKitchenDeviceId: string | null;
  claimedAt?: any;
  updatedAt?: any;
}

/**
 * Checks if Firebase Realtime Database Presence is supported in the current environment
 */
export function isRtdbPresenceSupported(): boolean {
  return !!rtdb;
}

/**
 * Subscribes to real-time KDS presence session in RTDB
 */
export function subscribeKdsPresence(
  onSessionChange: (session: KdsPresenceSession | null) => void
): () => void {
  if (!rtdb) return () => {};

  try {
    const presenceRef = ref(rtdb, 'kds_session');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        onSessionChange(snapshot.val() as KdsPresenceSession);
      } else {
        onSessionChange(null);
      }
    }, (error) => {
      console.warn('[KDS Presence] RTDB Subscription note:', error);
    });

    return () => unsubscribe();
  } catch (err) {
    console.warn('[KDS Presence] Error setting up RTDB presence subscription:', err);
    return () => {};
  }
}

/**
 * Claims the kitchen role in Realtime Database with an onDisconnect().remove() trigger.
 * When the browser tab closes or TCP connection drops, Firebase backend automatically clears the lock.
 */
export async function claimKdsPresence(deviceId: string): Promise<boolean> {
  if (!rtdb) return false;

  try {
    const presenceRef = ref(rtdb, 'kds_session');
    const onDisconnectRef = onDisconnect(presenceRef);
    
    // Automatically delete session on socket disconnect
    await onDisconnectRef.remove();

    await set(presenceRef, {
      activeKitchenDeviceId: deviceId,
      claimedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('[KDS Presence] Claimed kitchen role in RTDB with onDisconnect hook');
    return true;
  } catch (err) {
    console.warn('[KDS Presence] Failed to claim presence in RTDB:', err);
    return false;
  }
}

/**
 * Voluntarily releases the kitchen role in Realtime Database
 */
export async function releaseKdsPresence(deviceId: string): Promise<void> {
  if (!rtdb) return;

  try {
    const presenceRef = ref(rtdb, 'kds_session');
    const onDisconnectRef = onDisconnect(presenceRef);
    await onDisconnectRef.cancel();
    await set(presenceRef, null);
    console.log('[KDS Presence] Released kitchen role in RTDB');
  } catch (err) {
    console.warn('[KDS Presence] Failed to release presence in RTDB:', err);
  }
}
