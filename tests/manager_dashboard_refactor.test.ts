/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memberService, MEMBERS_STORAGE_KEY } from '../src/services/memberService';
import { getMaskedEmail, calculateOrderTotalWithPayment } from '../src/components/manager/ManagerDashboardUtils';

describe('Manager Dashboard Refactoring & Security Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('MemberService Tests', () => {
    it('should return empty array when storage is empty or invalid JSON', () => {
      expect(memberService.getMembers()).toEqual([]);
      localStorage.setItem(MEMBERS_STORAGE_KEY, 'invalid-json-data');
      expect(memberService.getMembers()).toEqual([]);
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify({ not: 'an array' }));
      expect(memberService.getMembers()).toEqual([]);
    });

    it('should save and retrieve members properly', () => {
      const mockMembers = [
        { email: 'Alice@example.com', name: 'Alice', points: 100, balance: 500 },
        { email: 'Bob@example.com', name: 'Bob', points: 50, balance: 200 },
      ];
      memberService.saveMembers(mockMembers);
      const retrieved = memberService.getMembers();
      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].email).toBe('Alice@example.com');
    });

    it('should find member by email case-insensitively and trim spaces', () => {
      const mockMembers = [
        { email: 'customer@test.com', name: 'Test Customer', points: 20 },
      ];
      memberService.saveMembers(mockMembers);

      const found = memberService.getMemberByEmail('  CUSTOMER@test.com  ');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Test Customer');

      expect(memberService.getMemberByEmail('notfound@test.com')).toBeNull();
    });

    it('should find member by name', () => {
      const mockMembers = [
        { email: 'vip@test.com', name: 'VIP Customer', points: 20 },
      ];
      memberService.saveMembers(mockMembers);

      const found = memberService.getMemberByName('VIP Customer');
      expect(found).not.toBeNull();
      expect(found?.email).toBe('vip@test.com');
    });

    it('should correctly update points and dispatch event', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      const mockMembers = [
        { email: 'user@test.com', name: 'User 1', points: 50 },
      ];
      memberService.saveMembers(mockMembers);

      // Add points
      const addRes = memberService.updateMemberPoints('user@test.com', 30);
      expect(addRes.success).toBe(true);
      expect(addRes.newPoints).toBe(80);
      expect(localStorage.getItem('google-points-user@test.com')).toBe('80');

      // Deduct points (prevent negative)
      const deductRes = memberService.updateMemberPoints('user@test.com', -100);
      expect(deductRes.success).toBe(true);
      expect(deductRes.newPoints).toBe(0);
      expect(localStorage.getItem('google-points-user@test.com')).toBe('0');

      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should correctly update balance', () => {
      const mockMembers = [
        { email: 'user@test.com', name: 'User 1', balance: 1000 },
      ];
      memberService.saveMembers(mockMembers);

      // Deduct balance
      const deductRes = memberService.updateMemberBalance('user@test.com', -400);
      expect(deductRes.success).toBe(true);
      expect(deductRes.newBalance).toBe(600);

      // Reload
      const updated = memberService.getMemberByEmail('user@test.com');
      expect(updated?.balance).toBe(600);
    });

    it('should delete member and remove corresponding point key', () => {
      const mockMembers = [
        { email: 'user1@test.com', name: 'User 1' },
        { email: 'user2@test.com', name: 'User 2' },
      ];
      memberService.saveMembers(mockMembers);
      localStorage.setItem('google-points-user1@test.com', '100');

      const delRes = memberService.deleteMember('user1@test.com');
      expect(delRes.success).toBe(true);

      const remaining = memberService.getMembers();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].email).toBe('user2@test.com');
      expect(localStorage.getItem('google-points-user1@test.com')).toBeNull();
    });
  });

  describe('Security & Masking Tests', () => {
    it('should mask emails uniformly without hardcoding specific addresses', () => {
      expect(getMaskedEmail('')).toBe('');
      // Test previously hardcoded addresses now use standard masking rule (slice 0,3)
      expect(getMaskedEmail('topztar@gmail.com')).toBe('VIP-USR (top****@gmail.com)');
      expect(getMaskedEmail('thai_foodie@gmail.com')).toBe('VIP-USR (tha****@gmail.com)');
      expect(getMaskedEmail('vegan_sabay@gmail.com')).toBe('VIP-USR (veg****@gmail.com)');

      // Short username
      expect(getMaskedEmail('ab@test.com')).toBe('VIP-USR (a***@test.com)');
    });
  });

  describe('Unified Pricing & Service Charge Tests', () => {
    it('should correctly compute total and 10% service charge for credit and twqr payments', () => {
      const mockItems = [
        { id: '1', menuItemId: 'm1', name: { zh: '和牛', en: 'Wagyu Beef' }, price: 500, qty: 2, customization: {} }, // 1000
      ];

      // Credit card order: subtotal 1000 + 10% service charge 100 = 1100
      const creditPricing = calculateOrderTotalWithPayment({
        items: mockItems as any,
        paymentMethod: 'credit',
      });
      expect(creditPricing.subtotal).toBe(1000);
      expect(creditPricing.serviceCharge).toBe(100);
      expect(creditPricing.total).toBe(1100);

      // TWQR order: subtotal 1000 + 10% service charge 100 = 1100
      const twqrPricing = calculateOrderTotalWithPayment({
        items: mockItems as any,
        paymentMethod: 'twqr',
      });
      expect(twqrPricing.serviceCharge).toBe(100);
      expect(twqrPricing.total).toBe(1100);

      // Cash order: subtotal 1000, no service charge = 1000
      const cashPricing = calculateOrderTotalWithPayment({
        items: mockItems as any,
        paymentMethod: 'cash',
      });
      expect(cashPricing.serviceCharge).toBe(0);
      expect(cashPricing.total).toBe(1000);
    });

    it('should correctly respect discounts in final total', () => {
      const mockItems = [
        { id: '1', menuItemId: 'm1', name: { zh: '牛排', en: 'BBQ Ribs' }, price: 600, qty: 1, customization: {} },
      ];

      const discounted = calculateOrderTotalWithPayment({
        items: mockItems as any,
        paymentMethod: 'cash',
        discount: 100,
      });
      expect(discounted.subtotal).toBe(600);
      expect(discounted.discount).toBe(100);
      expect(discounted.total).toBe(500);
    });
  });
});
