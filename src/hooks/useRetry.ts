import { useCallback, useRef } from 'react';

/**
 * Hook to perform an async operation with retries and exponential backoff.
 * @param operation The async function to execute. Should reject on failure.
 * @param maxRetries Maximum number of retries (default 5).
 * @param baseDelay Initial delay in ms (default 500). Subsequent delays double each retry.
 */
export function useRetry<T>(operation: () => Promise<T>, maxRetries = 5, baseDelay = 500) {
  const attemptRef = useRef(0);

  const run = useCallback(async (): Promise<{ result?: T; error?: any; skipped?: boolean }> => {
    attemptRef.current = 0;
    while (attemptRef.current <= maxRetries) {
      try {
        const result = await operation();
        return { result };
      } catch (err) {
        if (attemptRef.current === maxRetries) {
          return { error: err };
        }
        const delay = baseDelay * 2 ** attemptRef.current;
        await new Promise((res) => setTimeout(res, delay));
        attemptRef.current += 1;
      }
    }
    return { error: new Error('Retry exhausted') };
  }, [operation, maxRetries, baseDelay]);

  const skip = useCallback(() => {
    return { skipped: true };
  }, []);

  return { run, skip };
}
