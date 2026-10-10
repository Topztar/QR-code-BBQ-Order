/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DishFormModal } from '../src/components/manager/modals/DishFormModal';
import { ManagerMenuTab } from '../src/components/manager/ManagerMenuTab';
import { MenuItem } from '../src/types';
import { confirmOrderTransaction } from '../functions/src/routes/orders';
import { useDashboardStore } from '../src/stores/dashboard/useDashboardStore';

describe('Inventory Tracking & Hallucination Elimination Audit Tests', () => {
  afterEach(cleanup);
  describe('Admin UI - DishFormModal', () => {
    const mockCategories = [{ id: 'cat-1', name: { zh: '燒烤串燒' }, showOnCustomerPage: true }];
    const mockGlobalRules = {
      spicinessLevels: [],
      noodleTypes: [],
      soupBases: [],
      sauceOptions: [],
      sideDishOptions: []
    };

    it('renders the inventory tracking group and allows entering negative counts', () => {
      const handleSave = vi.fn();
      render(
        <DishFormModal
          isOpen={true}
          onClose={() => {}}
          editingItem={null}
          onSave={handleSave}
          globalRules={mockGlobalRules as any}
          categories={mockCategories}
          ingredients={[]}
        />
      );

      // Checkbox is initially unchecked
      const trackCheckbox = screen.getByRole('checkbox', {
        name: /對齊【餐點數量】/i
      }) as HTMLInputElement;
      expect(trackCheckbox.checked).toBe(false);

      // Check the checkbox to enable inventory tracking
      fireEvent.click(trackCheckbox);
      expect(trackCheckbox.checked).toBe(true);

      // Input appears
      const countInput = screen.getByDisplayValue('0') as HTMLInputElement;
      expect(countInput).toBeTruthy();

      // Enter a negative inventory balance (-2)
      fireEvent.change(countInput, { target: { value: '-2' } });
      expect(countInput.value).toBe('-2');

      // Verify the red warning badge is displayed
      expect(screen.getByText(/⚠️ 目前低於庫存/)).toBeTruthy();
    });

    it('pre-populates existing trackInventory and inventoryCount when editing', () => {
      const mockEditingItem: MenuItem = {
        id: 'dish-1',
        category: 'cat-1',
        name: { zh: '泰式烤豬肉串' },
        price: 120,
        image: '',
        description: { zh: '美味' },
        available: true,
        trackInventory: true,
        inventoryCount: -5
      };

      render(
        <DishFormModal
          isOpen={true}
          onClose={() => {}}
          editingItem={mockEditingItem}
          onSave={async () => {}}
          globalRules={mockGlobalRules as any}
          categories={mockCategories}
          ingredients={[]}
        />
      );

      const trackCheckbox = screen.getByRole('checkbox', {
        name: /對齊【餐點數量】/i
      }) as HTMLInputElement;
      expect(trackCheckbox.checked).toBe(true);
      expect(screen.getByDisplayValue('-5')).toBeTruthy();
      expect(screen.getByText(/⚠️ 目前低於庫存/)).toBeTruthy();
    });
  });

  describe('Admin UI - ManagerMenuTab Availability Dashboard Table', () => {
    const mockMenuItems: MenuItem[] = [
      {
        id: 'dish-unrestricted',
        category: 'cat-1',
        name: { zh: '無限制烤串' },
        price: 80,
        image: '',
        description: { zh: '' },
        available: true,
        trackInventory: false
      },
      {
        id: 'dish-negative',
        category: 'cat-1',
        name: { zh: '超賣烤魚' },
        price: 250,
        image: '',
        description: { zh: '' },
        available: false,
        trackInventory: true,
        inventoryCount: -2
      },
      {
        id: 'dish-zero',
        category: 'cat-1',
        name: { zh: '售罄大蝦' },
        price: 300,
        image: '',
        description: { zh: '' },
        available: false,
        trackInventory: true,
        inventoryCount: 0
      },
      {
        id: 'dish-positive',
        category: 'cat-1',
        name: { zh: '庫存充裕青木瓜' },
        price: 150,
        image: '',
        description: { zh: '' },
        available: true,
        trackInventory: true,
        inventoryCount: 15
      }
    ];

    it('renders the 庫存數量 (Inventory Count) header and all stock badge states', () => {
      useDashboardStore.getState().setLocalMenuItemOrder(mockMenuItems);
      render(
        <ManagerMenuTab
          menuItems={mockMenuItems}
          categories={[{ id: 'cat-1', name: { zh: '燒烤' } }]}
          currentLang="zh"
          triggerAddMenuItemMode={() => {}}
          triggerEditMenuItemMode={() => {}}
          triggerAddCatMode={() => {}}
          triggerEditCatMode={() => {}}
          onDeleteMenuItem={async () => {}}
          onToggleMenuItemAvailability={() => {}}
          onReorderMenuItems={async () => true}
        />
      );

      // Verify Header Row contains 庫存數量 (Inventory Count)
      expect(screen.getByText(/庫存數量 \(Inventory Count\)/)).toBeTruthy();

      // State 1: Unrestricted (-- (無限制))
      expect(screen.getByText('-- (無限制)')).toBeTruthy();

      // State 2: Negative inventory (-2 (低於庫存))
      expect(screen.getByText('-2 (低於庫存)')).toBeTruthy();

      // State 3: Zero inventory (0 份 (已售罄))
      expect(screen.getByText('0 份 (已售罄)')).toBeTruthy();

      // State 4: Positive inventory (15 份)
      expect(screen.getByText('15 份')).toBeTruthy();
    });
  });

  describe('Backend Transaction Pipeline - confirmOrderTransaction', () => {
    it('executes atomic inventory deductions, allows negative balances, and auto-switches to SOLD_OUT when <= 0', async () => {
      const dishesState: Record<string, any> = {
        'dish-tracked-1': {
          id: 'dish-tracked-1',
          name: { zh: '炙烤牛肉串' },
          trackInventory: true,
          inventoryCount: 2,
          available: true
        },
        'dish-untracked': {
          id: 'dish-untracked',
          name: { zh: '特調泰奶' },
          trackInventory: false,
          available: true
        }
      };

      const orderState: Record<string, any> = {
        'ORD-101': {
          id: 'ORD-101',
          status: 'pending',
          items: [
            { menuItemId: 'dish-tracked-1', qty: 3 }, // 2 - 3 = -1 (<= 0 => auto sold out)
            { menuItemId: 'dish-untracked', qty: 2 }   // Bypassed
          ]
        }
      };

      const mockDb: any = {
        collection: (colName: string) => ({
          doc: (docId: string) => {
            const isMenu = colName === 'menu';
            const store = isMenu ? dishesState : orderState;
            return {
              id: docId,
              get: vi.fn(async () => ({
                id: docId,
                exists: !!store[docId],
                data: () => store[docId],
                ref: { id: docId, colName }
              }))
            };
          }
        }),
        runTransaction: async (cb: any) => {
          const updates: any[] = [];
          const tx = {
            get: async (ref: any) => ref.get(),
            update: (ref: any, updateData: any) => {
              updates.push({ ref, updateData });
              const store = ref.colName === 'menu' ? dishesState : orderState;
              if (store[ref.id]) {
                Object.assign(store[ref.id], updateData);
              }
            }
          };
          return cb(tx);
        }
      };

      await confirmOrderTransaction(mockDb, 'ORD-101');

      // 1. Tracked dish should be deducted to -1, available set to false, soldOutType set to permanent
      expect(dishesState['dish-tracked-1'].inventoryCount).toBe(-1);
      expect(dishesState['dish-tracked-1'].available).toBe(false);
      expect(dishesState['dish-tracked-1'].soldOutType).toBe('permanent');
      expect(dishesState['dish-tracked-1'].stockStatus).toBe('SOLD_OUT');

      // 2. Untracked dish should be bypassed
      expect(dishesState['dish-untracked'].inventoryCount).toBeUndefined();
      expect(dishesState['dish-untracked'].available).toBe(true);

      // 3. Order should be confirmed with inventoryDeducted flag
      expect(orderState['ORD-101'].status).toBe('confirmed');
      expect(orderState['ORD-101'].inventoryDeducted).toBe(true);
    });
  });
});
