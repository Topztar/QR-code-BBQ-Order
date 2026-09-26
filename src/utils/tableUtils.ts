/**
 * Table Utility Functions
 * Single source of truth for table mapping and validation across frontend & backend.
 */

export function isTakeoutTable(tableId: string | null | undefined): boolean {
  if (!tableId) return false;
  const cleanId = String(tableId).trim().toLowerCase();
  return cleanId === 'takeout' || cleanId.includes('外帶');
}

export function getMappedTableId(inputTableId: string, availableTables: Array<{ id: string }>): string {
  if (!availableTables || availableTables.length === 0) {
    return inputTableId;
  }
  const cleanInput = String(inputTableId || '').trim();
  if (availableTables.some((t) => t.id.toString().trim() === cleanInput)) {
    return cleanInput;
  }
  if (isTakeoutTable(cleanInput)) {
    return cleanInput;
  }

  // Extract digits
  const matchDigits = cleanInput.match(/\d+/);
  if (matchDigits) {
    const tableNum = parseInt(matchDigits[0], 10);
    const numericTables = availableTables
      .map((t) => ({ id: t.id, num: parseInt(String(t.id).match(/\d+/)?.[0] || '', 10) }))
      .filter((t) => !isNaN(t.num));

    if (numericTables.length > 0) {
      let closestTable = numericTables[0];
      let minDiff = Math.abs(numericTables[0].num - tableNum);
      for (const nt of numericTables) {
        const diff = Math.abs(nt.num - tableNum);
        if (diff < minDiff) {
          minDiff = diff;
          closestTable = nt;
        }
      }
      return closestTable.id;
    }
  }

  // If no match found, preserve exact cleaned input without randomly guessing or hashing tables
  return cleanInput;
}
