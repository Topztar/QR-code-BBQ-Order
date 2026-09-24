import { useState, useEffect, useRef } from 'react';

export function useIdleTimeout(timeoutMs: number, onIdle: () => void, onWake: () => void) {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const onIdleRef = useRef(onIdle);
  const onWakeRef = useRef(onWake);

  useEffect(() => {
    onIdleRef.current = onIdle;
    onWakeRef.current = onWake;
  }, [onIdle, onWake]);

  useEffect(() => {
    let idle = false; 

    const handleActivity = () => {
      if (idle) {
        idle = false;
        setIsIdle(false);
        onWakeRef.current();
      }
      resetTimeout();
    };

    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        idle = true;
        setIsIdle(true);
        onIdleRef.current();
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'wheel', 'touchstart', 'touchmove', 'mousedown'];
    events.forEach(event => document.addEventListener(event, handleActivity));
    
    resetTimeout();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [timeoutMs]);

  return isIdle;
}
