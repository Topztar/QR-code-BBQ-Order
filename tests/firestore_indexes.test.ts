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
});
