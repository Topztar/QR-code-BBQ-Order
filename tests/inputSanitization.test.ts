import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateOrderPayload,
  validateReservationPayload,
  validateImageUploadPayload
} from '../functions/src/validators';

describe('Security & Data Protection: Input Sanitization & Payload Validation', () => {
  describe('sanitizeString', () => {
    it('strips null bytes and control characters', () => {
      const maliciousInput = 'Table 1\u0000\u0008\u001F <script>';
      const clean = sanitizeString(maliciousInput, 50);
      expect(clean).not.toContain('\u0000');
      expect(clean).not.toContain('\u0008');
      expect(clean).toBe('Table 1 <script>');
    });

    it('enforces maximum length truncation safely', () => {
      const longInput = 'A'.repeat(500);
      const clean = sanitizeString(longInput, 30);
      expect(clean).toHaveLength(30);
    });

    it('handles null and undefined gracefully', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });
  });

  describe('validateOrderPayload', () => {
    it('accepts valid order payload and computes total', () => {
      const payload = {
        tableNumber: 'Table-A1',
        items: [
          { name: 'Thai BBQ Pork', price: 280, quantity: 2 },
          { name: 'Thai Milk Tea', price: 60, quantity: 1 }
        ],
        customerName: 'Alice',
        customerPhone: '0912345678'
      };

      const result = validateOrderPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.totalAmount).toBe(620); // 280*2 + 60
      expect(result.sanitizedData?.tableNumber).toBe('Table-A1');
    });

    it('rejects order with missing tableNumber', () => {
      const payload = {
        items: [{ name: 'Thai BBQ Pork', price: 280, quantity: 1 }]
      };
      const result = validateOrderPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing tableNumber');
    });

    it('rejects order with empty items array', () => {
      const payload = {
        tableNumber: 'Table-A1',
        items: []
      };
      const result = validateOrderPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Empty items list');
    });

    it('rejects order with negative or non-integer quantity', () => {
      const payload = {
        tableNumber: 'Table-A1',
        items: [{ name: 'Thai BBQ Pork', price: 280, quantity: -2 }]
      };
      const result = validateOrderPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid quantity');
    });

    it('rejects order with negative price', () => {
      const payload = {
        tableNumber: 'Table-A1',
        items: [{ name: 'Hacked Item', price: -500, quantity: 1 }]
      };
      const result = validateOrderPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid price');
    });

    it('rejects order exceeding 200 items limit (anti-DoS)', () => {
      const items = Array.from({ length: 205 }, (_, i) => ({
        name: `Item ${i}`,
        price: 100,
        quantity: 1
      }));
      const result = validateOrderPayload({ tableNumber: 'Table-A1', items });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Items limit exceeded');
    });
  });

  describe('validateReservationPayload', () => {
    it('accepts valid reservation payload', () => {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 14);
      const dateStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;

      const payload = {
        customerName: 'Bob Chen',
        phone: '0987654321',
        guestCount: 4,
        date: dateStr,
        time: '18:30',
        tableNumber: 'Table-B2'
      };

      const result = validateReservationPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.guestCount).toBe(4);
    });

    it('rejects reservation with invalid phone number', () => {
      const payload = {
        customerName: 'Bob',
        phone: 'abc',
        guestCount: 4,
        date: '2026-09-01',
        time: '18:00'
      };
      const result = validateReservationPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('7-15 digits phone number required');
    });

    it('rejects reservation with guest count > 100', () => {
      const payload = {
        customerName: 'Bob',
        phone: '0987654321',
        guestCount: 500,
        date: '2026-09-01',
        time: '18:00'
      };
      const result = validateReservationPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid guestCount');
    });

    it('rejects reservation booked > 3 months in advance', () => {
      const future = new Date();
      future.setMonth(future.getMonth() + 5);
      const farFutureDate = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;

      const payload = {
        customerName: 'Bob',
        phone: '0987654321',
        guestCount: 2,
        date: farFutureDate,
        time: '18:00'
      };
      const result = validateReservationPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('預約日期最多只能提前 3 個月');
    });
  });

  describe('validateImageUploadPayload', () => {
    it('accepts valid base64 image and determines correct extension', () => {
      const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const payload = {
        base64: sampleBase64,
        folder: 'dishes',
        filename: 'my_dish.png'
      };

      const result = validateImageUploadPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.mime).toBe('image/png');
      expect(result.sanitizedData?.cleanExt).toBe('png');
      expect(result.sanitizedData?.targetFolder).toBe('dishes');
    });

    it('sanitizes folder name to prevent directory traversal attacks', () => {
      const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
      const payload = {
        base64: sampleBase64,
        folder: '../../secrets/keys',
        filename: '../../../hacked.jpg'
      };

      const result = validateImageUploadPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.targetFolder).not.toContain('..');
      expect(result.sanitizedData?.targetFolder).not.toContain('/');
      expect(result.sanitizedData?.targetFilename).not.toContain('..');
    });

    it('rejects unsupported executable or script MIME types', () => {
      const payload = {
        base64: 'data:application/x-sh;base64,ZWNobyAnSGFja2VkJwo=',
        contentType: 'application/x-sh'
      };
      const result = validateImageUploadPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不支援的圖片格式');
    });
  });
});
