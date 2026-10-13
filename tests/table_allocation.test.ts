import { describe, it, expect } from 'vitest';
import {
  findOptimalTableCombination,
  validateReservationCapacityAndHoarding,
  Table,
} from '../src/lib/tableAllocation';
import { autoSelectOptimalTables } from '../src/utils/reservationValidator';

describe('Table Allocation - Bounded Knapsack & Exact Fit Algorithm', () => {
  // Sabay BBQ 8 tables layout:
  // Tables 1, 2, 3: 3 pax each
  // Tables 4, 5, 6, 7: 4 pax each
  // Table 8: 2 pax
  const sabayTables: Table[] = [
    { id: '1', name: 'Table 1', capacity: 3, maxCapacity: 3 },
    { id: '2', name: 'Table 2', capacity: 3, maxCapacity: 3 },
    { id: '3', name: 'Table 3', capacity: 3, maxCapacity: 3 },
    { id: '4', name: 'Table 4', capacity: 4, maxCapacity: 4 },
    { id: '5', name: 'Table 5', capacity: 4, maxCapacity: 4 },
    { id: '6', name: 'Table 6', capacity: 4, maxCapacity: 4 },
    { id: '7', name: 'Table 7', capacity: 4, maxCapacity: 4 },
    { id: '8', name: 'Table 8', capacity: 2, maxCapacity: 2 },
  ];

  it('Verify 2 guests -> auto-select Table 8 (2 pax, exact fit)', () => {
    const selected = autoSelectOptimalTables(sabayTables, 2);
    expect(selected).toEqual(['8']);
    const combo = findOptimalTableCombination(sabayTables, 2);
    expect(combo).toHaveLength(1);
    expect(combo[0].id).toBe('8');
    expect(combo[0].capacity).toBe(2);
  });

  it('Verify 3 guests -> auto-select Table 1/2/3 (3 pax, exact fit)', () => {
    const selected = autoSelectOptimalTables(sabayTables, 3);
    expect(selected).toHaveLength(1);
    expect(['1', '2', '3']).toContain(selected[0]);
    const combo = findOptimalTableCombination(sabayTables, 3);
    expect(combo[0].capacity).toBe(3);
  });

  it('Verify 4 guests -> auto-select Table 4/5/6/7 (4 pax, exact fit)', () => {
    const selected = autoSelectOptimalTables(sabayTables, 4);
    expect(selected).toHaveLength(1);
    expect(['4', '5', '6', '7']).toContain(selected[0]);
    const combo = findOptimalTableCombination(sabayTables, 4);
    expect(combo[0].capacity).toBe(4);
  });

  it('Verify 5 guests -> auto-select 3-pax table + Table 8 (2 pax), totaling 5 seats (0 overflow)', () => {
    const selected = autoSelectOptimalTables(sabayTables, 5);
    // 5 guests should be 3-pax table (1, 2, or 3) + Table 8 (2 pax) = 5 seats (0 overflow)
    expect(selected).toHaveLength(2);
    expect(selected).toContain('8');
    const hasThreePaxTable = selected.some((id) => ['1', '2', '3'].includes(id));
    expect(hasThreePaxTable).toBe(true);

    const combo = findOptimalTableCombination(sabayTables, 5);
    const totalCapacity = combo.reduce((sum, t) => sum + (t.capacity || t.maxCapacity || 0), 0);
    expect(totalCapacity).toBe(5); // Exact fit, 0 overflow
  });

  it('Verify 6 guests -> auto-select 4-pax table + Table 8 (2 pax) or two 3-pax tables, totaling 6 seats (0 overflow)', () => {
    const selected = autoSelectOptimalTables(sabayTables, 6);
    expect(selected).toHaveLength(2);

    const combo = findOptimalTableCombination(sabayTables, 6);
    const totalCapacity = combo.reduce((sum, t) => sum + (t.capacity || t.maxCapacity || 0), 0);
    expect(totalCapacity).toBe(6); // Exact fit, 0 overflow

    // Verify combination is either [4-pax + 2-pax] or [3-pax + 3-pax]
    const ids = combo.map((t) => t.id);
    const isTwoThreePax = ids.filter((id) => ['1', '2', '3'].includes(id)).length === 2;
    const isFourAndTwo = ids.includes('8') && ids.some((id) => ['4', '5', '6', '7'].includes(id));
    expect(isTwoThreePax || isFourAndTwo).toBe(true);
  });

  it('Verify partial availability for 5 guests falls back to best exact fit', () => {
    // If Table 8 (2 pax) is occupied, available are Tables 1, 2, 4, 6
    const available = sabayTables.filter((t) => t.id !== '8');
    const selected = autoSelectOptimalTables(available, 5);
    expect(selected).toHaveLength(2); // e.g. 3-pax + 3-pax = 6 (overflow 1) or 4-pax + 3-pax = 7
    const combo = findOptimalTableCombination(available, 5);
    const totalCap = combo.reduce((sum, t) => sum + (t.capacity || t.maxCapacity || 0), 0);
    expect(totalCap).toBe(6); // minimum overflow = 1
  });

  it('Verify anti-hoarding validation blocks excessive multi-table hoarding', () => {
    // 2 guests attempting to hoard Table 6 (4) + Table 7 (4) = 8 seats (overflow 6 > 3)
    const requested = [
      { id: '6', capacity: 4, maxCapacity: 4 },
      { id: '7', capacity: 4, maxCapacity: 4 },
    ];
    const validation = validateReservationCapacityAndHoarding(requested, 2, sabayTables);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('過度佔用桌席容量');
  });
});
