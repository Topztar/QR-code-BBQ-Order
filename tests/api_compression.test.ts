import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import compression from 'compression';
import http from 'http';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

describe('Cloud Functions API Compression & Header Preservation', () => {
  let server: http.Server;
  let baseUrl = '';

  const largePayload = {
    menu: Array.from({ length: 50 }, (_, i) => ({
      id: `dish-${i}`,
      name: {
        zh: `泰式招牌碳烤料理第 ${i} 號`,
        en: `Signature Thai Charcoal Grilled Dish No. ${i}`,
        ja: `タイ風炭火焼きシグネチャー料理 ${i}`,
        ko: `태국식 숯불구이 시그니처 요리 ${i}`,
      },
      description: {
        zh: '嚴選新鮮食材搭配泰式秘製醬料慢火炭烤，香氣四溢。',
        en: 'Fresh ingredients slow-grilled over charcoal with house Thai sauce.',
      },
      price: 280 + i,
      available: true,
    })),
    version: '1.0.1',
  };
  const weakEtag = 'W/"test-weak-etag-123456"';

  beforeAll(async () => {
    const app = express();
    app.use(compression({ threshold: 1024 }));
    app.use(express.json({ limit: '10mb' }));

    app.get('/api/bootstrap', (req, res) => {
      res.setHeader('Vary', 'Authorization');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=180, stale-while-revalidate=600');
      res.setHeader('ETag', weakEtag);

      if (req.headers['if-none-match'] === weakEtag) {
        return res.status(304).end();
      }
      return res.json(largePayload);
    });

    app.get('/api/small', (_req, res) => {
      return res.json({ ok: true });
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  function rawGet(urlPath: string, headers: Record<string, string>): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
    return new Promise((resolve, reject) => {
      const url = new URL(urlPath, baseUrl);
      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: 'GET',
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode || 0,
              headers: res.headers,
              body: Buffer.concat(chunks),
            });
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  }

  it('functions/src/index.ts registers compression({ threshold: 1024 }) middleware', () => {
    const indexPath = path.resolve(__dirname, '../functions/src/index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain("import compression from 'compression'");
    expect(content).toContain('app.use(compression({ threshold: 1024 }))');
  });

  it('compresses large JSON with gzip when Accept-Encoding: gzip and preserves Vary: Authorization, Accept-Encoding', async () => {
    const res = await rawGet('/api/bootstrap', { 'Accept-Encoding': 'gzip' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBe('gzip');
    expect(String(res.headers['vary']).toLowerCase()).toContain('authorization');
    expect(String(res.headers['vary']).toLowerCase()).toContain('accept-encoding');
    expect(res.headers['etag']).toBe(weakEtag);

    const uncompressedSize = Buffer.byteLength(JSON.stringify(largePayload));
    expect(res.body.length).toBeLessThan(uncompressedSize * 0.4);

    const decompressed = zlib.gunzipSync(res.body).toString('utf-8');
    expect(JSON.parse(decompressed)).toEqual(largePayload);
  });

  it('compresses large JSON with brotli (br) when Accept-Encoding: br, gzip', async () => {
    const res = await rawGet('/api/bootstrap', { 'Accept-Encoding': 'br, gzip' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBe('br');

    const decompressed = zlib.brotliDecompressSync(res.body).toString('utf-8');
    expect(JSON.parse(decompressed)).toEqual(largePayload);
  });

  it('returns uncompressed identity response when Accept-Encoding: identity', async () => {
    const res = await rawGet('/api/bootstrap', { 'Accept-Encoding': 'identity' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBeUndefined();
    expect(JSON.parse(res.body.toString('utf-8'))).toEqual(largePayload);
  });

  it('does not compress payloads smaller than 1024 bytes', async () => {
    const res = await rawGet('/api/small', { 'Accept-Encoding': 'gzip, br' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBeUndefined();
    expect(JSON.parse(res.body.toString('utf-8'))).toEqual({ ok: true });
  });

  it('returns 304 Not Modified with empty body when If-None-Match matches weak ETag', async () => {
    const res = await rawGet('/api/bootstrap', {
      'Accept-Encoding': 'gzip, br',
      'If-None-Match': weakEtag,
    });
    expect(res.statusCode).toBe(304);
    expect(res.body.length).toBe(0);
  });
});

