import {
  sanitizeString,
  validateOrderPayload,
  validateRatingPayload,
  validateCheckoutPayload,
  type ValidationResult,
} from '../../validators';

export {
  sanitizeString,
  validateOrderPayload,
  validateRatingPayload,
  validateCheckoutPayload,
  type ValidationResult,
};

export function extractClientSubmittedTotal(body: any): number | undefined {
  if (body && typeof body === 'object' && typeof body.total === 'number' && Number.isFinite(body.total)) {
    return body.total;
  }
  return undefined;
}

export function sanitizeOrderTableNumberInput(body: any): string {
  return sanitizeString(body?.tableNumber ?? '', 50);
}

export function sanitizeOrderQuickNotesInput(body: any): string {
  return sanitizeString(body?.quickNotes ?? '', 500);
}

export function sanitizeOrderFlagInput(body: any): { isFlagged: boolean; flagReason: string } {
  return {
    isFlagged: Boolean(body?.isFlagged),
    flagReason: sanitizeString(body?.flagReason ?? '', 300),
  };
}

export function sanitizeOrderItemsUpdateInput(body: any): {
  items: any[];
  refundLogs: any[] | undefined;
  expectedVersion: number | undefined;
} {
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.map((it: any) => {
    if (!it || typeof it !== 'object') return it;
    const out: Record<string, any> = { ...it };
    if (typeof out.name === 'string') {
      out.name = sanitizeString(out.name, 100);
    }
    if (out.customization && typeof out.customization === 'object' && !Array.isArray(out.customization)) {
      out.customization = {
        ...out.customization,
        notes: sanitizeString(out.customization.notes ?? '', 500),
      };
    }
    return out;
  });

  const refundLogs = Array.isArray(body?.refundLogs)
    ? body.refundLogs.map((log: any) => {
        if (!log || typeof log !== 'object') return log;
        return {
          ...log,
          ...(typeof log.reason === 'string' ? { reason: sanitizeString(log.reason, 300) } : {}),
          ...(typeof log.notes === 'string' ? { notes: sanitizeString(log.notes, 300) } : {}),
          ...(typeof log.itemName === 'string' ? { itemName: sanitizeString(log.itemName, 100) } : {}),
        };
      })
    : undefined;

  const expectedVersion = typeof body?.expectedVersion === 'number' ? body.expectedVersion : undefined;

  return { items, refundLogs, expectedVersion };
}

export function sanitizeKdsDeviceInput(body: any): { deviceId: string; force: boolean } {
  const rawDeviceId = typeof body?.deviceId === 'string' ? sanitizeString(body.deviceId, 120) : '';
  return {
    deviceId: rawDeviceId,
    force: Boolean(body?.force),
  };
}

export function sanitizeBatchDeleteInput(
  body: any,
  headers: Record<string, any>
): { targetDate: string; staffPin: string; idempotencyKey: string } {
  const rawPin = headers?.['x-staff-pin'] || headers?.['X-Staff-PIN'];
  return {
    targetDate: typeof body?.targetDate === 'string' ? sanitizeString(body.targetDate, 40) : '',
    staffPin: typeof rawPin === 'string' ? sanitizeString(rawPin, 32) : '',
    idempotencyKey: typeof body?.idempotencyKey === 'string' ? sanitizeString(body.idempotencyKey, 120) : '',
  };
}
