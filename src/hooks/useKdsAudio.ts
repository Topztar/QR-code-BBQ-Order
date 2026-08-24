import { useState, useEffect, useCallback, useRef } from 'react';
import { Order } from '../types';
import {
  unlockAudio,
  playOrderChimeSound,
  playStatusBeepSound,
  announceOrderNotification,
  formatOrderAnnouncementText,
  stopSpeech,
  speakUtterance,
} from '../utils/kdsAudio';
import { safeStorage } from '../lib/safeStorage';

const localStorage = safeStorage;

export function useKdsAudio() {
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kds-tts-enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kds_sound_enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [audioNeedsUnlock, setAudioNeedsUnlock] = useState<boolean>(true);
  const [beepSim, setBeepSim] = useState<boolean>(false);
  const prevOrdersCountRef = useRef<number | null>(null);

  // Auto-listen for user gesture to unlock audio
  useEffect(() => {
    const handleGesture = async () => {
      const unlocked = await unlockAudio();
      if (unlocked) {
        setAudioNeedsUnlock(false);
      }
    };

    window.addEventListener('click', handleGesture, { once: false });
    window.addEventListener('keydown', handleGesture, { once: false });
    window.addEventListener('touchstart', handleGesture, { once: false });

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  const handleUnlockAudio = useCallback(async () => {
    await unlockAudio();
    setAudioNeedsUnlock(false);
    playStatusBeepSound();
  }, []);

  const handleToggleTts = useCallback(async () => {
    const nextState = !ttsEnabled;
    setTtsEnabled(nextState);
    try {
      localStorage.setItem('kds-tts-enabled', String(nextState));
    } catch (e) {
      console.error(e);
    }
    if (nextState) {
      await unlockAudio();
      setAudioNeedsUnlock(false);
      announceOrderNotification('語音廣播已開啟', true);
    }
  }, [ttsEnabled]);

  const toggleSound = useCallback(async () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    try {
      localStorage.setItem('kds_sound_enabled', String(nextState));
    } catch (e) {
      console.error(e);
    }

    if (nextState) {
      await unlockAudio();
      setAudioNeedsUnlock(false);
      playStatusBeepSound();
    }
  }, [soundEnabled]);

  const notifyNewOrder = useCallback(
    (order?: Order) => {
      if (!soundEnabled && !ttsEnabled) return;
      playOrderChimeSound();
      if (order && ttsEnabled) {
        const text = formatOrderAnnouncementText([order]);
        announceOrderNotification(text, false);
      }
      setBeepSim(true);
      setTimeout(() => setBeepSim(false), 800);
    },
    [soundEnabled, ttsEnabled]
  );

  const notifyStatusChange = useCallback(() => {
    if (!soundEnabled) return;
    playStatusBeepSound();
    setBeepSim(true);
    setTimeout(() => setBeepSim(false), 800);
  }, [soundEnabled]);

  const formatAnnouncement = useCallback((order: Order) => {
    return formatOrderAnnouncementText([order]);
  }, []);

  return {
    ttsEnabled,
    setTtsEnabled,
    soundEnabled,
    setSoundEnabled,
    audioNeedsUnlock,
    setAudioNeedsUnlock,
    beepSim,
    setBeepSim,
    handleUnlockAudio,
    handleToggleTts,
    toggleSound,
    notifyNewOrder,
    notifyStatusChange,
    announceOrderNotification,
    playOrderChimeSound,
    playStatusBeepSound,
    formatOrderAnnouncementText: formatAnnouncement,
    stopSpeech,
    speakUtterance,
    prevOrdersCountRef,
  };
}
