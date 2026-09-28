/**
 * Shared Chunk Recovery Logic
 * Prevents continuous reload storms and unifies cache-busting keys.
 */
export const attemptChunkRecovery = async (error: Error | any, source: string): Promise<boolean> => {
  const key = 'sabay_chunk_recovery_lock';
  const lastRetry = parseInt(window.sessionStorage.getItem(key) || '0', 10);
  const now = Date.now();

  console.warn(`[Sabay Chunk Recovery] Failed at ${source}:`, error);

  if (now - lastRetry > 10000) { // 10 seconds debounce across all subsystems
    console.warn(`[Sabay Chunk Recovery] Attempting automatic cache purge and reload...`);
    window.sessionStorage.setItem(key, now.toString());

    // Purge CacheStorage 
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (_) {}
    }

    // Update Service Workers
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.update();
        }
      } catch (_) {}
    }

    // Use standardized cache-busting URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('_v', now.toString());
    
    // Attempt navigation
    window.location.replace(url.toString());
    
    // Return true indicating a reload was dispatched
    return true; 
  }
  
  // Return false indicating debounce period is active (reload aborted)
  return false;
};
