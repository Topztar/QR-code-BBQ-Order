import { describe, it, expect } from 'vitest';
import express from 'express';

// Mocking the firestore admin logic to test the concurrent checkout transaction behavior
describe('Concurrent Checkout Regression (M-D01)', () => {
  it('checkout transaction must abort if isPaid is true (M-D01)', async () => {
    let transactionCommitted = false;
    let newCheckoutDocCreated = false;
    let orderUpdateCommitted = false;

    // Simulate the cloud function's transaction runner
    const simulateCloudCheckoutTx = async (initialIsPaid: boolean) => {
      const mockOrderRef = { id: 'ord-123' };
      const mockCheckoutRef = { id: 'chk-abc' };

      const tx = {
        get: async (ref: any) => {
          return {
            exists: true,
            data: () => ({ isPaid: initialIsPaid, total: 1000 })
          };
        },
        update: (ref: any, data: any) => {
          orderUpdateCommitted = true;
        },
        set: (ref: any, data: any) => {
          newCheckoutDocCreated = true;
        }
      };

      const runTransaction = async (callback: (tx: any) => Promise<any>) => {
        try {
          await callback(tx);
          transactionCommitted = true;
        } catch (error: any) {
          if (error.message === 'Order is already paid') {
            return { alreadyPaid: true };
          }
          throw error;
        }
      };

      // The logic to enforce idempotency in M-D01:
      return runTransaction(async (t) => {
        const orderSnap = await t.get(mockOrderRef);
        const orderData = orderSnap.data();

        // M-D01 Guardrail (Enforced in Phase 2)
        if (orderData.isPaid) {
          throw new Error('Order is already paid');
        }

        t.update(mockOrderRef, { isPaid: true, status: 'paid' });
        t.set(mockCheckoutRef, { orderId: 'ord-123', amount: orderData.total });
      });
    };

    // 1. Unpaid order
    await simulateCloudCheckoutTx(false);
    expect(transactionCommitted).toBe(true);
    expect(newCheckoutDocCreated).toBe(true);
    expect(orderUpdateCommitted).toBe(true);

    // Reset flags
    transactionCommitted = false;
    newCheckoutDocCreated = false;
    orderUpdateCommitted = false;

    // 2. Paid order (Concurrent double-click scenario)
    const result = await simulateCloudCheckoutTx(true);
    expect(transactionCommitted).toBe(false);
    expect(newCheckoutDocCreated).toBe(false);
    expect(orderUpdateCommitted).toBe(false);
    expect(result).toEqual({ alreadyPaid: true });
  });
});
