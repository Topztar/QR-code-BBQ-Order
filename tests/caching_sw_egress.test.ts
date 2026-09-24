import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Static Asset Caching & Service Worker Egress Configuration Audit', () => {
  it('firebase.json must configure 1-year immutable caching including avif and webp', () => {
    const firebaseJsonPath = path.resolve(__dirname, '../firebase.json');
    const content = fs.readFileSync(firebaseJsonPath, 'utf-8');
    const config = JSON.parse(content);

    const headers = config.hosting?.headers || [];
    const immutableRule = headers.find((h: any) => 
      typeof h.source === 'string' && 
      h.source.includes('webp') && 
      h.source.includes('avif')
    );

    expect(immutableRule).toBeDefined();
    const cacheHeader = immutableRule.headers.find((header: any) => header.key === 'Cache-Control');
    expect(cacheHeader).toBeDefined();
    expect(cacheHeader.value).toContain('max-age=31536000');
    expect(cacheHeader.value).toContain('immutable');
  });

  it('vite.config.ts must configure Workbox runtimeCaching with CacheFirst for webp and avif', () => {
    const viteConfigPath = path.resolve(__dirname, '../vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');

    // Verify regex matching png, jpg, jpeg, svg, gif, webp, avif
    expect(content).toMatch(/urlPattern:\s*\/\\\.\(\?:png\|jpg\|jpeg\|svg\|gif\|webp\|avif\)\$\//);

    // Verify handler is CacheFirst
    expect(content).toContain("handler: 'CacheFirst'");

    // Verify precache globPatterns include webp and avif
    expect(content).toMatch(/globPatterns:\s*\[[^\]]*webp[^\]]*avif[^\]]*\]/);
  });

  it('server.ts and functions/src/routes/menu.ts must attach 1-year immutable cacheControl to uploaded images', () => {
    const serverPath = path.resolve(__dirname, '../server.ts');
    const serverContent = fs.readFileSync(serverPath, 'utf-8');
    expect(serverContent).toContain("const webpMetadata = { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' }");
    expect(serverContent).toContain("const avifMetadata = { contentType: 'image/avif', cacheControl: 'public, max-age=31536000, immutable' }");

    const functionMenuPath = path.resolve(__dirname, '../functions/src/routes/menu.ts');
    const functionContent = fs.readFileSync(functionMenuPath, 'utf-8');
    expect(functionContent).toContain("cacheControl: 'public, max-age=31536000, immutable'");
  });
});
