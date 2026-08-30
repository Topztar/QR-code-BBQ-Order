import { describe, it, expect } from 'vitest';
import { generateReservationNo } from '../src/components/manager/ManagerDashboardUtils';
import { TableConfig, Reservation } from '../src/types';

describe('Table Layout & Coordinate Calculations', () => {
  it('should snap coordinates to grid correctly', () => {
    const snap = (val: number, gridSize: number) => {
      const snapped = Math.round(val / gridSize) * gridSize;
      return Math.max(0, Math.min(100, snapped));
    };

    expect(snap(12, 5)).toBe(10);
    expect(snap(14, 5)).toBe(15);
    expect(snap(98, 5)).toBe(100);
    expect(snap(104, 5)).toBe(100);
    expect(snap(-5, 5)).toBe(0);
  });

  it('should clip fine-tuned coordinates strictly within 0% to 100%', () => {
    const move = (current: number, step: number) => Math.max(0, Math.min(100, current + step));

    expect(move(95, 10)).toBe(100);
    expect(move(5, -10)).toBe(0);
    expect(move(50, 5)).toBe(55);
  });
});

describe('Reservation System & Capacity Window Math', () => {
  const mockTables: TableConfig[] = [
    { id: '1', maxCapacity: 4, qrCodeUrl: '', status: 'available' },
    { id: '2', maxCapacity: 6, qrCodeUrl: '', status: 'available' },
    { id: '3', maxCapacity: 2, qrCodeUrl: '', status: 'available' },
  ];

  const mockReservations: Reservation[] = [
    {
      id: 'res-1',
      customerName: '張先生',
      phone: '0912345678',
      date: '2026-08-25',
      time: '18:00',
      guestCount: 4,
      tableNumber: '1',
      status: 'confirmed',
      createdAt: '2026-08-24T10:00:00Z',
    },
  ];

  it('should generate formatted reservation serial number', () => {
    const resNo = generateReservationNo('2026-08-25', mockReservations);
    expect(resNo).toBe('RES-20260825-002');
  });

  it('should calculate 3-hour overlapping window booked capacity correctly', () => {
    const parseMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const targetTime = '19:00';
    const targetMins = parseMins(targetTime);

    const overlapping = mockReservations.filter((r) => {
      if (r.date !== '2026-08-25') return false;
      const rMins = parseMins(r.time);
      return Math.abs(rMins - targetMins) < 180;
    });

    const bookedGuests = overlapping.reduce((sum, r) => sum + r.guestCount, 0);
    expect(bookedGuests).toBe(4);

    const unavailableTableIds = new Set(overlapping.map((r) => r.tableNumber));
    const availableTables = mockTables.filter((t) => !unavailableTableIds.has(t.id));
    const availableCapacity = availableTables.reduce((sum, t) => sum + (t.maxCapacity || 4), 0);

    expect(availableTables.length).toBe(2);
    expect(availableCapacity).toBe(8); // table 2 (6) + table 3 (2)
  });

  it('should validate phone numbers according to Taiwan format', () => {
    const isValidPhone = (phone: string) => {
      const cleanDigits = phone.replace(/\D/g, '');
      const isMobile = /^09\d{8}$/.test(cleanDigits);
      const isLandline = /^0[2-8]\d{7,8}$/.test(cleanDigits);
      return isMobile || isLandline;
    };

    expect(isValidPhone('0912-345-678')).toBe(true);
    expect(isValidPhone('0912345678')).toBe(true);
    expect(isValidPhone('02-2345-6789')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('0123456789')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
  });
});

describe('List Pagination Mathematics', () => {
  it('should calculate page slice indices correctly', () => {
    const paginate = <T>(items: T[], page: number, pageSize: number) => {
      const totalCount = items.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const startIndex = (safePage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      return {
        data: items.slice(startIndex, endIndex),
        totalPages,
        safePage,
        startIndex,
        endIndex,
      };
    };

    const mockList = Array.from({ length: 45 }, (_, i) => `Item ${i + 1}`);

    const page1 = paginate(mockList, 1, 20);
    expect(page1.data.length).toBe(20);
    expect(page1.totalPages).toBe(3);
    expect(page1.startIndex).toBe(0);
    expect(page1.endIndex).toBe(20);

    const page3 = paginate(mockList, 3, 20);
    expect(page3.data.length).toBe(5);
    expect(page3.startIndex).toBe(40);
    expect(page3.endIndex).toBe(45);

    const pageOverflow = paginate(mockList, 99, 20);
    expect(pageOverflow.safePage).toBe(3);
    expect(pageOverflow.data.length).toBe(5);
  });
});
