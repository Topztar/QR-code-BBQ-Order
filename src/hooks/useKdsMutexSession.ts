import { useState, useEffect, useRef, useCallback } from 'react';
import { KdsSession } from '../types';
import { safeStorage } from '../lib/safeStorage';
import { apiFetch } from '../lib/api';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { isRtdbPresenceSupported, subscribeKdsPresence, claimKdsPresence, releaseKdsPresence } from '../lib/kdsPresence';

export function useKdsMutexSession(
  activeTab: string,
  isNetworkOnline: boolean,
  syncActive: boolean
) {
  const [currentDeviceId] = useState<string>(() => {
    try {
      let id = safeStorage.getItem('sabay_device_id');
      if (!id) {
        id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
        safeStorage.setItem('sabay_device_id', id);
      }
      return id;
    } catch {
      return `dev_fallback_${Date.now()}`;
    }
  });

  const [kdsSession, setKdsSession] = useState<KdsSession | null>(null);
  const [isKitchenPreempted, setIsKitchenPreempted] = useState<boolean>(false);
  
  const currentRoleRef = useRef<string>(activeTab);
  useEffect(() => {
    currentRoleRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (isRtdbPresenceSupported()) {
      const unsubscribeRtdb = subscribeKdsPresence((presenceSession) => {
        if (presenceSession) {
          const formatted: KdsSession = {
            activeKitchenDeviceId: presenceSession.activeKitchenDeviceId,
            claimedAt: presenceSession.claimedAt,
            lastHeartbeat: presenceSession.updatedAt,
            leaseExpiresAt: null
          };
          setKdsSession(formatted);
          if (currentRoleRef.current === 'kitchen' && formatted.activeKitchenDeviceId && formatted.activeKitchenDeviceId !== currentDeviceId) {
            setIsKitchenPreempted(true);
          }
        } else {
          setKdsSession(null);
        }
      });
      return () => unsubscribeRtdb();
    }

    if (!db || !syncActive) return;

    const sessionDocRef = doc(db, 'settings', 'kds_session');
    const unsubscribeSession = onSnapshot(sessionDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as KdsSession;
        setKdsSession(data);

        if (currentRoleRef.current === 'kitchen' && data.activeKitchenDeviceId && data.activeKitchenDeviceId !== currentDeviceId) {
          setIsKitchenPreempted(true);
        }
      } else {
        setKdsSession(null);
      }
    }, (err) => {
      console.warn('[KDS Session Snapshot Note]', err);
    });

    return () => {
      setTimeout(() => {
        try { unsubscribeSession(); } catch (_) {}
      }, 0);
    };
  }, [syncActive, currentDeviceId]);

  useEffect(() => {
    if (activeTab !== 'kitchen') return;

    const handleBeforeUnload = () => {
      if (currentRoleRef.current === 'kitchen' && currentDeviceId) {
        try {
          const payload = JSON.stringify({ deviceId: currentDeviceId });
          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon('/api/kds/release-kitchen', new Blob([payload], { type: 'application/json' }));
          }
        } catch (_) {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    if (isRtdbPresenceSupported()) {
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handleBeforeUnload);
      };
    }

    const heartbeatInterval = setInterval(async () => {
      if (!isNetworkOnline) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

      try {
        const res = await apiFetch('/api/kds/heartbeat', {
          method: 'POST',
          body: JSON.stringify({ deviceId: currentDeviceId })
        });
        if (res.status === 403) {
          setIsKitchenPreempted(true);
        }
      } catch (err) {
        console.warn('[KDS Heartbeat Network Error]', err);
      }
    }, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [activeTab, currentDeviceId, isNetworkOnline]);

  const handleClaimKitchenRole = useCallback(async (force: boolean = false): Promise<{ success: boolean; conflict?: boolean; activeKitchenDeviceId?: string }> => {
    try {
      if (isRtdbPresenceSupported()) {
        await claimKdsPresence(currentDeviceId);
      }

      const res = await apiFetch('/api/kds/claim-kitchen', {
        method: 'POST',
        body: JSON.stringify({ deviceId: currentDeviceId, force })
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        return { success: false, conflict: true, activeKitchenDeviceId: data.activeKitchenDeviceId };
      }

      if (res.ok) {
        setIsKitchenPreempted(false);
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.error('[KDS Claim Role Error]', err);
      return { success: true };
    }
  }, [currentDeviceId]);

  const handleReleaseKitchenRole = useCallback(async () => {
    try {
      if (isRtdbPresenceSupported()) {
        await releaseKdsPresence(currentDeviceId);
      }
      await apiFetch('/api/kds/release-kitchen', {
        method: 'POST',
        body: JSON.stringify({ deviceId: currentDeviceId })
      });
    } catch (err) {
      console.warn('[KDS Release Role Error]', err);
    }
  }, [currentDeviceId]);

  const dismissPreemptedAlert = useCallback(() => {
    setIsKitchenPreempted(false);
  }, []);

  return {
    kdsSession,
    currentDeviceId,
    isKitchenPreempted,
    handleClaimKitchenRole,
    handleReleaseKitchenRole,
    dismissPreemptedAlert
  };
}
