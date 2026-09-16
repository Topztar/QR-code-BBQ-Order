import { describe, it, expect } from 'vitest';
import { orderCalculationService } from '../src/services/orderCalculationService';
import { validateOrderPayload } from '../functions/src/validators';

describe('Order Audit Fixes Tests', () => {
  it('should calculate subtotal correctly considering qty and quantity fields', () => {
    // Tests that frontend `orderCalculationService` correctly parses `quantity` just like backend
    const mockItems = [
      { id: '1', name: 'Item 1', price: 100, qty: 2 },
      { id: '2', name: 'Item 2', price: 150, quantity: 3 }, // Should fallback to quantity
      { id: '3', name: 'Item 3', price: 50 } // Should default to 1
    ];
    
    // (100 * 2) + (150 * 3) + (50 * 1) = 200 + 450 + 50 = 700
    const subtotal = orderCalculationService.computeOrderItemsSubtotal(mockItems);
    expect(subtotal).toBe(700);
  });

  it('should validate order payload without redundant total calculations', () => {
    const payload = {
      tableNumber: '10',
      items: [
        { name: 'Item 1', price: 100, qty: 1 }
      ]
    };
    const result = validateOrderPayload(payload);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData?.tableNumber).toBe('10');
    // Ensure total/subtotal etc are not injected if not provided (they are removed from validators.ts)
    expect((result.sanitizedData as any).total).toBeUndefined();
    expect((result.sanitizedData as any).subtotal).toBeUndefined();
  });
});
