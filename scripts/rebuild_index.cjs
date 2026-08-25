const { execSync } = require('child_process');
const fs = require('fs');

// 從 git 取得原始 preamble（行 1-106，到 createRateLimiter 結束，不含舊的包裝器）
const originalLines = execSync('git show HEAD:functions/src/index.ts').toString().split('\n');
const preamble = originalLines.slice(0, 106).join('\n');

const newIndexContent = preamble + `

// =================================================================
// 🛡️ 標準化安全錯誤處理函式 (隱藏內部堆疊，防止資訊洩漏)
// =================================================================
export const sendErrorResponse = (res: express.Response, error: any, contextMsg: string = '伺服器內部錯誤') => {
  const errorId = \`err_\${Date.now().toString(36)}_\${Math.random().toString(36).substring(2, 6)}\`;
  console.error(\`[API Error] [\${errorId}] \${contextMsg}:\`, error);
  return res.status(500).json({
    error: \`\${contextMsg}，請稍後再試或聯繫管理員\`,
    errorId
  });
};

// ============================================================
// 路由模組 imports (Phase 3 拆分)
// ============================================================
import { registerMenuRoutes } from './routes/menu';
import { registerBootstrapRoutes } from './routes/bootstrap';
import { registerInventoryRoutes } from './routes/inventory';
import { registerTablesRoutes } from './routes/tables';
import { registerOrdersRoutes } from './routes/orders';
import { registerSettingsRoutes } from './routes/settings';
import { registerPrinterRoutes } from './routes/printer';
import { registerStaffRoutes } from './routes/staff';

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
// 路由模組掛載（依優先順序排列）
// ============================================================
registerBootstrapRoutes(app, routeCtx);
registerMenuRoutes(app, routeCtx);
registerOrdersRoutes(app, routeCtx);
registerInventoryRoutes(app, routeCtx);
registerTablesRoutes(app, routeCtx);
registerSettingsRoutes(app, routeCtx);
registerPrinterRoutes(app, routeCtx);
registerStaffRoutes(app, routeCtx);

// Catch-all 404 JSON Handler to prevent returning HTML on missing API endpoints
app.use((req: any, res: any) => {
  res.status(404).json({ error: \`無效的 API 請求: \${req.method} \${req.path}\` });
});

export const api = onRequest({ cors: true, invoker: 'public' }, app);
`;

fs.writeFileSync('functions/src/index.ts', newIndexContent, 'utf8');
const stat = fs.statSync('functions/src/index.ts');
const lineCount = newIndexContent.split('\n').length;
console.log(`✅ index.ts 重建完成: ${Math.round(stat.size / 1024)} KB, ${lineCount} 行`);
console.log('  包含 preamble（行 1-137）+ sendErrorResponse + 8 個路由模組掛載');
