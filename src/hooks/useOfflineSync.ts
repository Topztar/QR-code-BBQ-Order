import { useState, useEffect, useRef, useCallback } from 'react';
import { getOfflineQueue, processOfflineQueue, QueuedRequest } from '../lib/offlineQueue';

export function useOfflineSync(onRefreshData?: () => Promise<void>) {
  const [offlineQueue, setOfflineQueue] = useState<QueuedRequest[]>(getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);
  
  useEffect(() => {
    isSyncingRef.current = isSyncing;
  }, [isSyncing]);

  const onRefreshDataRef = useRef(onRefreshData);
  useEffect(() => {
    onRefreshDataRef.current = onRefreshData;
  }, [onRefreshData]);

  const [syncProgressMsg, setSyncProgressMsg] = useState<string>('');
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateOnlineStatus = () => {
      setIsNetworkOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const handleQueueChange = (e: Event) => {
      const customEvent = e as CustomEvent<QueuedRequest[]>;
      setOfflineQueue(customEvent.detail || getOfflineQueue());
    };
    window.addEventListener('offline_queue_changed', handleQueueChange);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('offline_queue_changed', handleQueueChange);
    };
  }, []);

  const handleForceSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncProgressMsg('正在準備批次重發...');
    try {
      const result = await processOfflineQueue((progress) => setSyncProgressMsg(progress));
      if (result.successCount > 0) {
        console.log(`[Offline Sync] Successfully synced ${result.successCount} requests!`);
        if (onRefreshDataRef.current) {
          await onRefreshDataRef.current();
        }
      }
    } catch (e) {
      console.error('[Offline Sync Error]', e);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
      setSyncProgressMsg('');
    }
  }, []);

  useEffect(() => {
    if (isNetworkOnline && offlineQueue.length > 0) {
      handleForceSync();
    }
  }, [isNetworkOnline, offlineQueue.length, handleForceSync]);

  const PROBE_INTERVAL_MS = 30_000;
  useEffect(() => {
    if (offlineQueue.length === 0) return;

    const probeTimer = setInterval(() => {
      const currentQueue = getOfflineQueue();
      if (currentQueue.length > 0 && !isSyncing) {
        console.log(`[OfflineQueue] Background probe: ${currentQueue.length} items pending — triggering auto-sync.`);
        handleForceSync();
      }
    }, PROBE_INTERVAL_MS);

    return () => clearInterval(probeTimer);
  }, [offlineQueue.length, isSyncing, handleForceSync]);

  return {
    offlineQueue,
    isSyncing,
    syncProgressMsg,
    isNetworkOnline,
    handleForceSync
  };
}
