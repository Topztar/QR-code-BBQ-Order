import { useState, useEffect, useCallback, useRef } from 'react';
import { Order, Language } from '../types';
import {
  unlockAudio,
  playOrderChimeSound,
  playStatusBeepSound,
  announceOrderNotification,
  formatOrderAnnouncementText,
  stopSpeech,
  speakUtterance,
  playOvertimeBeepSound,
} from '../utils/kdsAudio';
import { safeStorage, safeSessionStorage } from '../lib/safeStorage';

const localStorage = safeStorage;

export function useKdsAudio(currentLang: Language = 'zh') {
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kds-tts-enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [audioNeedsUnlock, setAudioNeedsUnlock] = useState<boolean>(() => {
    try {
      return safeSessionStorage.getItem('kds-audio-unlocked') !== 'true';
    } catch {
      return true;
    }
  });
  const [beepSim, setBeepSim] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopSpeech();
    };
  }, []);

  // Auto-listen for user gesture to unlock audio
  useEffect(() => {
    const handleGesture = async () => {
      const unlocked = await unlockAudio();
      if (unlocked && isMountedRef.current) {
        setAudioNeedsUnlock(false);
        window.removeEventListener('click', handleGesture);
        window.removeEventListener('keydown', handleGesture);
        window.removeEventListener('touchstart', handleGesture);
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
      const enabledMsg: Record<Language, string> = {
        zh: '語音廣播已開啟',
        en: 'Voice readout enabled',
        ja: '音声案内を有効にしました',
        ko: '음성 안내가 켜졌습니다',
        th: 'เปิดการแจ้งเตือนด้วยเสียงแล้ว',
        vi: 'Đã bật thông báo bằng giọng nói',
        ru: 'Голосовые оповещения включены',
        es: 'Locución de voz activada'
      };
      announceOrderNotification(enabledMsg[currentLang] || enabledMsg.zh, true, currentLang);
    }
  }, [ttsEnabled, currentLang]);

  /**
   * Play high-frequency chime tone + announce table or takeout number via TTS
   */
  const notifyNewOrders = useCallback(
    (newOrders: Order[]) => {
      if (!newOrders || newOrders.length === 0) return;

      if (ttsEnabled) {
        // High-frequency chime followed sequentially by multilingual TTS (桌號 / 外帶單號)
        const text = formatOrderAnnouncementText(newOrders, currentLang);
        announceOrderNotification(text, true, currentLang);
      } else {
        // High-frequency chime only
        playOrderChimeSound();
      }

      setBeepSim(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          setBeepSim(false);
        }
      }, 3000);
    },
    [ttsEnabled, currentLang]
  );

  const notifyNewOrder = useCallback(
    (order?: Order) => {
      if (order) {
        notifyNewOrders([order]);
      }
    },
    [notifyNewOrders]
  );

  const notifyStatusChange = useCallback(() => {
    playStatusBeepSound();
    setBeepSim(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        setBeepSim(false);
      }
    }, 800);
  }, []);

  return {
    ttsEnabled,
    setTtsEnabled,
    audioNeedsUnlock,
    setAudioNeedsUnlock,
    beepSim,
    setBeepSim,
    handleUnlockAudio,
    handleToggleTts,
    notifyNewOrders,
    notifyNewOrder,
    notifyStatusChange,
    announceOrderNotification,
    playOrderChimeSound,
    playStatusBeepSound,
    playOvertimeBeepSound,
    formatOrderAnnouncementText,
    stopSpeech,
    speakUtterance,
  };
}

