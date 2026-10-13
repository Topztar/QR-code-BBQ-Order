export interface Table {
  id: string;
  name?: string;
  capacity?: number;
  maxCapacity?: number;
  isOccupied?: boolean;
  [key: string]: any;
}

export function getTableCapacity(t: Table): number {
  if (typeof t.capacity === 'number') return t.capacity;
  if (typeof t.maxCapacity === 'number') return t.maxCapacity;
  return 4;
}

/**
 * Pure function: Bounded knapsack / Exact fit table allocation algorithm.
 * Finds the optimal table combination subset T* from availableTables to seat guestCount.
 * 
 * Objective:
 *   min (sum(capacity(t)) - guestCount)
 * 
 * Priorities:
 *   Hard Constraint: sum(capacity(t)) >= guestCount
 *   Priority 1 (Minimum Overflow): Minimize excess seating (sum(cap) - guestCount >= 0).
 *   Priority 2 (Minimum Table Count): Prefer fewer tables |T| for identical overflow.
 *   Priority 3 (Preserve Large Tables): Prefer smaller tables (2-pax, 3-pax) to reserve whole 4-pax tables.
 */
export function findOptimalTableCombination(
  availableTables: Table[],
  guestCount: number
): Table[] {
  if (guestCount <= 0 || !availableTables || availableTables.length === 0) {
    return [];
  }

  // Guard: Filter out tables with capacity <= 0
  const validTables = availableTables.filter((t) => getTableCapacity(t) > 0);
  if (validTables.length === 0) return [];

  // Sort candidate tables by numerical ID (or string if non-numeric) to guarantee deterministic tie-breaking
  const sortedTables = [...validTables].sort((a, b) => {
    const numA = parseInt(a.id, 10);
    const numB = parseInt(b.id, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.id.localeCompare(b.id);
  });

  // 1. Single table check:
  // When a single table satisfies guestCount, pick single tables with capacity >= guestCount closest to count.
  const singleTableMatches = sortedTables
    .filter((t) => getTableCapacity(t) >= guestCount)
    .sort((a, b) => {
      const capA = getTableCapacity(a);
      const capB = getTableCapacity(b);
      if (capA !== capB) return capA - capB;
      const numA = parseInt(a.id, 10);
      const numB = parseInt(b.id, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.id.localeCompare(b.id);
    });

  if (singleTableMatches.length > 0) {
    return [singleTableMatches[0]];
  }

  // 2. Multi-table combinations (when guestCount exceeds single table max capacity, e.g. 5, 6+ guests)
  let bestCombination: Table[] = [];
  let minOverflow = Infinity;
  let minTableCount = Infinity;
  let minMaxCapacity = Infinity;

  // Generate all subsets (for restaurant layouts with <= 20 tables)
  const totalCombinations = 1 << sortedTables.length;
  for (let i = 1; i < totalCombinations; i++) {
    const currentCombo: Table[] = [];
    let totalCapacity = 0;
    let currentMaxCap = 0;

    for (let j = 0; j < sortedTables.length; j++) {
      if ((i >> j) & 1) {
        const tbl = sortedTables[j];
        const cap = getTableCapacity(tbl);
        currentCombo.push(tbl);
        totalCapacity += cap;
        if (cap > currentMaxCap) {
          currentMaxCap = cap;
        }
      }
    }

    if (totalCapacity >= guestCount) {
      const overflow = totalCapacity - guestCount;
      const tableCount = currentCombo.length;

      // Comparison order:
      // Priority 1: Lower overflow
      // Priority 2: Fewer tables for same overflow
      // Priority 3: Preserve large tables (lower max table capacity in combo)
      if (
        overflow < minOverflow ||
        (overflow === minOverflow && tableCount < minTableCount) ||
        (overflow === minOverflow && tableCount === minTableCount && currentMaxCap < minMaxCapacity)
      ) {
        minOverflow = overflow;
        minTableCount = tableCount;
        minMaxCapacity = currentMaxCap;
        bestCombination = currentCombo;
      }
    }
  }

  if (bestCombination.length === 0 && sortedTables.length > 0) {
    return sortedTables;
  }

  return bestCombination;
}

/**
 * Backend Anti-Hoarding and Capacity Validation:
 * Validates sum(cap) >= guestCount and checks whether requested tables excessively hoard seating
 * (overflow > 3 while more compact available combinations exist).
 */
export function validateReservationCapacityAndHoarding(
  requestedTableObjs: any[],
  guestCount: number,
  availableTables?: any[]
): { isValid: boolean; error?: string } {
  const validRequested = (requestedTableObjs || []).filter((t) => getTableCapacity(t) > 0);
  const selectedTablesCapacity = validRequested.reduce((sum, t) => sum + getTableCapacity(t), 0);

  if (selectedTablesCapacity > 0 && selectedTablesCapacity < guestCount) {
    return {
      isValid: false,
      error: `指定桌號加總人數上限 (${selectedTablesCapacity}人) 不足：不可低於用餐人數 (${guestCount}人)！`,
    };
  }

  const overflow = selectedTablesCapacity - guestCount;
  if (overflow > 3 && Array.isArray(availableTables) && availableTables.length > 0) {
    const optimalCombo = findOptimalTableCombination(availableTables, guestCount);
    if (optimalCombo.length > 0) {
      const optimalCapacity = optimalCombo.reduce((sum, t) => sum + getTableCapacity(t), 0);
      const optimalOverflow = optimalCapacity - guestCount;
      if (optimalOverflow < overflow) {
        return {
          isValid: false,
          error: `過度佔用桌席容量：用餐人數 (${guestCount}人) 所選桌位總容量 (${selectedTablesCapacity}人) 溢出過多，已有更緊湊的可用桌席組合，請精簡指定桌號！(Selected tables excessively occupy seating capacity)`,
        };
      }
    }
  }

  return { isValid: true };
}
