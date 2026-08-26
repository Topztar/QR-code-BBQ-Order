import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { getAppCheck } from 'firebase-admin/app-check';
import express from 'express';

setGlobalOptions({ maxInstances: 10, minInstances: 0, memory: "256MiB", region: "asia-east1", concurrency: 80, invoker: 'public' });
import cors from 'cors';
import * as net from 'net';
import * as crypto from 'crypto';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Cloud Functions] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Cloud Functions] Uncaught Exception:', err);
});

admin.initializeApp();
// Force deploy v1.0.1 - Default Printer IP 192.168.123.100 & PUT /printer/config

// Connect to the specific named Firestore database
const db = getFirestore('ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07');
const storageBucket = getStorage().bucket('sabay-bbq-order.firebasestorage.app');
const app = express();

// 🔐 安全認證與驗證模組
import { hashPin, createStaffAuthMiddleware, invalidateAuthCache } from './auth';
import { validateOrderPayload, validateReservationPayload, validateImageUploadPayload, sanitizeString } from './validators';

export const requireStaffAuth = createStaffAuthMiddleware(db);

// 🌐 CORS 安全來源白名單限制
const allowedOrigins = [
  'https://sabay-bbq-order.web.app',
  'https://sabay-bbq-order.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    // 允許無 origin 的請求 (如同源請求、後端直接呼叫、行動裝置 Webview)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /\.web\.app$/.test(origin) ||
      /\.firebaseapp\.com$/.test(origin) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 🛡️ Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://*.cloudfunctions.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google.com/recaptcha/ http://127.0.0.1:8060 http://localhost:8060; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com/recaptcha/; object-src 'none'; base-uri 'self';"
  );
  next();
});

// 🚦 記憶體 IP 速率限制器 (Rate Limiter for public write endpoints)
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitBucket>();

export function createRateLimiter(maxRequests: number, windowMs: number = 60 * 1000, actionName: string = '操作') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const key = `${actionName}:${ip}`;
    const now = Date.now();

    let bucket = rateLimitStore.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, bucket);
      return next();
    }

    if (bucket.count >= maxRequests) {
      const waitSec = Math.ceil((bucket.resetAt - now) / 1000);
      return res.status(429).json({
        error: `請求頻率過高：${actionName} 頻率已達上限，請於 ${waitSec} 秒後再試 (Too Many Requests)`
      });
    }

    bucket.count++;
    return next();
  };
}


// =================================================================
// 🛡️ 標準化安全錯誤處理函式 (隱藏內部堆疊，防止資訊洩漏)
// =================================================================
export const sendErrorResponse = (res: express.Response, error: any, contextMsg: string = '伺服器內部錯誤') => {
  const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  console.error(`[API Error] [${errorId}] ${contextMsg}:`, error);
  return res.status(500).json({
    error: `${contextMsg}，請稍後再試或聯繫管理員`,
    errorId
  });
};

// =================================================================
// 🤖 App Check 驗證 Middleware (防止機器人與未授權 API 呼叫)
// =================================================================
export const requireAppCheck = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (process.env.FUNCTIONS_EMULATOR === 'true' || process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  const appCheckToken = req.header('X-Firebase-AppCheck');
  if (!appCheckToken) {
    return res.status(401).json({ error: '拒絕連線：缺少有效 App Check 安全認證' });
  }

  try {
    await getAppCheck().verifyToken(appCheckToken);
    return next();
  } catch (err) {
    console.error('App Check 驗證失敗:', err);
    return res.status(401).json({ error: '拒絕連線：App Check 驗證失敗 (Unauthorized Bot)' });
  }
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
  requireAppCheck,
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
  res.status(404).json({ error: `無效的 API 請求: ${req.method} ${req.path}` });
});

export const api = onRequest({ cors: true, invoker: 'public' }, app);
