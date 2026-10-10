/**
 * 🔊 KDS Kitchen Audio Notification & Mandarin Voice Announcement Engine
 * 
 * Provides:
 * 1. Dual Audio Notification Architecture: Web Audio Chime followed sequentially by Mandarin TTS (SpeechSynthesis).
 * 2. High-clarity audio tuned for noisy kitchen environments (1.0 Volume, 1.05 Rate, zh-TW locale).
 * 3. Dynamic natural Traditional Chinese announcement formatter distinguishing Dine-In (桌號 X 號) and Take-out (外帶訂單，單號 Y).
 * 4. Autoplay unlock management and Chrome SpeechSynthesis garbage collection workarounds.
 */

import { Order, Language } from '../types';

let globalAudioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let _activeUtterance: SpeechSynthesisUtterance | null = null;
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

    if (unlocked && typeof window !== 'undefined') {
      sessionStorage.setItem('kds-audio-unlocked', 'true');
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
 * Play urgent, loud overtime warning beep
 */
export function playOvertimeBeepSound(): Promise<void> {
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
      
      // Urgent loud double-beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square'; // harsher sound for urgent alert
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1000, now + 0.2); // pitch jump
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05); // loud
      gain.gain.setValueAtTime(0.5, now + 0.15);
      gain.gain.linearRampToValueAtTime(0, now + 0.18);
      
      gain.gain.setValueAtTime(0, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.25);
      gain.gain.setValueAtTime(0.5, now + 0.35);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      setTimeout(() => resolve(), 500);
    } catch (err) {
      console.warn('[Web Audio Overtime Beep Error]', err);
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
    // Only cancel if there is something active to prevent deadlock on some Chrome versions
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    
    // Explicitly resume to clear any paused state from heartbeat
    window.speechSynthesis.resume();
    
    activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any).__kdsActiveUtterance = null;
    }
  } catch (err) {
    console.warn('[Stop Speech Error]', err);
  }
}

export const TTS_LOCALE_MAP: Record<Language, string> = {
  zh: 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  th: 'th-TH',
  vi: 'vi-VN',
  ru: 'ru-RU',
  es: 'es-ES',
};

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
 * Find the most suitable voice for the specified language on the device
 */
export function findBestVoiceForLanguage(lang: Language = 'zh'): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  if (lang === 'zh') {
    return findBestMandarinVoice();
  }

  const targetLocale = (TTS_LOCALE_MAP[lang] || 'zh-TW').toLowerCase();
  const langPrefix = lang.toLowerCase();

  // 1. Exact match locale (e.g. ja-jp, ko-kr, en-us)
  const exactVoice = voices.find(v => (v.lang || '').toLowerCase().replace('_', '-') === targetLocale);
  if (exactVoice) return exactVoice;

  // 2. Prefix match (e.g. ja, ko, en)
  const prefixVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith(langPrefix));
  if (prefixVoice) return prefixVoice;

  return null;
}

/**
 * Read out text using Browser SpeechSynthesis in natural voice for the target language
 */
export function speakUtterance(text: string, lang: Language = 'zh'): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      stopSpeech();
      window.speechSynthesis.resume();

      const targetLocale = TTS_LOCALE_MAP[lang] || 'zh-TW';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLocale;
      utterance.volume = 1.0; // Max volume for busy kitchen
      utterance.rate = 1.02;  // Clear, crisp pace
      utterance.pitch = 1.02; // Elevated pitch for acoustic clarity

      const voice = findBestVoiceForLanguage(lang);
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
 * Dual Notification Sequencing: Plays Web Audio chime first, followed by voice announcement.
 */
export async function announceOrderNotification(text: string, withChime: boolean = true, lang: Language = 'zh'): Promise<void> {
  if (withChime) {
    await playOrderChimeSound();
  }
  await speakUtterance(text, lang);
}

/**
 * Format dynamic, natural announcement phrasing for incoming orders according to language.
 * 
 * Rules:
 * - Dine-In Orders: "桌號 [X] 號，有新訂單" / "Table [X], new order"
 * - Take-Out Orders: "外帶訂單，單號 [X]，有新訂單" / "Takeout order #[X]"
 * - Multiple Orders: Aggregated natural phrasing.
 */
export function formatOrderAnnouncementText(orders: Order[], lang: Language = 'zh'): string {
  if (!orders || orders.length === 0) return '';

  const orderDescriptions = orders.map(order => {
    const isGoogle = order.source === 'google_business';
    const isTakeout = Boolean(
      (order.tableNumber && (String(order.tableNumber || '').includes('外帶') || order.tableNumber.toLowerCase() === 'takeout')) ||
      order.takeoutInfo
    );

    if (isTakeout) {
      // Extract short takeout sequence or order ID number
      let shortNum = '';
      if (order.tableNumber && String(order.tableNumber || '').includes('外帶')) {
        shortNum = String(order.tableNumber).replace(/外帶|#|-/g, '').trim();
      }
      if (!shortNum && order.id) {
        // Use last 3-4 digits of order ID
        const digits = order.id.replace(/\D/g, '');
        shortNum = digits.length >= 3 ? digits.slice(-3) : order.id.slice(-4);
      }

      switch (lang) {
        case 'en': {
          const label = isGoogle ? 'Google Business Takeout' : 'Takeout order';
          return shortNum ? `${label} #${shortNum}` : label;
        }
        case 'ja': {
          const label = isGoogle ? 'Googleビジネス テイクアウト注文' : 'テイクアウト注文';
          return shortNum ? `${label}、番号${shortNum}` : label;
        }
        case 'ko': {
          const label = isGoogle ? 'Google 비즈니스 포장 주문' : '포장 주문';
          return shortNum ? `${label} ${shortNum}번` : label;
        }
        case 'th': {
          const label = isGoogle ? 'ออเดอร์สั่งกลับบ้าน Google' : 'ออเดอร์สั่งกลับบ้าน';
          return shortNum ? `${label} หมายเลข ${shortNum}` : label;
        }
        case 'vi': {
          const label = isGoogle ? 'Đơn mang về Google' : 'Đơn mang về';
          return shortNum ? `${label} số ${shortNum}` : label;
        }
        case 'ru': {
          const label = isGoogle ? 'Заказ с собой из Google' : 'Заказ с собой';
          return shortNum ? `${label} №${shortNum}` : label;
        }
        case 'es': {
          const label = isGoogle ? 'Pedido para llevar de Google' : 'Pedido para llevar';
          return shortNum ? `${label} #${shortNum}` : label;
        }
        case 'zh':
        default: {
          const label = isGoogle ? 'Google 商家外帶訂單' : '外帶訂單';
          return shortNum ? `${label}，單號 ${shortNum}` : label;
        }
      }
    } else {
      const rawTable = order.tableNumber || '1';
      const cleanTableNum = String(rawTable).replace(/^第/, '').replace(/桌$/, '').replace(/號$/, '').trim() || '1';

      switch (lang) {
        case 'en':
          return isGoogle ? `Google Business Table ${cleanTableNum}` : `Table ${cleanTableNum}`;
        case 'ja':
          return isGoogle ? `Googleビジネス テーブル${cleanTableNum}番` : `テーブル${cleanTableNum}番`;
        case 'ko':
          return isGoogle ? `Google 비즈니스 ${cleanTableNum}번 테이블` : `${cleanTableNum}번 테이블`;
        case 'th':
          return isGoogle ? `Google Business โต๊ะ ${cleanTableNum}` : `โต๊ะ ${cleanTableNum}`;
        case 'vi':
          return isGoogle ? `Bàn Google ${cleanTableNum}` : `Bàn ${cleanTableNum}`;
        case 'ru':
          return isGoogle ? `Google Бизнес Стол ${cleanTableNum}` : `Стол ${cleanTableNum}`;
        case 'es':
          return isGoogle ? `Google Business Mesa ${cleanTableNum}` : `Mesa ${cleanTableNum}`;
        case 'zh':
        default:
          return isGoogle ? `Google 商家桌號 ${cleanTableNum} 號` : `桌號 ${cleanTableNum} 號`;
      }
    }
  });

  if (orders.length === 1) {
    switch (lang) {
      case 'en':
        return `New order for ${orderDescriptions[0]}, please confirm!`;
      case 'ja':
        return `${orderDescriptions[0]}、新規注文です。ご確認ください！`;
      case 'ko':
        return `${orderDescriptions[0]}에 새로운 주문이 들어왔습니다. 확인해 주세요!`;
      case 'th':
        return `มีออเดอร์ใหม่จาก ${orderDescriptions[0]} กรุณายืนยันออเดอร์!`;
      case 'vi':
        return `Có đơn hàng mới cho ${orderDescriptions[0]}, vui lòng xác nhận!`;
      case 'ru':
        return `Новый заказ: ${orderDescriptions[0]}, пожалуйста, подтвердите!`;
      case 'es':
        return `¡Nuevo pedido para ${orderDescriptions[0]}, por favor confirmar!`;
      case 'zh':
      default:
        return `${orderDescriptions[0]}，有新訂單，請確認接單！`;
    }
  }

  // Multiple orders
  const separator = (lang === 'zh' || lang === 'ja') ? '、' : ', ';
  const listStr = orderDescriptions.join(separator);

  switch (lang) {
    case 'en':
      return `You have ${orders.length} new orders to confirm: ${listStr}, please check kitchen display!`;
    case 'ja':
      return `新規注文が${orders.length}件あります：${listStr}、厨房でご確認ください！`;
    case 'ko':
      return `확인 대기 중인 새 주문이 ${orders.length}건 있습니다: ${listStr}. 주방에서 확인해 주세요!`;
    case 'th':
      return `มีออเดอร์ใหม่ ${orders.length} รายการ: ${listStr} กรุณาตรวจสอบที่ครัว!`;
    case 'vi':
      return `Bạn có ${orders.length} đơn hàng mới cần xác nhận: ${listStr}, vui lòng kiểm tra!`;
    case 'ru':
      return `У вас ${orders.length} новых заказов: ${listStr}, пожалуйста, проверьте на кухне!`;
    case 'es':
      return `¡Tiene ${orders.length} nuevos pedidos: ${listStr}, por favor revisar en cocina!`;
    case 'zh':
    default:
      return `您有 ${orders.length} 筆新訂單待確認：包含 ${listStr}，請廚房確認接單！`;
  }
}
