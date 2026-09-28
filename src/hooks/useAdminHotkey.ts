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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchCtrl = secretKeyCombo.ctrl ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey);
      const matchShift = secretKeyCombo.shift ? event.shiftKey : !event.shiftKey;
      const matchAlt = secretKeyCombo.alt ? event.altKey : !event.altKey;
      const matchKey = event.key.toLowerCase() === secretKeyCombo.key.toLowerCase();

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
  }, [secretKeyCombo, onTrigger]);

  return isTriggered;
};
