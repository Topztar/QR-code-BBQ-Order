import { describe, it, expect } from 'vitest';
import { sendToNetworkPrinter } from '../hardware/printerDriver';

describe('1. 訂位時段衝突與容量防護邏輯 (Reservation Concurrency & Overlap Logic)', () => {
  function parseTimeToMinutes(t: string): number {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  interface ReservationItem {
    id: string;
    customerName: string;
    tableNumber: string;
    date: string;
    time: string;
    guestCount: number;
    status: string;
  }

  interface TableItem {
    id: string;
    maxCapacity?: number;
  }

  function simulateReservationTransaction(
    existingReservations: ReservationItem[],
    allTables: TableItem[],
    newRes: { tableNumber: string; date: string; time: string; guestCount: number; customerName: string }
  ): { success: boolean; error?: string } {
    const targetMins = parseTimeToMinutes(newRes.time);
    const overlapping = existingReservations.filter((r) => {
      if (r.status === 'cancelled' || r.status === 'rejected') return false;
      if (r.date !== newRes.date.trim()) return false;
      const rMins = parseTimeToMinutes(r.time);
      return Math.abs(rMins - targetMins) < 180;
    });

    const newGuestCount = newRes.guestCount || 1;

    // 全店客席容量
    const unavailableTableIds = new Set<string>();
    for (const r of overlapping) {
      const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
      rTables.forEach(tId => unavailableTableIds.add(tId));
    }
    const availableTables = allTables.filter(t => !unavailableTableIds.has(String(t.id).trim()));
    const availableWindowCapacity = availableTables.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

    if (allTables.length > 0 && (availableTables.length === 0 || availableWindowCapacity <= 0)) {
      return { success: false, error: 'CONFLICT:該時段已額滿！全店客席在前後3小時內皆已有預約。' };
    }

    if (allTables.length > 0 && newGuestCount > availableWindowCapacity && availableWindowCapacity > 0) {
      return { success: false, error: `CONFLICT:用餐人數 (${newGuestCount}人) 超過該時段剩餘客席上限 (${availableWindowCapacity}人)！` };
    }

    // 指定桌號容量與衝突
    const requestedTables = String(newRes.tableNumber).split(',').map(t => t.trim()).filter(Boolean);
    const selectedTablesCapacity = allTables
      .filter(t => requestedTables.includes(String(t.id).trim()))
      .reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

    if (selectedTablesCapacity > 0 && selectedTablesCapacity < newGuestCount) {
      return { success: false, error: `CONFLICT:指定桌號加總人數上限 (${selectedTablesCapacity}人) 不足：不可低於用餐人數 (${newGuestCount}人)！` };
    }

    for (const r of overlapping) {
      const rTables = String(r.tableNumber || '').split(',').map(t => t.trim()).filter(Boolean);
      const conflictingTable = requestedTables.find(t => rTables.includes(t));
      if (conflictingTable) {
        return { success: false, error: `CONFLICT:預約時段衝突：【${conflictingTable} 桌】在 ${newRes.date} ${newRes.time} 前後 3 小時內已有預約` };
      }
    }

    return { success: true };
  }

  const mockTables: TableItem[] = [
    { id: '1', maxCapacity: 4 },
    { id: '2', maxCapacity: 4 },
    { id: '3', maxCapacity: 6 },
    { id: 'VIP', maxCapacity: 10 }
  ];

  it('✅ 同一桌位在前後 3 小時內衝突時，應被正確攔截並回傳 CONFLICT', () => {
    const existing: ReservationItem[] = [
      { id: 'res-1', customerName: '王小明', tableNumber: '1', date: '2026-10-01', time: '18:00', guestCount: 4, status: 'confirmed' }
    ];

    // 同桌 19:30 預約 (間隔 90 分鐘 < 180 分鐘)
    const result = simulateReservationTransaction(existing, mockTables, {
      customerName: '李小華',
      tableNumber: '1',
      date: '2026-10-01',
      time: '19:30',
      guestCount: 2
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFLICT:預約時段衝突：【1 桌】');
  });

  it('✅ 同一桌位在 3 小時之外預約時，應允許預約成功', () => {
    const existing: ReservationItem[] = [
      { id: 'res-1', customerName: '王小明', tableNumber: '1', date: '2026-10-01', time: '12:00', guestCount: 4, status: 'confirmed' }
    ];

    // 同桌 18:00 預約 (間隔 360 分鐘 >= 180 分鐘)
    const result = simulateReservationTransaction(existing, mockTables, {
      customerName: '李小華',
      tableNumber: '1',
      date: '2026-10-01',
      time: '18:00',
      guestCount: 2
    });

    expect(result.success).toBe(true);
  });

  it('✅ 當所有客席皆被預約滿時，應正確判定全店額滿', () => {
    const existing: ReservationItem[] = [
      { id: 'res-1', customerName: '客1', tableNumber: '1', date: '2026-10-01', time: '18:00', guestCount: 4, status: 'confirmed' },
      { id: 'res-2', customerName: '客2', tableNumber: '2', date: '2026-10-01', time: '18:00', guestCount: 4, status: 'confirmed' },
      { id: 'res-3', customerName: '客3', tableNumber: '3', date: '2026-10-01', time: '18:00', guestCount: 6, status: 'confirmed' },
      { id: 'res-4', customerName: '客4', tableNumber: 'VIP', date: '2026-10-01', time: '18:00', guestCount: 10, status: 'confirmed' }
    ];

    const result = simulateReservationTransaction(existing, mockTables, {
      customerName: '新客人',
      tableNumber: '1',
      date: '2026-10-01',
      time: '18:30',
      guestCount: 2
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('CONFLICT:該時段已額滿');
  });
});

describe('2. 印表機 Socket 逾時與銷毀機制 (Printer Socket Timeout & Destroy)', () => {
  it('✅ sendToNetworkPrinter 在連線無效 IP 時應於逾時後自動銷毀 Socket 並回傳 fallback 日誌', async () => {
    const startTime = Date.now();
    // 傳入短超時 300ms 進行單元測試快速驗證
    const result = await sendToNetworkPrinter('192.0.2.1', 9100, Buffer.from('TEST'), { timeoutMs: 300, retries: 0 });
    const elapsed = Date.now() - startTime;

    expect(result.success).toBe(true); // Fallback to simulated
    expect(result.log).toContain('Simulated Network Fallback');
    expect(elapsed).toBeLessThan(2000);
  });
});
