/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { CategoryFormModal } from '../src/components/manager/modals/CategoryFormModal';
import {
  CATEGORY_I18N_PRESETS,
  TRANSLATION_DICTIONARY,
  normalizeCategoryId,
  generateRandomCategoryId,
  resolveCategoryId,
  resolveCategoryMultilingualNames,
  autoFillCategoryTranslations,
} from '../src/utils/i18n';
import { validateCategoryPayload } from '../functions/src/validators';
import { registerMenuRoutes as registerFunctionsMenuRoutes } from '../functions/src/routes/menu';
import { registerMenuRoutes as registerExpressMenuRoutes } from '../src/server/routes/menu';
import express from 'express';

describe('Dual Root-Cause Bug Fix Verification: Category ID Auto-Gen & Multilingual Auto-Fill', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Checkpoint 1: Empty Category ID Fallback (.trim() || cat-xxxxxx, no ?? trap)', () => {
    it('never allows empty string "" or whitespace to bypass cat-xxxxxx fallback', () => {
      const fromEmpty = resolveCategoryId('');
      const fromSpaces = resolveCategoryId('   ');
      const fromSymbols = resolveCategoryId('!@#$%^');
      const fromUndefined = resolveCategoryId(undefined);

      expect(fromEmpty).toMatch(/^cat-[a-z0-9]{6}$/);
      expect(fromSpaces).toMatch(/^cat-[a-z0-9]{6}$/);
      expect(fromSymbols).toMatch(/^cat-[a-z0-9]{6}$/);
      expect(fromUndefined).toMatch(/^cat-[a-z0-9]{6}$/);
      expect(generateRandomCategoryId()).toMatch(/^cat-[a-z0-9]{6}$/);
    });

    it('preserves and normalizes valid semantic category IDs', () => {
      expect(normalizeCategoryId('  TomYum  ')).toBe('tomyum');
      expect(resolveCategoryId('  Snacks  ')).toBe('snacks');
      expect(resolveCategoryId('cat-svadcb')).toBe('cat-svadcb');
    });

    it('auto-generates cat-xxxxxx when creating a new category with blank ID in CategoryFormModal', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <CategoryFormModal
          isOpen={true}
          onClose={() => {}}
          editingCategory={null}
          onSave={onSave}
          catError={null}
        />
      );

      const inputs = container.querySelectorAll('input[type="text"]');
      const idInput = inputs[0] as HTMLInputElement;
      const zhInput = inputs[1] as HTMLInputElement;

      expect(idInput.disabled).toBe(false);
      expect(idInput.value).toBe('');

      fireEvent.change(zhInput, { target: { value: '下酒必點小食' } });
      const form = container.querySelector('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });

      const payload = onSave.mock.calls[0][0];
      expect(payload.id).toMatch(/^cat-[a-z0-9]{6}$/);
      expect(payload.name.zh).toBe('下酒必點小食');
      expect(payload.name.en).toBe('Must-Order Bar Snacks');
    });
  });

  describe('Checkpoint 2: Edit Category Modal Unlocks Empty-ID Categories & Locks Valid-ID Categories', () => {
    const emptyIdBarSnacksCategory = {
      id: '',
      name: {
        zh: '下酒必點小食',
        en: '',
        th: '',
        ja: '',
        ko: '',
        vi: '',
        ru: '',
        es: '',
      },
      showOnCustomerPage: true,
    };

    it('unlocks the Category Tag ID input when editing a category with empty ID ("") and allows manual "snacks" input', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <CategoryFormModal
          isOpen={true}
          onClose={() => {}}
          editingCategory={emptyIdBarSnacksCategory}
          onSave={onSave}
          catError={null}
        />
      );

      const inputs = container.querySelectorAll('input[type="text"]');
      const idInput = inputs[0] as HTMLInputElement;

      // Must be UNLOCKED because editingCategory.id is ""
      expect(idInput.disabled).toBe(false);

      fireEvent.change(idInput, { target: { value: 'snacks' } });
      expect(idInput.value).toBe('snacks');

      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });

      const saved = onSave.mock.calls[0][0];
      expect(saved.id).toBe('snacks');
      expect(saved.previousId).toBe('');
      expect(saved.name).toEqual({
        zh: '下酒必點小食',
        en: 'Must-Order Bar Snacks',
        th: 'กับแกล้มต้องสั่ง',
        ja: 'お酒のおつまみ',
        ko: '필수 안주 스낵',
        vi: 'Món nhắm bắt buộc',
        ru: 'Закуски к напиткам',
        es: 'Aperitivos para acompañar',
      });
    });

    it('auto-generates cat-xxxxxx when editing an empty-ID category and leaving the ID input blank on Save', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <CategoryFormModal
          isOpen={true}
          onClose={() => {}}
          editingCategory={emptyIdBarSnacksCategory}
          onSave={onSave}
          catError={null}
        />
      );

      const inputs = container.querySelectorAll('input[type="text"]');
      const idInput = inputs[0] as HTMLInputElement;
      expect(idInput.disabled).toBe(false);
      expect(idInput.value).toBe('');

      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });

      const saved = onSave.mock.calls[0][0];
      expect(saved.id).toMatch(/^cat-[a-z0-9]{6}$/);
      expect(saved.previousId).toBe('');
    });

    it('locks the Category Tag ID input when editing a category that already has a valid non-empty ID', () => {
      const validCategory = {
        id: 'snacks',
        name: {
          zh: '下酒必點小食',
          en: 'Must-Order Bar Snacks',
        },
        showOnCustomerPage: true,
      };

      const { container } = render(
        <CategoryFormModal
          isOpen={true}
          onClose={() => {}}
          editingCategory={validCategory}
          onSave={vi.fn()}
          catError={null}
        />
      );

      const idInput = container.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
      expect(idInput.disabled).toBe(true);
      expect(idInput.value).toBe('snacks');
    });
  });

  describe('Checkpoint 3: Multilingual Auto-Fill (Preset Dictionary + onBlur + Auto-Translate Button)', () => {
    it('contains complete 8-language preset for 下酒必點小食 in CATEGORY_I18N_PRESETS and TRANSLATION_DICTIONARY', () => {
      expect(CATEGORY_I18N_PRESETS['下酒必點小食']).toEqual({
        idSuggestion: 'snacks',
        en: 'Must-Order Bar Snacks',
        th: 'กับแกล้มต้องสั่ง',
        ja: 'お酒のおつまみ',
        ko: '필수 안주 스낵',
        vi: 'Món nhắm bắt buộc',
        ru: 'Закуски к напиткам',
        es: 'Aperitivos para acompañar',
      });
      expect(TRANSLATION_DICTIONARY['下酒必點小食']?.en).toBe('Must-Order Bar Snacks');
      expect(TRANSLATION_DICTIONARY['下酒必點小食']?.ko).toBe('필수 안주 스낵');
    });

    it('immediately auto-populates all 7 multilingual fields when opening Edit Category for 下酒必點小食 with blank translations', () => {
      const { container } = render(
        <CategoryFormModal
          isOpen={true}
          onClose={() => {}}
          editingCategory={{
            id: '',
            name: { zh: '下酒必點小食', en: '', th: '', ja: '', ko: '', vi: '', ru: '', es: '' },
            showOnCustomerPage: true,
          }}
          onSave={vi.fn()}
          catError={null}
        />
      );

      const textInputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
      // [0]: id, [1]: zh, [2]: en, [3]: th, [4]: ja, [5]: ko, [6]: vi, [7]: ru, [8]: es
      expect(textInputs[1].value).toBe('下酒必點小食');
      expect(textInputs[2].value).toBe('Must-Order Bar Snacks');
      expect(textInputs[3].value).toBe('กับแกล้มต้องสั่ง');
      expect(textInputs[4].value).toBe('お酒のおつまみ');
      expect(textInputs[5].value).toBe('필수 안주 스낵');
      expect(textInputs[6].value).toBe('Món nhắm bắt buộc');
      expect(textInputs[7].value).toBe('Закуски к напиткам');
      expect(textInputs[8].value).toBe('Aperitivos para acompañar');
    });

    it('auto-populates all 7 target language fields on blur or one-click translate without paid LLM keys', async () => {
      const resolved = await autoFillCategoryTranslations(
        { zh: '下酒必點小食' },
        { overwriteExisting: false, fallbackToSource: true }
      );
      expect(resolved).toEqual({
        zh: '下酒必點小食',
        en: 'Must-Order Bar Snacks',
        th: 'กับแกล้มต้องสั่ง',
        ja: 'お酒のおつまみ',
        ko: '필수 안주 스낵',
        vi: 'Món nhắm bắt buộc',
        ru: 'Закуски к напиткам',
        es: 'Aperitivos para acompañar',
      });
    });
  });

  describe('Checkpoint 4: Backend Validation & Empty-ID Record Migration / Deduplication', () => {
    it('validateCategoryPayload enforces cat-xxxxxx fallback for empty ID and populates 8-language translations', () => {
      const resBlank = validateCategoryPayload({
        id: '',
        previousId: '',
        name: { zh: '下酒必點小食', en: '' },
        showOnCustomerPage: true,
      });

      expect(resBlank.isValid).toBe(true);
      expect(resBlank.sanitizedData?.id).toMatch(/^cat-[a-z0-9]{6}$/);
      expect(resBlank.sanitizedData?.name).toEqual({
        zh: '下酒必點小食',
        en: 'Must-Order Bar Snacks',
        th: 'กับแกล้มต้องสั่ง',
        ja: 'お酒のおつまみ',
        ko: '필수 안주 스낵',
        vi: 'Món nhắm bắt buộc',
        ru: 'Закуски к напиткам',
        es: 'Aperitivos para acompañar',
      });
    });

    it('migrates and deduplicates existing empty-ID category record on PUT /api/categories/:id so no duplicate id="" remains', () => {
      let liveCategories: any[] = [
        { id: 'tomyum', name: { zh: '冬蔭功系列 🍜', en: 'Tom Yum Series 🍜' }, showOnCustomerPage: true, orderIndex: 0 },
        { id: '', name: { zh: '下酒必點小食', en: '', th: '', ja: '', ko: '', vi: '', ru: '', es: '' }, showOnCustomerPage: true, orderIndex: 12 },
      ];

      const app = express();
      registerExpressMenuRoutes(app, {
        getLiveMenu: () => [],
        setLiveMenu: () => {},
        getLiveCategories: () => liveCategories,
        setLiveCategories: (cats) => {
          liveCategories = cats;
        },
        getLiveOptionRules: () => [],
        setLiveOptionRules: () => {},
        getLivePromoCombo: () => ({}),
        setLivePromoCombo: () => {},
        getLivePromoCombos: () => [],
        setLivePromoCombos: () => {},
        checkAndRestoreSoldOutMenuItems: () => false,
        sanitizeMenu: () => {},
        saveStateToDisk: () => {},
      });

      // Simulate invoking PUT /api/categories/snacks to migrate the 13th category (previousId: "")
      const stack = (app as any)._router.stack;
      const putLayer = stack.find(
        (layer: any) => layer.route && layer.route.path === '/api/categories/:id' && layer.route.methods.put
      );
      expect(putLayer).toBeDefined();

      let responseData: any = null;
      const req: any = {
        params: { id: 'snacks' },
        body: {
          id: 'snacks',
          previousId: '',
          name: { zh: '下酒必點小食' },
          showOnCustomerPage: true,
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn((payload) => {
          responseData = payload;
          return res;
        }),
      };

      putLayer.route.stack[0].handle(req, res, () => {});

      expect(responseData?.success).toBe(true);
      expect(responseData?.id).toBe('snacks');
      // Verify no empty-ID duplicate exists and total categories count remains 2
      expect(liveCategories).toHaveLength(2);
      expect(liveCategories.some((c) => c.id === '')).toBe(false);
      const migrated = liveCategories.find((c) => c.id === 'snacks');
      expect(migrated).toBeDefined();
      expect(migrated.name.en).toBe('Must-Order Bar Snacks');
      expect(migrated.name.th).toBe('กับแกล้มต้องสั่ง');
      expect(migrated.name.ko).toBe('필수 안주 스낵');
    });

    it('deletes dirty empty-ID Firestore document and writes single clean doc on Cloud Functions PUT /categories/:id', async () => {
      const deleteDirtyDoc = vi.fn().mockResolvedValue(undefined);
      const setCleanDoc = vi.fn().mockResolvedValue(undefined);

      const mockDocs = [
        {
          id: 'auto-firestore-doc-13',
          data: () => ({
            id: '',
            name: { zh: '下酒必點小食', en: '' },
            showOnCustomerPage: true,
            orderIndex: 12,
          }),
          ref: { delete: deleteDirtyDoc },
        },
      ];

      const mockDb: any = {
        collection: vi.fn((colName: string) => {
          if (colName === 'categories') {
            return {
              get: vi.fn().mockResolvedValue({ docs: mockDocs }),
              doc: vi.fn((_docId: string) => ({
                set: setCleanDoc,
                delete: vi.fn().mockResolvedValue(undefined),
              })),
            };
          }
          return {};
        }),
      };

      const app = express();
      registerFunctionsMenuRoutes(app as any, {
        db: mockDb,
        storageBucket: {} as any,
        requireStaffAuth: (_req, _res, next) => next(),
        createRateLimiter: () => (_req, _res, next) => next(),
        sendErrorResponse: (res, err) => res.status(500).json({ error: String(err) }),
      });

      const stack = (app as any)._router.stack;
      const putLayer = stack.find(
        (layer: any) =>
          layer.route &&
          Array.isArray(layer.route.path) &&
          layer.route.path.includes('/api/categories/:id') &&
          layer.route.methods.put
      );
      expect(putLayer).toBeDefined();

      let responseData: any = null;
      const req: any = {
        params: { id: 'snacks' },
        body: {
          id: 'snacks',
          previousId: '',
          name: { zh: '下酒必點小食' },
          showOnCustomerPage: true,
        },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn((payload) => {
          responseData = payload;
          return res;
        }),
      };

      // Execute final route handler
      const handlers = putLayer.route.stack;
      await handlers[handlers.length - 1].handle(req, res, () => {});

      expect(deleteDirtyDoc).toHaveBeenCalledTimes(1);
      expect(setCleanDoc).toHaveBeenCalledTimes(1);
      const writtenPayload = setCleanDoc.mock.calls[0][0];
      expect(writtenPayload.id).toBe('snacks');
      expect(writtenPayload.orderIndex).toBe(12);
      expect(writtenPayload.name.en).toBe('Must-Order Bar Snacks');
      expect(writtenPayload.name.ja).toBe('お酒のおつまみ');
      expect(responseData?.success).toBe(true);
      expect(responseData?.id).toBe('snacks');
    });
  });
});
