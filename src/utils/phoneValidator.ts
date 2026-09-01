/**
 * 🇹🇼 Taiwan Phone Number Validation & Sanitization Utility
 * 
 * Rules:
 * 1. Strictly Arabic numerals only (0-9).
 * 2. Mobile Phone (手機): 10 digits, starts with 09 (e.g. 0912345678).
 * 3. Landline (市內電話): 9 to 10 digits, starts with area code 02~08 (e.g. 0223456789, 042345678, 082345678).
 */

export function sanitizePhoneDigits(raw: string, maxLen: number = 10): string {
  if (!raw) return '';
  return raw.replace(/\D/g, '').slice(0, maxLen);
}

export function isValidTaiwanPhone(phone: string): boolean {
  const digits = sanitizePhoneDigits(phone);
  const isMobile = /^09\d{8}$/.test(digits);
  const isLandline = /^0[2-8]\d{7,8}$/.test(digits);
  return isMobile || isLandline;
}

export const TAIWAN_PHONE_ERROR_MSG =
  '聯絡電話格式不正確！需為台灣手機（09開頭共10位數字）或市話（02~08開頭共9~10位數字）。';
