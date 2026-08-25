const { execSync } = require('child_process');
const fs = require('fs');

const originalContent = execSync('git show HEAD:functions/src/index.ts').toString();
const lines = originalContent.split('\n');

// 從路由分析腳本精確得知各路由行號（0-indexed）
// orders 模組包含：
// L588-598: get /orders
// L796-803: get /print-logs
// L819-879: post /orders  
// L879-891: put /orders/:id/status
// L891-903: put /orders/:id/table-number
// L903-915: put /orders/:id/quick-notes
// L915-927: put /orders/:id/flag
// L927-979: put /orders/:id/items
// L979-1039: put /orders/:id/checkout
// L1039-1052: put /orders/:id/complete
// L1052-1088: put /orders/:id/items/:itemId/complete
// L1088-1096: del /orders/:id (偏移)
// 使用腳本動態找出路由起止行

// 找出所有路由定義行（0-indexed）
const routeDefLines = [];
lines.forEach((line, i) => {
  const m = line.match(/^(get|post|put|del|patch)\s*\(\s*'(\/[^']+)'/);
  if (m) routeDefLines.push({ method: m[1], path: m[2], lineIdx: i });
});

// orders 模組相關路由
const ordersRoutePaths = [
  '/orders',
  '/print-logs',
  '/orders/:id/status',
  '/orders/:id/table-number',
  '/orders/:id/quick-notes',
  '/orders/:id/flag',
  '/orders/:id/items',
  '/orders/:id/checkout',
  '/orders/:id/complete',
  '/orders/:id/items/:itemId/complete',
  '/orders/:id',
  '/print-logs/clear',
  '/orders/:id/pay',
  '/orders/:id/rate',
];

// 找出每個 orders 路由的行號和其結束行
const catchAllLine = lines.findIndex(l => l.includes('Catch-all 404'));
const ordersBlocks = routeDefLines
  .filter(r => ordersRoutePaths.includes(r.path))
  .map((r, idx, arr) => {
    const nextRouteInAll = routeDefLines.find(rd => rd.lineIdx > r.lineIdx);
    const nextOrderRoute = arr[arr.indexOf(r) + 1];
    // 結束行 = 下一個路由（任意模組）前一行
    const endIdx = nextRouteInAll ? nextRouteInAll.lineIdx - 1 : catchAllLine - 1;
    return { ...r, blockStart: r.lineIdx, blockEnd: endIdx };
  });

console.log('orders 路由塊:');
ordersBlocks.forEach(b => {
  console.log(`  L${b.lineIdx+1}-${b.blockEnd+1}: ${b.method} ${b.path}`);
});

// 提取所有代碼塊（不重複）
const codeLines = [];
const usedLines = new Set();

ordersBlocks.forEach(b => {
  for (let i = b.blockStart; i <= b.blockEnd; i++) {
    if (!usedLines.has(i)) {
      codeLines.push(lines[i]);
      usedLines.add(i);
    }
  }
  codeLines.push(''); // 空行分隔
});

const routeCode = codeLines.join('\n');

const ordersContent = `import express from 'express';
import { Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import * as crypto from 'crypto';
import { hashPin, invalidateAuthCache } from '../auth';
import { validateOrderPayload, sanitizeString } from '../validators';
import { isStoreOpenFromData, createGetCachedSettings } from '../helpers';

// ============================================================
// ORDERS 路由模組（含 print-logs）
// ============================================================

type RouteRegister = (path: string, ...handlers: express.RequestHandler[]) => void;

export interface RouteContext {
  db: Firestore;
  storageBucket: Bucket;
  requireStaffAuth: express.RequestHandler;
  createRateLimiter: (max: number, windowMs: number, name: string) => express.RequestHandler;
  sendErrorResponse: (res: express.Response, error: any, ctx?: string) => void;
}

export function registerOrdersRoutes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
  const getCachedSettings = createGetCachedSettings(db);
  const orderRateLimiter = createRateLimiter(20, 60 * 1000, '訂單提交');

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([\`/api\${routePath}\`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([\`/api\${routePath}\`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([\`/api\${routePath}\`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([\`/api\${routePath}\`, routePath], ...handlers);

${routeCode}
}
`;

fs.writeFileSync('functions/src/routes/orders.ts', ordersContent, 'utf8');
const stat = fs.statSync('functions/src/routes/orders.ts');
console.log('\n✅ orders.ts 精確重建完成:', Math.round(stat.size / 1024), 'KB,', ordersContent.split('\n').length, '行');
