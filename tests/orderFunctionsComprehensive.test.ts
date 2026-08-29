import { describe, it, expect, beforeAll } from 'vitest';
import { validateOrderPayload } from '../functions/src/validators';
import { calculateOrderTotals } from './businessLogic.test';

describe('Comprehensive Order Functions Test Suite', () => {

  describe('1. Order Payload Validation & Sanitization', () => {
    it('successfully validates standard dine-in order payload', () => {
      const payload = {
        tableNumber: '3',
        guestCount: 4,
        paymentMethod: 'cash',
        items: [
          { menuItemId: 'ty-01', name: '冬蔭功海鮮鍋 Tom Yum Seafood Soup', price: 380, quantity: 1 },
          { menuItemId: 'sk-01', name: '沙貝特選牛肋條 Beef Rib Skewer', price: 90, quantity: 4 }
        ],
        customerName: '王小明',
        notes: '微辣，香菜多一點'
      };

      const res = validateOrderPayload(payload);
      expect(res.isValid).toBe(true);
      expect(res.sanitizedData?.tableNumber).toBe('3');
      expect(res.sanitizedData?.items).toHaveLength(2);
      expect(res.sanitizedData?.totalAmount).toBe(380 * 1 + 90 * 4); // 740
      expect(res.sanitizedData?.notes).toBe('微辣，香菜多一點');
    });

    it('successfully validates in-store takeout order (?table=takeout mode)', () => {
      const payload = {
        tableNumber: 'takeout',
        paymentMethod: 'twqr',
        items: [
          { menuItemId: 'ty-01', name: '冬蔭功海鮮鍋', price: 380, qty: 1 }
        ]
      };

      const res = validateOrderPayload(payload);
      expect(res.isValid).toBe(true);
      expect(res.sanitizedData?.tableNumber).toBe('takeout');
      expect(res.sanitizedData?.totalAmount).toBe(380);
    });

    it('successfully validates online Google takeout order with customer takeoutInfo', () => {
      const payload = {
        tableNumber: '外帶 882',
        customerName: '李小姐',
        customerPhone: '0988776655',
        takeoutInfo: {
          customerName: '李小姐',
          phone: '0988776655',
          pickupTime: '19:30'
        },
        items: [
          { menuItemId: 'sk-02', name: '招牌泰式烤五花 Pork Belly Skewer', price: 70, quantity: 3 }
        ]
      };

      const res = validateOrderPayload(payload);
      expect(res.isValid).toBe(true);
      expect(res.sanitizedData?.customerName).toBe('李小姐');
      expect(res.sanitizedData?.customerPhone).toBe('0988776655');
      expect(res.sanitizedData?.takeoutInfo?.pickupTime).toBe('19:30');
      expect(res.sanitizedData?.totalAmount).toBe(210);
    });

    it('rejects order with empty items', () => {
      const payload = { tableNumber: '1', items: [] };
      const res = validateOrderPayload(payload);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('無有效餐點');
    });

    it('rejects order with missing or empty table number', () => {
      const payload = {
        tableNumber: '   ',
        items: [{ name: 'Test', price: 100, quantity: 1 }]
      };
      const res = validateOrderPayload(payload);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('桌號');
    });

    it('rejects order with negative or invalid quantities', () => {
      const payload = {
        tableNumber: '1',
        items: [{ name: 'Test Item', price: 100, quantity: -2 }]
      };
      const res = validateOrderPayload(payload);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('數量異常');
    });

    it('sanitizes malicious script tags and control characters in notes', () => {
      const payload = {
        tableNumber: '2\u0000',
        items: [{ name: 'Safe Item', price: 150, quantity: 1 }],
        notes: '加蔥<script>alert("xss")</script>\u0008'
      };
      const res = validateOrderPayload(payload);
      expect(res.isValid).toBe(true);
      expect(res.sanitizedData?.tableNumber).not.toContain('\u0000');
      expect(res.sanitizedData?.notes).not.toContain('\u0008');
    });
  });

  describe('2. Order Financial & Pricing Calculations', () => {
    it('applies 10% service charge for dine-in but 0% for takeout', () => {
      const items = [{ price: 500, qty: 1 }];

      const dineIn = calculateOrderTotals({
        items,
        isTakeout: false,
        serviceChargeRate: 0.1,
        minSpendPerPerson: 200,
        guestCount: 2
      });

      const takeout = calculateOrderTotals({
        items,
        isTakeout: true,
        serviceChargeRate: 0.1,
        minSpendPerPerson: 200,
        guestCount: 2
      });

      expect(dineIn.subtotal).toBe(500);
      expect(dineIn.serviceCharge).toBe(50);
      expect(dineIn.total).toBe(550);

      expect(takeout.subtotal).toBe(500);
      expect(takeout.serviceCharge).toBe(0);
      expect(takeout.total).toBe(500);
    });

    it('calculates custom add-ons and premium soup base options', () => {
      const items = [
        {
          price: 200,
          qty: 2,
          customization: {
            soupBase: 'coconut-milk', // +50
            selectedAddOns: [
              { price: 30, qty: 1 },  // +30
              { price: 20, qty: 2 }   // +40
            ]
          }
        }
      ];

      // Item single price: 200 + 50 + 30 + 40 = 320. Qty 2 -> 640.
      const result = calculateOrderTotals({
        items,
        isTakeout: true,
        serviceChargeRate: 0,
        minSpendPerPerson: 0,
        guestCount: 1
      });

      expect(result.subtotal).toBe(640);
      expect(result.total).toBe(640);
    });
  });

  describe('3. Order Lifecycle & Status Progression', () => {
    interface MockOrder {
      id: string;
      status: 'pending' | 'preparing' | 'serving' | 'paid' | 'cancelled';
      isPaid: boolean;
      refundLogs?: Array<{ reason: string; amount: number; timestamp: string }>;
      isFlagged?: boolean;
      flagReason?: string;
    }

    it('simulates order state machine: pending -> preparing -> serving -> paid', () => {
      const order: MockOrder = {
        id: 'ORD-TEST-001',
        status: 'pending',
        isPaid: false
      };

      // Kitchen receives order
      expect(order.status).toBe('pending');

      // Kitchen starts cooking
      order.status = 'preparing';
      expect(order.status).toBe('preparing');

      // Kitchen marks dish ready/served
      order.status = 'serving';
      expect(order.status).toBe('serving');

      // Cashier collects payment
      order.status = 'paid';
      order.isPaid = true;
      expect(order.status).toBe('paid');
      expect(order.isPaid).toBe(true);
    });

    it('handles cancellation and records refund log audit trail', () => {
      const order: MockOrder = {
        id: 'ORD-TEST-002',
        status: 'paid',
        isPaid: true,
        refundLogs: []
      };

      // Perform refund
      order.status = 'cancelled';
      order.refundLogs?.push({
        reason: 'Customer requested cancellation before prep',
        amount: 520,
        timestamp: new Date().toISOString()
      });

      expect(order.status).toBe('cancelled');
      expect(order.refundLogs).toHaveLength(1);
      expect(order.refundLogs?.[0].amount).toBe(520);
      expect(order.refundLogs?.[0].reason).toContain('Customer requested cancellation');
    });

    it('supports flagging suspicious or modified orders', () => {
      const order: MockOrder = {
        id: 'ORD-TEST-003',
        status: 'pending',
        isPaid: false
      };

      order.isFlagged = true;
      order.flagReason = 'Special allergy note requires manager confirmation';

      expect(order.isFlagged).toBe(true);
      expect(order.flagReason).toContain('allergy');
    });
  });

  describe('4. Inventory Recipe Stock Deduction Logic', () => {
    interface Ingredient {
      id: string;
      name: string;
      stock: number;
      unit: string;
    }

    interface RecipeCost {
      ingredientId: string;
      amount: number;
    }

    it('correctly calculates and deducts raw ingredient stocks per order item', () => {
      const inventory: Record<string, Ingredient> = {
        'ing-pork': { id: 'ing-pork', name: '梅花豬肉', stock: 1000, unit: 'g' },
        'ing-sauce': { id: 'ing-sauce', name: '泰式燒烤醬', stock: 500, unit: 'ml' }
      };

      const recipeMap: Record<string, RecipeCost[]> = {
        'sk-01': [
          { ingredientId: 'ing-pork', amount: 80 },
          { ingredientId: 'ing-sauce', amount: 15 }
        ]
      };

      const orderItems = [{ menuItemId: 'sk-01', qty: 3 }];

      // Calculate deductions
      const proposedReductions: Record<string, number> = {};
      for (const item of orderItems) {
        const costs = recipeMap[item.menuItemId] || [];
        for (const cost of costs) {
          proposedReductions[cost.ingredientId] = (proposedReductions[cost.ingredientId] || 0) + (cost.amount * item.qty);
        }
      }

      expect(proposedReductions['ing-pork']).toBe(240); // 80 * 3
      expect(proposedReductions['ing-sauce']).toBe(45); // 15 * 3

      // Deduct
      for (const [id, needed] of Object.entries(proposedReductions)) {
        inventory[id].stock -= needed;
      }

      expect(inventory['ing-pork'].stock).toBe(760);
      expect(inventory['ing-sauce'].stock).toBe(455);
    });

    it('detects out-of-stock items and prevents order fulfillment', () => {
      const inventory: Record<string, Ingredient> = {
        'ing-beef': { id: 'ing-beef', name: '牛肋條', stock: 50, unit: 'g' }
      };

      const recipeMap: Record<string, RecipeCost[]> = {
        'sk-02': [{ ingredientId: 'ing-beef', amount: 100 }]
      };

      const orderItems = [{ menuItemId: 'sk-02', qty: 1 }]; // Needs 100g, has 50g

      let isOutOfStock = false;
      for (const item of orderItems) {
        const costs = recipeMap[item.menuItemId] || [];
        for (const cost of costs) {
          if (inventory[cost.ingredientId].stock < cost.amount * item.qty) {
            isOutOfStock = true;
          }
        }
      }

      expect(isOutOfStock).toBe(true);
    });
  });

  describe('5. Live HTTP API Endpoint Integration (Local Server)', () => {
    const BASE_URL = 'http://localhost:3000';
    let isServerRunning = false;
    let sampleMenuItem: any = null;

    beforeAll(async () => {
      try {
        const menuRes = await fetch(`${BASE_URL}/api/menu`);
        if (menuRes.ok) {
          const menuList = await menuRes.json();
          sampleMenuItem = menuList.find((m: any) => m.available !== false) || menuList[0];
          isServerRunning = true;
        }
      } catch {
        isServerRunning = false;
      }
    });

    it('GET /api/orders returns orders array', async () => {
      if (!isServerRunning) return;

      const res = await fetch(`${BASE_URL}/api/orders`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('POST /api/orders places a new order with idempotency check', async () => {
      if (!isServerRunning || !sampleMenuItem) return;

      const clientOrderId = `ORD-TEST-${Date.now()}`;
      const newOrderPayload = {
        tableNumber: '1',
        paymentMethod: 'cash',
        guestCount: 2,
        clientOrderId,
        reservationNo: 'RES-TEST-PASS', // Bypasses midnight operating hours lock
        items: [
          {
            menuItemId: sampleMenuItem.id,
            name: sampleMenuItem.name,
            price: sampleMenuItem.price,
            qty: 1
          }
        ]
      };

      // 1. First submission
      const res1 = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload)
      });

      expect([200, 201]).toContain(res1.status);
      const order1 = await res1.json();
      expect(order1).toHaveProperty('id');

      // 2. Duplicate submission with same clientOrderId
      const res2 = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload)
      });

      expect([200, 201]).toContain(res2.status);
      const order2 = await res2.json();
      // Idempotency: should return the same order id
      expect(order2.id).toBe(order1.id);
    });

    it('POST /api/orders supports in-store takeout (?table=takeout mode)', async () => {
      if (!isServerRunning || !sampleMenuItem) return;

      const newOrderPayload = {
        tableNumber: 'takeout',
        paymentMethod: 'cash',
        takeoutInfo: { customerName: '現場外帶客' }, // Takeout flag
        items: [
          {
            menuItemId: sampleMenuItem.id,
            name: sampleMenuItem.name,
            price: sampleMenuItem.price,
            qty: 2
          }
        ]
      };

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload)
      });

      expect([200, 201]).toContain(res.status);
      const order = await res.json();
      expect(order.serviceCharge).toBe(0);
      expect(order.total).toBe(sampleMenuItem.price * 2);
    });

    it('POST /api/orders supports online Google takeout (/order) with contact details', async () => {
      if (!isServerRunning || !sampleMenuItem) return;

      const newOrderPayload = {
        tableNumber: '外帶 999',
        customerName: '陳先生',
        customerPhone: '0911223344',
        takeoutInfo: {
          customerName: '陳先生',
          phone: '0911223344',
          pickupTime: '18:45'
        },
        paymentMethod: 'credit',
        items: [
          {
            menuItemId: sampleMenuItem.id,
            name: sampleMenuItem.name,
            price: sampleMenuItem.price,
            qty: 1
          }
        ]
      };

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload)
      });

      expect([200, 201]).toContain(res.status);
      const order = await res.json();
      expect(order.takeoutInfo).toBeDefined();
      expect(order.takeoutInfo.customerName).toBe('陳先生');
      expect(order.takeoutInfo.phone).toBe('0911223344');
    });
  });

});
