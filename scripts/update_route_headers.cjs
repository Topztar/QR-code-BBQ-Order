const fs = require('fs');
const path = require('path');

// 各路由模組的 helpers import 設定
const moduleHelpers = {
  'settings': `import { cachedServicePause, setCachedServicePause, CACHE_TTL_MS, createGetCachedSettings, isStoreOpenFromData, createHandleSavePrinterIp, createHandleSavePrinterSettings } from '../helpers';`,
  'bootstrap': `import { cachedMenu, cachedCategories, cachedSettings, setCachedMenu, setCachedCategories, setCachedSettings, CACHE_TTL_MS, processMenuItemSoldOut, isStoreOpenFromData } from '../helpers';`,
  'menu': `import { cachedMenu, cachedCategories, setCachedMenu, setCachedCategories, CACHE_TTL_MS, processMenuItemSoldOut } from '../helpers';`,
  'orders': `import { isStoreOpenFromData, createGetCachedSettings } from '../helpers';`,
  'inventory': `import { cachedMenu, setCachedMenu, CACHE_TTL_MS } from '../helpers';`,
  'tables': `import { createGetCachedSettings } from '../helpers';`,
  'printer': `import { createGetCachedSettings, sendToNetworkPrinter, createHandleSavePrinterIp, createHandleSavePrinterSettings } from '../helpers';`,
  'staff': `import { createGetCachedSettings } from '../helpers';`,
};

// 修改每個路由模組的 header
const routesDir = path.join('functions', 'src', 'routes');

Object.entries(moduleHelpers).forEach(([moduleName, helperImport]) => {
  const filePath = path.join(routesDir, `${moduleName}.ts`);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 找不到: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 在 import 區塊末尾加入 helpers import（在 validators import 後面）
  const insertAfter = `import { validateOrderPayload, validateReservationPayload, validateImageUploadPayload, sanitizeString } from '../validators';`;
  
  if (content.includes(helperImport)) {
    console.log(`⏭️  ${moduleName}.ts 已有 helper import`);
    return;
  }

  content = content.replace(insertAfter, `${insertAfter}\n${helperImport}`);
  
  // 在 registerXxxRoutes 函式內建立 getCachedSettings 本地實例（若需要）
  if (helperImport.includes('createGetCachedSettings')) {
    const funcSignature = `export function register${capitalize(moduleName)}Routes(app: express.Application, ctx: RouteContext) {`;
    const destructure = `  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;`;
    
    content = content.replace(
      `${funcSignature}\n${destructure}`,
      `${funcSignature}\n${destructure}\n  const getCachedSettings = createGetCachedSettings(db);`
    );
  }

  // 若有 createHandleSavePrinterIp，建立本地 handler 實例
  if (helperImport.includes('createHandleSavePrinterIp')) {
    const printerCtx = moduleName === 'printer' ? 
      `  const getCachedSettings = createGetCachedSettings(db);\n  const handleSavePrinterIp = createHandleSavePrinterIp(db);\n  const handleSavePrinterSettings = createHandleSavePrinterSettings(db);` :
      `  const handleSavePrinterIp = createHandleSavePrinterIp(db);\n  const handleSavePrinterSettings = createHandleSavePrinterSettings(db);`;

    const destructure = `  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;`;
    content = content.replace(
      `${destructure}\n\n  // 雙路徑路由包裝器`,
      `${destructure}\n${printerCtx}\n\n  // 雙路徑路由包裝器`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${moduleName}.ts 已更新 helpers import`);
});

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
