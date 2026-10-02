import { useEffect } from 'react';

export function useModalEscape(isOpen: boolean, onClose: () => void, isDirty?: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDirty) {
          if (window.confirm('您有未儲存的變更，確定要關閉嗎？ (Unsaved changes will be lost)')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isDirty]);
}
