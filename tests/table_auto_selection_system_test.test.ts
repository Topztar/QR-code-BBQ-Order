/**
 * ============================================================
 * 系統測試套件：指定預約桌號自動選桌機制
 * (System Test: Designated Table Auto-Selection Logic)
 *
 * 角色：System Test Engineer
 * 模組：餐廳預約訂位與客席保留 — 顧客前端
 * 目標函式：autoSelectOptimalTables(availableTables, guestCount)
 * 輔助函式：calculateReservationAvailability(...)
 *
 * 業務規則摘要：
 *   主要條件：選出滿足 (maxCapacity - guestCount >= 0) 且空位浪費最少的單一桌位。
 *   回退條件：若最佳尺寸桌位已被佔用（庫存不足），自動向上遞補下一個可用尺寸。
 *   多桌組合：當無任何單桌可容納時，以降序容量組合最少桌數直至滿足人數。
 *
 * 測試分區：
 *   TC-BASIC-*  : 基礎正常路徑
 *   TC-BOUND-*  : 邊界值分析
 *   TC-FALLBK-* : 回退路由（庫存不足 Fallback）
 *   TC-COMBO-*  : 多桌組合場景
 *   TC-EDGE-*   : 邊緣與防禦性案例
 *   TC-AVAIL-*  : calculateReservationAvailability 整合
 *   TC-MONOPOLY-* : 防獨占規則驗證
 *   TC-OPTIM-*  : 最優性驗證
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import {
  autoSelectOptimalTables,
  calculateReservationAvailability,
  validateTableMonopoly,
} from '../src/utils/reservationValidator';

// ============================================================
// 測試輔助：桌位資料工廠
// ============================================================
function makeTable(id: string, maxCapacity: number) {
  return { id, maxCapacity };
}

// ============================================================
// 標準測試場景：典型桌型配置
//   T2A, T2B：2人桌
//   T4A, T4B, T4C：4人桌
//   T6A：6人桌
//   T8A：8人桌
//   T10A：10人桌
// ============================================================
const ALL_TABLES = [
  makeTable('T2A', 2),
  makeTable('T2B', 2),
  makeTable('T4A', 4),
  makeTable('T4B', 4),
  makeTable('T4C', 4),
  makeTable('T6A', 6),
  makeTable('T8A', 8),
  makeTable('T10A', 10),
];

// ============================================================
// 分區一：基礎正常路徑 (TC-BASIC)
// ============================================================
describe('TC-BASIC：基礎正常路徑', () => {
  it('TC-BASIC-01：1位客人 → 應選最小可用桌（2人桌）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 1);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(2);
  });

  it('TC-BASIC-02：2位客人 → 應選2人桌（完美命中，零浪費）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 2);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(2);
  });

  it('TC-BASIC-03：3位客人 → 應選4人桌（最近且滿足的單桌）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 3);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(4);
  });

  it('TC-BASIC-04：4位客人 → 應選4人桌（精確吻合）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 4);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(4);
  });

  it('TC-BASIC-05：5位客人 → 應選6人桌（最近的單桌）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 5);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(6);
  });

  it('TC-BASIC-06：6位客人 → 應選6人桌（精確吻合）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 6);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(6);
  });

  it('TC-BASIC-07：8位客人 → 應選8人桌（精確吻合）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 8);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(8);
  });

  it('TC-BASIC-08：10位客人 → 應選10人桌（精確吻合）', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 10);
    expect(selected).toHaveLength(1);
    const table = ALL_TABLES.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(10);
  });
});

// ============================================================
// 分區二：邊界值分析 (TC-BOUND)
// ============================================================
describe('TC-BOUND：邊界值分析', () => {
  it('TC-BOUND-01：用餐人數恰好等於桌位上限（邊界：maxCapacity - guestCount = 0）', () => {
    const tables = [makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(tables, 4);
    expect(selected).toEqual(['T4A']);
  });

  it('TC-BOUND-02：用餐人數比桌位上限少1（maxCapacity - guestCount = 1，應選中）', () => {
    const tables = [makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(tables, 3);
    expect(selected).toEqual(['T4A']);
  });

  it('TC-BOUND-03：用餐人數比桌位上限多1（不滿足單桌，退入多桌邏輯）', () => {
    const tables = [makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(tables, 5);
    // 唯一桌不符合，但仍選出盡力覆蓋
    expect(selected).toContain('T4A');
  });

  it('TC-BOUND-04：用餐人數 = 1（最小邊界值）→ 應選出至少一張桌', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 1);
    expect(selected).toHaveLength(1);
    const cap = ALL_TABLES.find((t) => t.id === selected[0])!.maxCapacity;
    expect(cap).toBeGreaterThanOrEqual(1);
  });

  it('TC-BOUND-05：用餐人數 = 0（邊界：零人）→ 應返回空陣列', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, 0);
    expect(selected).toEqual([]);
  });

  it('TC-BOUND-06：用餐人數 = -1（負人數）→ 應返回空陣列', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, -1);
    expect(selected).toEqual([]);
  });

  it('TC-BOUND-07：用餐人數 = -999（極端負值）→ 應返回空陣列', () => {
    const selected = autoSelectOptimalTables(ALL_TABLES, -999);
    expect(selected).toEqual([]);
  });

  it('TC-BOUND-08：可用桌位清單為空陣列 → 應返回空陣列', () => {
    const selected = autoSelectOptimalTables([], 4);
    expect(selected).toEqual([]);
  });

  it('TC-BOUND-09：可用桌位為 null/undefined（防禦性）→ 應返回空陣列', () => {
    expect(autoSelectOptimalTables(null, 4)).toEqual([]);
    expect(autoSelectOptimalTables(undefined, 4)).toEqual([]);
  });

  it('TC-BOUND-10：只有一張桌位且恰好滿足（最緊湊場景）', () => {
    const tables = [makeTable('T6A', 6)];
    const selected = autoSelectOptimalTables(tables, 6);
    expect(selected).toEqual(['T6A']);
  });

  it('TC-BOUND-11：桌位 maxCapacity 未定義時，應預設為4', () => {
    const tables = [{ id: 'TX', maxCapacity: undefined as unknown as number }];
    const selected = autoSelectOptimalTables(tables, 3);
    expect(selected).toEqual(['TX']); // 預設4 >= 3，應選中
  });
});

// ============================================================
// 分區三：回退路由測試（Fallback — 庫存不足） (TC-FALLBK)
// ============================================================
describe('TC-FALLBK：回退路由（指定尺寸桌位庫存不足）', () => {
  it('TC-FALLBK-01：最佳2人桌全被預約 → 自動回退至4人桌（用餐1人）', () => {
    const availableTables = [makeTable('T4A', 4), makeTable('T4B', 4), makeTable('T6A', 6)];
    const selected = autoSelectOptimalTables(availableTables, 1);
    expect(selected).toHaveLength(1);
    const table = availableTables.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(4);
  });

  it('TC-FALLBK-02：最佳4人桌全被預約 → 自動回退至6人桌（用餐3人）', () => {
    const availableTables = [makeTable('T6A', 6), makeTable('T8A', 8)];
    const selected = autoSelectOptimalTables(availableTables, 3);
    expect(selected).toHaveLength(1);
    const table = availableTables.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(6);
  });

  it('TC-FALLBK-03：最佳4人桌與回退6人桌均已滿 → 繼續回退至8人桌（用餐4人）', () => {
    const availableTables = [makeTable('T8A', 8), makeTable('T10A', 10)];
    const selected = autoSelectOptimalTables(availableTables, 4);
    expect(selected).toHaveLength(1);
    const table = availableTables.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(8);
  });

  it('TC-FALLBK-04：回退後仍應選最緊湊的符合桌（禁止直接跳至超大桌）', () => {
    const availableTables = [
      makeTable('T10A', 10),
      makeTable('T8A', 8),
      makeTable('T4A', 4),
    ];
    const selected = autoSelectOptimalTables(availableTables, 3);
    expect(selected).toHaveLength(1);
    const table = availableTables.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(4);
  });

  it('TC-FALLBK-05：用餐5人，最佳6人桌已滿，回退至8人桌', () => {
    const availableTables = [makeTable('T8A', 8), makeTable('T10A', 10)];
    const selected = autoSelectOptimalTables(availableTables, 5);
    expect(selected).toHaveLength(1);
    const table = availableTables.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(8);
  });

  it('TC-FALLBK-06：所有可用桌容量均小於用餐人數 → 進入多桌組合模式', () => {
    const availableTables = [makeTable('T8A', 8), makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(availableTables, 9);
    expect(selected).toContain('T8A');
    expect(selected).toContain('T4A');
    const totalCap = selected.reduce((sum, id) => {
      return sum + (availableTables.find((t) => t.id === id)?.maxCapacity || 4);
    }, 0);
    expect(totalCap).toBeGreaterThanOrEqual(9);
  });

  it('TC-FALLBK-07：多種容量可選，回退後應選最緊湊（不越級至大桌）', () => {
    const availableTables = [
      makeTable('T10A', 10),
      makeTable('T8A', 8),
      makeTable('T4A', 4),
    ];
    const selected = autoSelectOptimalTables(availableTables, 2);
    expect(selected).toHaveLength(1);
    const table = availableTables.find((t) => t.id === selected[0])!;
    expect(table.maxCapacity).toBe(4);
  });
});

// ============================================================
// 分區四：多桌組合場景 (TC-COMBO)
// ============================================================
describe('TC-COMBO：多桌組合場景（無單桌可容納時）', () => {
  it('TC-COMBO-01：用餐7人，最大單桌6人 → 組合兩桌（6+4=10）', () => {
    const availableTables = [makeTable('T6A', 6), makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(availableTables, 7);
    expect(selected).toContain('T6A');
    expect(selected).toContain('T4A');
    expect(selected).toHaveLength(2);
  });

  it('TC-COMBO-02：用餐12人，最大桌10人 → 組合最少桌數達標', () => {
    const availableTables = [
      makeTable('T10A', 10),
      makeTable('T8A', 8),
      makeTable('T4A', 4),
    ];
    const selected = autoSelectOptimalTables(availableTables, 12);
    expect(selected).toContain('T10A');
    expect(selected).toContain('T8A');
    expect(selected).toHaveLength(2);
  });

  it('TC-COMBO-03：用餐8人，僅有兩張4人桌 → 選兩張4人桌', () => {
    const availableTables = [makeTable('T4A', 4), makeTable('T4B', 4)];
    const selected = autoSelectOptimalTables(availableTables, 8);
    expect(selected).toHaveLength(2);
    expect(selected).toContain('T4A');
    expect(selected).toContain('T4B');
  });

  it('TC-COMBO-04：降序後第一桌即已達標 → 不應繼續加選額外桌', () => {
    const availableTables = [makeTable('T8A', 8), makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(availableTables, 6);
    expect(selected).toHaveLength(1);
    expect(selected).toContain('T8A');
  });

  it('TC-COMBO-05：多桌組合應以降序確保最少桌數', () => {
    const availableTables = [
      makeTable('T4A', 4),
      makeTable('T2A', 2),
      makeTable('T10A', 10),
      makeTable('T6A', 6),
    ];
    const selected = autoSelectOptimalTables(availableTables, 14);
    expect(selected).toContain('T10A');
    expect(selected).toContain('T6A');
    expect(selected).toHaveLength(2);
  });

  it('TC-COMBO-06：用餐人數超過所有桌位總容量 → 應選出所有可用桌（盡力覆蓋）', () => {
    const availableTables = [makeTable('T4A', 4), makeTable('T4B', 4)];
    const selected = autoSelectOptimalTables(availableTables, 20);
    expect(selected).toHaveLength(2);
    expect(selected).toContain('T4A');
    expect(selected).toContain('T4B');
  });
});

// ============================================================
// 分區五：邊緣與防禦性案例 (TC-EDGE)
// ============================================================
describe('TC-EDGE：邊緣與防禦性案例', () => {
  it('TC-EDGE-01：只有一張桌位且容量不足 → 仍選出該唯一桌（盡力而為）', () => {
    const tables = [makeTable('T2A', 2)];
    const selected = autoSelectOptimalTables(tables, 5);
    expect(selected).toContain('T2A');
  });

  it('TC-EDGE-02：桌位清單中有重複容量 → 選最早遇到的最緊湊桌（穩定排序）', () => {
    const tables = [makeTable('T4A', 4), makeTable('T4B', 4), makeTable('T4C', 4)];
    const selected = autoSelectOptimalTables(tables, 4);
    expect(selected).toHaveLength(1);
    expect(selected[0]).toBe('T4A');
  });

  it('TC-EDGE-03：桌位尺寸跳級時，應向上取整至最近可用尺寸', () => {
    // 僅有2人桌和6人桌，用餐3人
    const tables = [makeTable('T2A', 2), makeTable('T6A', 6)];
    const selected = autoSelectOptimalTables(tables, 3);
    expect(selected).toHaveLength(1);
    expect(selected[0]).toBe('T6A');
  });

  it('TC-EDGE-04：所有桌位 maxCapacity 均為1 → 組合4桌滿足4人需求', () => {
    const tables = [
      makeTable('T1A', 1),
      makeTable('T1B', 1),
      makeTable('T1C', 1),
      makeTable('T1D', 1),
      makeTable('T1E', 1),
    ];
    const selected = autoSelectOptimalTables(tables, 4);
    const totalCap = selected.length * 1;
    expect(totalCap).toBeGreaterThanOrEqual(4);
    expect(selected).toHaveLength(4);
  });

  it('TC-EDGE-05：用餐人數恰好等於所有桌位總容量 → 應選所有桌', () => {
    const tables = [makeTable('T4A', 4), makeTable('T4B', 4)];
    const selected = autoSelectOptimalTables(tables, 8);
    expect(selected).toHaveLength(2);
  });
});

// ============================================================
// 分區六：calculateReservationAvailability 整合 (TC-AVAIL)
// ============================================================
describe('TC-AVAIL：預約可用性計算整合（autoSelect 的上游資料）', () => {
  const BASE_TABLES = [
    makeTable('T2A', 2),
    makeTable('T4A', 4),
    makeTable('T4B', 4),
    makeTable('T6A', 6),
    makeTable('T8A', 8),
  ];

  it('TC-AVAIL-01：無任何預約時，所有桌均應為可用', () => {
    const avail = calculateReservationAvailability('2026-12-01', '18:00', BASE_TABLES, []);
    expect(avail.availableTables).toHaveLength(5);
    expect(avail.availableWindowCapacity).toBe(24);
    expect(avail.isFullyBooked).toBe(false);
  });

  it('TC-AVAIL-02：T4A 已被預約 → autoSelect 應自動回退至 T4B', () => {
    const reservations = [
      { id: 'R1', date: '2026-12-01', time: '18:00', tableNumber: 'T4A', guestCount: 4, status: 'confirmed' },
    ];
    const avail = calculateReservationAvailability('2026-12-01', '18:00', BASE_TABLES, reservations);
    expect(avail.availableTables.map((t: any) => t.id)).not.toContain('T4A');
    const selected = autoSelectOptimalTables(avail.availableTables, 4);
    expect(selected).toEqual(['T4B']);
  });

  it('TC-AVAIL-03：所有4人桌均已被預約 → 自動回退至6人桌（用餐4人）', () => {
    const reservations = [
      { id: 'R1', date: '2026-12-01', time: '18:00', tableNumber: 'T4A', guestCount: 4, status: 'confirmed' },
      { id: 'R2', date: '2026-12-01', time: '18:30', tableNumber: 'T4B', guestCount: 4, status: 'confirmed' },
    ];
    const avail = calculateReservationAvailability('2026-12-01', '18:00', BASE_TABLES, reservations);
    const availIds = avail.availableTables.map((t: any) => t.id);
    expect(availIds).not.toContain('T4A');
    expect(availIds).not.toContain('T4B');
    const selected = autoSelectOptimalTables(avail.availableTables, 4);
    const selectedTable = avail.availableTables.find((t: any) => t.id === selected[0]);
    expect(selectedTable?.maxCapacity).toBe(6);
  });

  it('TC-AVAIL-04：取消與拒絕狀態的預約不應影響桌位可用性', () => {
    const reservations = [
      { id: 'R1', date: '2026-12-01', time: '18:00', tableNumber: 'T4A', guestCount: 4, status: 'cancelled' },
      { id: 'R2', date: '2026-12-01', time: '18:00', tableNumber: 'T4B', guestCount: 4, status: 'rejected' },
    ];
    const avail = calculateReservationAvailability('2026-12-01', '18:00', BASE_TABLES, reservations);
    expect(avail.availableTables).toHaveLength(5);
    const selected = autoSelectOptimalTables(avail.availableTables, 4);
    expect(selected).toHaveLength(1);
    const cap = avail.availableTables.find((t: any) => t.id === selected[0])?.maxCapacity;
    expect(cap).toBe(4);
  });

  it('TC-AVAIL-05：3小時窗口邊界 — 179分鐘差距應視為重疊（桌被佔用）', () => {
    const reservations = [
      { id: 'R1', date: '2026-12-01', time: '12:00', tableNumber: 'T6A', guestCount: 6, status: 'confirmed' },
    ];
    const avail = calculateReservationAvailability('2026-12-01', '14:59', BASE_TABLES, reservations);
    expect(avail.availableTables.map((t: any) => t.id)).not.toContain('T6A');
  });

  it('TC-AVAIL-06：3小時窗口邊界 — 恰好180分鐘差距不視為重疊（桌可用）', () => {
    const reservations = [
      { id: 'R1', date: '2026-12-01', time: '12:00', tableNumber: 'T6A', guestCount: 6, status: 'confirmed' },
    ];
    const avail = calculateReservationAvailability('2026-12-01', '15:00', BASE_TABLES, reservations);
    expect(avail.availableTables.map((t: any) => t.id)).toContain('T6A');
  });

  it('TC-AVAIL-07：全滿預約狀態應設置 isFullyBooked = true，autoSelect 返回空陣列', () => {
    const reservations = [
      { id: 'R1', date: '2026-12-01', time: '18:00', tableNumber: 'T2A', guestCount: 2, status: 'confirmed' },
      { id: 'R2', date: '2026-12-01', time: '18:00', tableNumber: 'T4A', guestCount: 4, status: 'confirmed' },
      { id: 'R3', date: '2026-12-01', time: '18:00', tableNumber: 'T4B', guestCount: 4, status: 'confirmed' },
      { id: 'R4', date: '2026-12-01', time: '18:00', tableNumber: 'T6A', guestCount: 6, status: 'confirmed' },
      { id: 'R5', date: '2026-12-01', time: '18:00', tableNumber: 'T8A', guestCount: 8, status: 'confirmed' },
    ];
    const avail = calculateReservationAvailability('2026-12-01', '18:00', BASE_TABLES, reservations);
    expect(avail.isFullyBooked).toBe(true);
    expect(avail.availableTables).toHaveLength(0);
    const selected = autoSelectOptimalTables(avail.availableTables, 4);
    expect(selected).toEqual([]);
  });
});

// ============================================================
// 分區七：防獨占規則驗證 (TC-MONOPOLY)
// ============================================================
describe('TC-MONOPOLY：防獨占規則 (validateTableMonopoly)', () => {
  it('TC-MONOPOLY-01：單桌選擇永遠通過驗證', () => {
    const result = validateTableMonopoly([makeTable('T4A', 4)], 1);
    expect(result.valid).toBe(true);
  });

  it('TC-MONOPOLY-02：選兩桌但去除其中一桌仍可滿足人數 → 判定為獨占（無效）', () => {
    const result = validateTableMonopoly([makeTable('T4A', 4), makeTable('T4B', 4)], 2);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('過度佔用桌席');
  });

  it('TC-MONOPOLY-03：選兩桌且去除其中一桌不足以容納 → 判定有效（必要選擇）', () => {
    const result = validateTableMonopoly([makeTable('T4A', 4), makeTable('T4B', 4)], 5);
    expect(result.valid).toBe(true);
  });

  it('TC-MONOPOLY-04：邊界值 — 恰好去除最小桌後仍夠容納 → 判定為獨占', () => {
    const result = validateTableMonopoly([makeTable('T4A', 4), makeTable('T4B', 4)], 4);
    expect(result.valid).toBe(false);
  });

  it('TC-MONOPOLY-05：空選擇或單桌選擇 → 永遠有效', () => {
    expect(validateTableMonopoly([], 4).valid).toBe(true);
    expect(validateTableMonopoly([makeTable('T6A', 6)], 6).valid).toBe(true);
  });

  it('TC-MONOPOLY-06：三桌選擇，去除任一桌後容量仍足夠 → 判定為獨占', () => {
    const result = validateTableMonopoly(
      [makeTable('T4A', 4), makeTable('T4B', 4), makeTable('T4C', 4)],
      4
    );
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// 分區八：最優性驗證 (TC-OPTIM)
// ============================================================
describe('TC-OPTIM：最優性驗證（最小浪費空位原則）', () => {
  it('TC-OPTIM-01：多桌可選時，應選容量最接近人數的桌（避免浪費）', () => {
    const tables = [makeTable('T10A', 10), makeTable('T8A', 8), makeTable('T6A', 6), makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(tables, 3);
    expect(selected).toHaveLength(1);
    expect(selected[0]).toBe('T4A');
  });

  it('TC-OPTIM-02：相同容量的桌中，選第一個遇到的（FIFO 穩定性）', () => {
    const tables = [makeTable('T4A', 4), makeTable('T4B', 4)];
    const selected = autoSelectOptimalTables(tables, 4);
    expect(selected).toHaveLength(1);
    expect(selected[0]).toBe('T4A');
  });

  it('TC-OPTIM-03：exactFit路徑不會選比需要更大的桌', () => {
    const tables = [makeTable('T10A', 10), makeTable('T6A', 6)];
    const selected = autoSelectOptimalTables(tables, 6);
    expect(selected).toHaveLength(1);
    expect(selected[0]).toBe('T6A');
  });

  it('TC-OPTIM-04：多桌組合路徑應按容量降序確保最少桌數', () => {
    const tables = [makeTable('T2A', 2), makeTable('T4A', 4), makeTable('T8A', 8)];
    const selected = autoSelectOptimalTables(tables, 9);
    expect(selected).toContain('T8A');
    const totalCap = selected.reduce((s, id) => s + (tables.find((t) => t.id === id)?.maxCapacity || 4), 0);
    expect(totalCap).toBeGreaterThanOrEqual(9);
    expect(selected.length).toBeLessThanOrEqual(2);
  });
});

// ============================================================
// 分區九：maxCapacity = 0 防禦過濾驗證 (FIX-CAP0)
// 驗證修正後的前置過濾：maxCapacity === 0 的桌位不應參與選桌演算。
// ============================================================
describe('FIX-CAP0：maxCapacity = 0 桌位防禦過濾驗證', () => {
  it('FIX-CAP0-01：含0容量桌位時，autoSelect 應忽略該桌並選擇下一可用桌', () => {
    const tables = [makeTable('T0', 0), makeTable('T4A', 4)];
    const selected = autoSelectOptimalTables(tables, 3);
    expect(selected).not.toContain('T0');
    expect(selected).toContain('T4A');
    expect(selected).toHaveLength(1);
  });

  it('FIX-CAP0-02：唯一桌 maxCapacity = 0 → autoSelect 應返回空陣列（無可用桌）', () => {
    const tables = [makeTable('T0', 0)];
    const selected = autoSelectOptimalTables(tables, 1);
    expect(selected).toEqual([]);
  });

  it('FIX-CAP0-03：calculateReservationAvailability 中，0容量桌不應計入 totalStoreCapacity', () => {
    const tables = [makeTable('T0', 0), makeTable('T4A', 4), makeTable('T6A', 6)];
    const avail = calculateReservationAvailability('2026-12-01', '18:00', tables, []);
    // totalStoreCapacity 應為 4 + 6 = 10，而非 0 + 4 + 6 = 10 (0||4=4 的錯誤結果會是 14)
    expect(avail.totalStoreCapacity).toBe(10);
    // 0 容量桌不應出現在 availableTables 中
    expect(avail.availableTables.map((t: any) => t.id)).not.toContain('T0');
  });

  it('FIX-CAP0-04：validateTableMonopoly 應排除 0 容量桌後再計算（迴歸：不應將 0 容量桌計為佔用）', () => {
    // T0 容量=0，T4A 容量=4；用餐 3 人
    // 若 T0 被計入（補為4），totalCap=8，去除T0=4>=3 → 誤判獨占
    // 修正後 T0 被排除，validTables=[T4A]，長度<=1 → 直接返回 valid
    const result = validateTableMonopoly([makeTable('T0', 0), makeTable('T4A', 4)], 3);
    expect(result.valid).toBe(true);
  });

  it('FIX-CAP0-REGRESSION：maxCapacity = undefined 仍應走預設4路徑（迴歸保護 TC-BOUND-11）', () => {
    const tables = [{ id: 'TX', maxCapacity: undefined as unknown as number }];
    const selected = autoSelectOptimalTables(tables, 3);
    // undefined !== 0，不被過濾；(undefined || 4) = 4 >= 3，應被選中
    expect(selected).toEqual(['TX']);
  });
});

