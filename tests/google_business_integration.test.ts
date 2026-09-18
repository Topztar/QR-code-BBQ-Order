import { describe, it, expect } from 'vitest';
import { validateOrderPayload, validateReservationPayload } from '../functions/src/validators';
import {
  formatLineReservationMessage,
  formatLineOrderMessage,
  ReservationNotificationData,
  OrderNotificationData
} from '../functions/src/services/notification';
import { formatOrderAnnouncementText } from '../src/utils/kdsAudio';
import { Order } from '../src/types';
import fs from 'fs';
import path from 'path';

describe('Google Business Profile Integration Tests', () => {
  describe('Server-Side Payload Validation', () => {
    it('should sanitize and preserve Google Business metadata on order payload', () => {
      const payload = {
        tableNumber: '外帶 101',
        items: [
          { name: { zh: '泰式沙嗲肉串' }, quantity: 2, price: 150 }
        ],
        customerName: '王小明',
        source: 'google_business',
        utm_medium: 'google_maps',
      };

      const result = validateOrderPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.source).toBe('google_business');
      expect(result.sanitizedData.utm_medium).toBe('google_maps');
      expect(result.sanitizedData.notificationSent).toBe(false);
    });

    it('should default source to direct when not provided in order payload', () => {
      const payload = {
        tableNumber: '1',
        items: [
          { name: '冬蔭功酸辣湯', quantity: 1, price: 280 }
        ]
      };

      const result = validateOrderPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.source).toBe('direct');
      expect(result.sanitizedData.notificationSent).toBe(false);
    });

    it('should sanitize and preserve Google Business metadata on reservation payload', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = futureDate.toISOString().split('T')[0];

      const payload = {
        customerName: '陳小姐',
        phone: '0912345678',
        guestCount: 4,
        date: dateStr,
        time: '18:30',
        source: 'google_business',
        utm_medium: 'profile_action'
      };

      const result = validateReservationPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.source).toBe('google_business');
      expect(result.sanitizedData.utm_medium).toBe('profile_action');
      expect(result.sanitizedData.notificationSent).toBe(false);
    });
  });

  describe('Real-Time Notification Formatting', () => {
    it('should highlight Google Business origin in LINE reservation message', () => {
      const reservation: ReservationNotificationData = {
        id: 'RES-001',
        customerName: '林大華',
        phone: '0988777666',
        guestCount: 2,
        tableNumber: '3',
        date: '2026-10-01',
        time: '19:00',
        source: 'google_business'
      };

      const message = formatLineReservationMessage(reservation);
      expect(message).toContain('【Google 商家新預約訂位】');
      expect(message).toContain('Google 商家檔案 (Google Business Profile)');
    });

    it('should show organic text for direct reservations in LINE message', () => {
      const reservation: ReservationNotificationData = {
        id: 'RES-002',
        customerName: '現場顧客',
        phone: '0911222333',
        guestCount: 2,
        date: '2026-10-01',
        time: '19:00',
        source: 'direct'
      };

      const message = formatLineReservationMessage(reservation);
      expect(message).toContain('【新預約訂位通知】');
      expect(message).toContain('現場/官方系統登記');
    });

    it('should format push message for Google Business online orders', () => {
      const order: OrderNotificationData = {
        id: 'ORD-TEST-999',
        tableNumber: '外帶 501',
        items: [
          { name: { zh: '炙烤松阪豬' }, quantity: 1, price: 320 }
        ],
        total: 320,
        customerName: '張志豪',
        source: 'google_business'
      };

      const message = formatLineOrderMessage(order);
      expect(message).toContain('【Google 商家新訂單通知】');
      expect(message).toContain('Google 商家檔案 (Online Ordering)');
      expect(message).toContain('炙烤松阪豬 x1');
      expect(message).toContain('$320 元');
    });
  });

  describe('KDS Audio Announcement Phrasing', () => {
    it('should prefix Google Business orders in voice announcement', () => {
      const googleOrder: Order = {
        id: 'ord_12345',
        tableNumber: '外帶 888',
        items: [],
        subtotal: 200,
        serviceCharge: 0,
        total: 200,
        status: 'pending',
        createdAt: new Date().toISOString(),
        customerAvatar: '',
        paymentMethod: 'cash',
        isMember: false,
        source: 'google_business'
      };

      const announcement = formatOrderAnnouncementText([googleOrder]);
      expect(announcement).toContain('Google 商家外帶訂單');
      expect(announcement).toContain('單號 888');
    });

    it('should prefix Google Business dine-in table orders in voice announcement', () => {
      const googleDineInOrder: Order = {
        id: 'ord_67890',
        tableNumber: '6',
        items: [],
        subtotal: 500,
        serviceCharge: 50,
        total: 550,
        status: 'pending',
        createdAt: new Date().toISOString(),
        customerAvatar: '',
        paymentMethod: 'credit',
        isMember: false,
        source: 'google_business'
      };

      const announcement = formatOrderAnnouncementText([googleDineInOrder]);
      expect(announcement).toContain('Google 商家桌號 6 號');
    });
  });

  describe('Critical Timers Preservation (Anti-Regression & Anti-Over-Pruning)', () => {
    it('must retain Chromium utteranceHeartbeat workaround in kdsAudio.ts', () => {
      const kdsAudioCode = fs.readFileSync(path.join(__dirname, '../src/utils/kdsAudio.ts'), 'utf-8');
      expect(kdsAudioCode).toContain('utteranceHeartbeat = setInterval(');
      expect(kdsAudioCode).toContain('window.speechSynthesis.pause()');
      expect(kdsAudioCode).toContain('window.speechSynthesis.resume()');
    });

    it('must retain LAN ESC/POS printer ping in KitchenDisplaySystem.tsx', () => {
      const kdsCode = fs.readFileSync(path.join(__dirname, '../src/components/KitchenDisplaySystem.tsx'), 'utf-8');
      expect(kdsCode).toContain('setInterval(() => triggerPrinterPing(printerIp), 30000)');
    });

    it('must retain Local POS Hardware Bridge ping in ManagerDashboard.tsx', () => {
      const mgrCode = fs.readFileSync(path.join(__dirname, '../src/components/ManagerDashboard.tsx'), 'utf-8');
      expect(mgrCode).toContain('setInterval(checkBridgeStatus, 15000)');
    });

    it('must retain Offline Queue probe in OrderDataContext.tsx', () => {
      const orderDataCode = fs.readFileSync(path.join(__dirname, '../src/context/OrderDataContext.tsx'), 'utf-8');
      expect(orderDataCode).toContain('const probeTimer = setInterval(');
      expect(orderDataCode).toContain('checkAndSyncTables, 15000');
    });
  });
});
