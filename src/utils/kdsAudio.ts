/**
 * 🔊 KDS Kitchen Audio Notification & Mandarin Voice Announcement Engine
 * 
 * Provides:
 * 1. Dual Audio Notification Architecture: Web Audio Chime followed sequentially by Mandarin TTS (SpeechSynthesis).
 * 2. High-clarity audio tuned for noisy kitchen environments (1.0 Volume, 1.05 Rate, zh-TW locale).
 * 3. Dynamic natural Traditional Chinese announcement formatter distinguishing Dine-In (桌號 X 號) and Take-out (外帶訂單，單號 Y).
 * 4. Autoplay unlock management and Chrome SpeechSynthesis garbage collection workarounds.
 */

import { Order } from '../types';

let globalAudioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null;
let utteranceHeartbeat: any = null;

/**
 * Lazily initialize and return the global AudioContext instance
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      globalAudioCtx = new AudioCtxClass();
    }
  }
  return globalAudioCtx;
}

/**
 * Unlock Web Audio Context and pre-warm SpeechSynthesis on user gesture
 */
export async function unlockAudio(): Promise<boolean> {
  let unlocked = false;
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        await ctx.resume();
        unlocked = true;
      } else if (ctx.state === 'running') {
        unlocked = true;
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      loadVoices();
    }
  } catch (err) {
    console.warn('[KDS Audio Unlock]', err);
  }
  return unlocked;
}

/**
 * Load and cache available system speech synthesis voices
 */
export function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
    }
  } catch (err) {
    console.warn('[KDS Load Voices Error]', err);
  }
  return cachedVoices;
}

// Initialize voices listener if supported
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

/**
 * Play kitchen order notification chime (Two-tone harmonic alert)
 * Resolves after chime finishes (~650ms) to ensure perfect non-overlapping sequencing with TTS.
 */
export function playOrderChimeSound(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // Tone 1: A5 (880 Hz) - Crisp kitchen bell attack
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: D6 (1174.66 Hz) - Resonant high confirmation chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.15);
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.65);

      // Resolve once the audio tones finish ringing
      setTimeout(() => {
        resolve();
      }, 650);
    } catch (err) {
      console.warn('[Web Audio Chime Error]', err);
      resolve();
    }
  });
}

/**
 * Play single soft status beep (e.g. for button press, status change)
 */
export function playStatusBeepSound(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);

      setTimeout(() => resolve(), 250);
    } catch (err) {
      console.warn('[Web Audio Status Beep Error]', err);
      resolve();
    }
  });
}

/**
 * Stop any active speech synthesis and clear heartbeats
 */
export function stopSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (utteranceHeartbeat) {
      clearInterval(utteranceHeartbeat);
      utteranceHeartbeat = null;
    }
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    activeUtterance = null;
  } catch (err) {
    console.warn('[Stop Speech Error]', err);
  }
}

/**
 * Find the most natural Taiwan Mandarin (zh-TW) voice available on the device
 */
function findBestMandarinVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Taiwan Mandarin (zh-TW, cmn-Hant-TW)
  const twVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return lang.includes('zh-tw') || lang.includes('zh_tw') || lang.includes('cmn-hant') || name.includes('taiwan') || name.includes('yating') || name.includes('hanhan');
  });
  if (twVoice) return twVoice;

  // 2. Hong Kong Cantonese / Traditional (zh-HK)
  const hkVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return lang.includes('zh-hk') || lang.includes('zh_hk');
  });
  if (hkVoice) return hkVoice;

  // 3. General Chinese / Mandarin (zh, zh-CN, cmn)
  const generalZhVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('zh') || lang.includes('cmn') || lang.includes('chinese');
  });
  return generalZhVoice || null;
}

/**
 * Read out text using Browser SpeechSynthesis in natural Mandarin Chinese
 */
export function speakUtterance(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      stopSpeech();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.volume = 1.0; // Max volume for busy kitchen
      utterance.rate = 1.02;  // Clear, crisp pace
      utterance.pitch = 1.02; // Elevated pitch for acoustic clarity

      const voice = findBestMandarinVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // Chrome garbage-collection workaround: preserve reference in module & window
      activeUtterance = utterance;
      (window as any).__kdsActiveUtterance = utterance;

      // Chrome SpeechSynthesis heartbeat workaround to prevent speech freeze
      utteranceHeartbeat = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            clearInterval(utteranceHeartbeat);
            utteranceHeartbeat = null;
          }
        }
      }, 10000);

      utterance.onend = () => {
        if (utteranceHeartbeat) {
          clearInterval(utteranceHeartbeat);
          utteranceHeartbeat = null;
        }
        activeUtterance = null;
        resolve();
      };

      utterance.onerror = (err) => {
        console.warn('[KDS TTS Utterance Error]', err);
        if (utteranceHeartbeat) {
          clearInterval(utteranceHeartbeat);
          utteranceHeartbeat = null;
        }
        activeUtterance = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();
    } catch (err) {
      console.error('[KDS TTS Playback Error]', err);
      resolve();
    }
  });
}

/**
 * Dual Notification Sequencing: Plays Web Audio chime first, followed by Mandarin voice announcement.
 */
export async function announceOrderNotification(text: string, withChime: boolean = true): Promise<void> {
  if (withChime) {
    await playOrderChimeSound();
  }
  await speakUtterance(text);
}

/**
 * Format dynamic, natural Traditional Chinese announcement phrasing for incoming orders.
 * 
 * Rules:
 * - Dine-In Orders: "桌號 [X] 號，有新訂單"
 * - Take-Out Orders: "外帶訂單，單號 [X]，有新訂單"
 * - Multiple Orders: Aggregated natural phrasing.
 */
export function formatOrderAnnouncementText(orders: Order[]): string {
  if (!orders || orders.length === 0) return '';

  const orderDescriptions = orders.map(order => {
    const isTakeout = Boolean(
      (order.tableNumber && (order.tableNumber.includes('外帶') || order.tableNumber.toLowerCase() === 'takeout')) ||
      order.takeoutInfo
    );

    if (isTakeout) {
      // Extract short takeout sequence or order ID number
      let shortNum = '';
      if (order.tableNumber && order.tableNumber.includes('外帶')) {
        shortNum = order.tableNumber.replace('外帶', '').replace('-', '').trim();
      }
      if (!shortNum && order.id) {
        // Use last 3-4 digits of order ID
        const digits = order.id.replace(/\D/g, '');
        shortNum = digits.length >= 3 ? digits.slice(-3) : order.id.slice(-4);
      }
      return shortNum ? `外帶訂單，單號 ${shortNum}` : '外帶訂單';
    } else {
      const tableNum = order.tableNumber || '1';
      return `桌號 ${tableNum} 號`;
    }
  });

  if (orders.length === 1) {
    return `${orderDescriptions[0]}，有新訂單，請確認接單！`;
  }

  // Multiple orders
  const listStr = orderDescriptions.join('、');
  return `您有 ${orders.length} 筆新訂單待確認：包含 ${listStr}，請廚房確認接單！`;
}
