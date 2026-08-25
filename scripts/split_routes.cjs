const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('functions/src/index.ts', 'utf8');
const lines = content.split('\n');

// ============================================================
// 路由分組定義
// ============================================================
const moduleGroups = {
  'menu': ['/images/upload', '/menu', '/categories'],
  'bootstrap': ['/bootstrap'],
  'inventory': ['/ingredients', '/inventory'],
  'tables': ['/tables', '/reservations'],
  'orders': ['/orders', '/print-logs'],
  'settings': ['/settings', '/promo-combo', '/option-rules', '/admin'],
  'printer': ['/printer'],
  'staff': ['/staff', '/takeout', '/push-notifications', '/send-promo-push'],
};

function getModule(routePath) {
  for (const [modName, prefixes] of Object.entries(moduleGroups)) {
    if (prefixes.some(p => routePath === p || routePath.startsWith(p + '/') || routePath.startsWith(p + ':'))) {
      return modName;
    }
  }
  return 'settings';
}

// 找出所有路由定義行
const routeLines = [];
lines.forEach((line, i) => {
  const m = line.match(/^(get|post|put|del|patch)\s*\(\s*'(\/[^']+)'/);
  if (m) routeLines.push({ method: m[1], path: m[2], lineIdx: i });
});

// 計算每個路由的代碼塊範圍
const routeBlocks = routeLines.map((r, idx) => {
  const nextRouteIdx = routeLines[idx + 1]?.lineIdx ?? (lines.findIndex(l => l.includes('Catch-all 404')) || lines.length);
  return { ...r, module: getModule(r.path), blockStart: r.lineIdx, blockEnd: nextRouteIdx - 1 };
});

// 按模組聚合代碼塊（需要包含連續或分散的代碼塊）
const moduleBlocks = {};
routeBlocks.forEach(rb => {
  if (!moduleBlocks[rb.module]) moduleBlocks[rb.module] = [];
  moduleBlocks[rb.module].push(rb);
});

// 確保 routes/ 目錄存在
const routesDir = path.join('functions', 'src', 'routes');
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

// ============================================================
// 共用模組 header（每個路由模組的 import）
// ============================================================
function generateModuleHeader(moduleName, extraImports = '') {
  return `import express from 'express';
import { Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import * as net from 'net';
import * as crypto from 'crypto';
import { hashPin, invalidateAuthCache } from '../auth';
import { validateOrderPayload, validateReservationPayload, validateImageUploadPayload, sanitizeString } from '../validators';
${extraImports}

// ============================================================
// ${moduleName.toUpperCase()} 路由模組
// 此模組由自動拆分腳本生成，請勿手動修改路由定義行順序。
// ============================================================

type RouteRegister = (path: string, ...handlers: express.RequestHandler[]) => void;

export interface RouteContext {
  db: Firestore;
  storageBucket: Bucket;
  requireStaffAuth: express.RequestHandler;
  createRateLimiter: (max: number, windowMs: number, name: string) => express.RequestHandler;
  sendErrorResponse: (res: express.Response, error: any, ctx?: string) => void;
}

export function register${capitalize(moduleName)}Routes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([\`/api\${routePath}\`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([\`/api\${routePath}\`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([\`/api\${routePath}\`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([\`/api\${routePath}\`, routePath], ...handlers);

`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================
// 提取路由代碼塊（移除首行縮排並合併）
// ============================================================
function extractRouteBlock(startIdx, endIdx) {
  return lines.slice(startIdx, endIdx + 1).join('\n');
}

// ============================================================
// 為每個模組生成路由檔案
// ============================================================
const moduleFiles = {};

Object.entries(moduleBlocks).forEach(([moduleName, rbs]) => {
  // 按照 lineIdx 排序
  rbs.sort((a, b) => a.lineIdx - b.lineIdx);
  
  // 提取所有代碼塊
  const codeBlocks = rbs.map(rb => extractRouteBlock(rb.blockStart, rb.blockEnd));
  
  const header = generateModuleHeader(moduleName);
  const routeCode = codeBlocks.join('\n');
  const footer = `\n}\n`;
  
  const fileContent = header + routeCode + footer;
  const filePath = path.join(routesDir, `${moduleName}.ts`);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  
  const stat = fs.statSync(filePath);
  console.log(`✅ routes/${moduleName}.ts: ${Math.round(stat.size / 1024)} KB, ${rbs.length} routes`);
  moduleFiles[moduleName] = filePath;
});

// ============================================================
// 生成新的 index.ts（只保留 preamble + register 呼叫 + export）
// ============================================================
const firstRouteLineIdx = routeLines[0]?.lineIdx ?? 168;
const catchAllLineIdx = lines.findIndex(l => l.includes('Catch-all 404'));
const preamble = lines.slice(0, firstRouteLineIdx).join('\n');

// 移除 preamble 中的 get/post/put/del 包裝器定義（第 142-154 行），改為不需要
// 因為各模組內部自己定義這些包裝器

// 生成 register 呼叫
const registerCalls = Object.keys(moduleBlocks).map(mod => 
  `  register${capitalize(mod)}Routes(app, routeCtx);`
).join('\n');

const moduleImports = Object.keys(moduleBlocks).map(mod => 
  `import { register${capitalize(mod)}Routes } from './routes/${mod}';`
).join('\n');

const newIndexContent = `${preamble}
// ============================================================
// 路由模組 imports (Phase 3 拆分)
// ============================================================
${moduleImports}

// ============================================================
// 統一路由 Context（傳入各模組的共用依賴）
// ============================================================
const routeCtx = {
  db,
  storageBucket,
  requireStaffAuth,
  createRateLimiter,
  sendErrorResponse,
};

// ============================================================
// 路由模組掛載
// ============================================================
${registerCalls}

// Catch-all 404 JSON Handler to prevent returning HTML on missing API endpoints
app.use((req: any, res: any) => {
  res.status(404).json({ error: \`無效的 API 請求: \${req.method} \${req.path}\` });
});

export const api = onRequest({ cors: true, invoker: 'public' }, app);
`;

fs.writeFileSync('functions/src/index.ts', newIndexContent, 'utf8');
const indexStat = fs.statSync('functions/src/index.ts');
console.log(`\n✅ index.ts 更新完成: ${Math.round(indexStat.size / 1024)} KB (原 77 KB)`);
console.log(`   行數: ${newIndexContent.split('\n').length} 行 (原 2136 行)`);
