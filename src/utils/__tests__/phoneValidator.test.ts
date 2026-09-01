import { describe, it, expect } from 'vitest';
import { sanitizePhoneDigits, isValidTaiwanPhone } from '../phoneValidator';

describe('Taiwan Phone Validator', () => {
  it('should sanitize non-digit characters and truncate to max 10 digits', () => {
    expect(sanitizePhoneDigits('0912-345-678')).toBe('0912345678');
    expect(sanitizePhoneDigits('0912 abc 345 #$% 678')).toBe('0912345678');
    expect(sanitizePhoneDigits('09123456789999')).toBe('0912345678');
    expect(sanitizePhoneDigits('')).toBe('');
  });

  it('should validate valid Taiwan mobile numbers (10 digits starting with 09)', () => {
    expect(isValidTaiwanPhone('0912345678')).toBe(true);
    expect(isValidTaiwanPhone('0987654321')).toBe(true);
    expect(isValidTaiwanPhone('0900123456')).toBe(true);
  });

  it('should validate valid Taiwan landline numbers (9~10 digits starting with 02~08)', () => {
    // 10-digit landline (e.g. Taipei 02-xxxxxxxx, Taichung 04-xxxxxxxx, Kaohsiung 07-xxxxxxxx)
    expect(isValidTaiwanPhone('0223456789')).toBe(true);
    expect(isValidTaiwanPhone('0423456789')).toBe(true);
    expect(isValidTaiwanPhone('0723456789')).toBe(true);

    // 9-digit landline (e.g. Hsinchu 03-xxxxxxx, Tainan 06-xxxxxxx, Kinmen 082-xxxxxx)
    expect(isValidTaiwanPhone('035123456')).toBe(true);
    expect(isValidTaiwanPhone('062123456')).toBe(true);
    expect(isValidTaiwanPhone('082312345')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidTaiwanPhone('1234567890')).toBe(false); // Does not start with 0
    expect(isValidTaiwanPhone('0112345678')).toBe(false); // 01 is not a valid Taiwan area code
    expect(isValidTaiwanPhone('091234567')).toBe(false); // Too short for mobile (9 digits)
    expect(isValidTaiwanPhone('09123456789')).toBe(true); // Sanitized to first 10 digits 0912345678
    expect(isValidTaiwanPhone('02123456')).toBe(false); // Too short (8 digits)
    expect(isValidTaiwanPhone('abcdefghij')).toBe(false);
    expect(isValidTaiwanPhone('')).toBe(false);
  });
});
