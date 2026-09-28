import { useEffect, useState } from 'react';

/**
 * useAdminHotkey - A hook for secure administrative routing transition via keyboard shortcut.
 * Use this to transition to a staff portal securely without exposing a visible button.
 * Default combination: Ctrl + Shift + L
 */
export const useAdminHotkey = (
  secretKeyCombo: { ctrl?: boolean; shift?: boolean; alt?: boolean; key: string } = { ctrl: true, shift: true, key: 'l' },
  onTrigger?: () => void
) => {
  const [isTriggered, setIsTriggered] = useState(false);

  const ctrlReq = secretKeyCombo.ctrl ?? true;
  const shiftReq = secretKeyCombo.shift ?? true;
  const altReq = secretKeyCombo.alt ?? false;
  const targetKey = secretKeyCombo.key.toLowerCase();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchCtrl = ctrlReq ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey);
      const matchShift = shiftReq ? event.shiftKey : !event.shiftKey;
      const matchAlt = altReq ? event.altKey : !event.altKey;
      const matchKey = event.key.toLowerCase() === targetKey;

      if (matchCtrl && matchShift && matchAlt && matchKey) {
        event.preventDefault();
        setIsTriggered(true);
        if (onTrigger) {
          onTrigger();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ctrlReq, shiftReq, altReq, targetKey, onTrigger]);

  return isTriggered;
};
