import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Declarative Indexes & TTL Configuration', () => {
  it('enforces TTL field override on _idempotency_keys.expiresAt', () => {
    const indexesPath = path.resolve(__dirname, '../firestore.indexes.json');
    const indexesConfig = JSON.parse(fs.readFileSync(indexesPath, 'utf-8'));
    
    const ttlOverride = indexesConfig.fieldOverrides?.find(
      (f: any) => f.collectionGroup === '_idempotency_keys' && f.fieldPath === 'expiresAt'
    );
    
    expect(ttlOverride).toBeDefined();
    expect(ttlOverride?.ttl).toBe(true);
  });

  it('exports autoDeleteExpiredIdempotencyKeys scheduled function in functions/src/index.ts', () => {
    const indexPath = path.resolve(__dirname, '../functions/src/index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    expect(indexContent).toContain('export const autoDeleteExpiredIdempotencyKeys = onSchedule(');
    expect(indexContent).toContain("db.collection('_idempotency_keys')");
    expect(indexContent).toContain("where('expiresAt', '<=', now)");
  });
});
