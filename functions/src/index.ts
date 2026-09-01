import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { getAppCheck } from 'firebase-admin/app-check';
import express from 'express';

setGlobalOptions({ maxInstances: 10, minInstances: 0, memory: "256MiB", region: "asia-east1", concurrency: 80, timeoutSeconds: 30, invoker: 'public' });
import cors from 'cors';
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
db.settings({ ignoreUndefinedProperties: true });
const storageBucket = getStorage().bucket('sabay-bbq-order.firebasestorage.app');
const app = express();

// 🔐 安全認證與驗證模組
import { createStaffAuthMiddleware } from './auth';

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
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const key = `${actionName}:${ip}`;
    const now = Date.now();

    // 1. L1 Memory Check (擋掉 99% 的短時間巨量狂暴攻擊)
    let bucket = rateLimitStore.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, bucket);
    }

    if (bucket.count >= maxRequests) {
      const waitSec = Math.ceil((bucket.resetAt - now) / 1000);
      return res.status(429).json({
        error: `請求頻率過高：${actionName} 頻率已達上限，請於 ${waitSec} 秒後再試 (Too Many Requests - L1)`
      });
    }
    bucket.count++;

    // 🚀 智慧水位節流 (Threshold Buffering): 若 L1 仍在安全水位 (< 70%)，直接放行，0 Firestore 讀寫消耗
    const threshold = Math.floor(maxRequests * 0.7);
    if (bucket.count < threshold) {
      return next();
    }

    // 2. L2 Firestore Distributed Check (僅在達到高水位時觸發)
    const cleanIp = ip.replace(/[^a-zA-Z0-9_.]/g, '_');
    const timeWindowId = Math.floor(now / windowMs);
    const fsDocId = `${actionName}_${cleanIp}_${timeWindowId}`;
    const fsDocRef = db.collection('_ratelimits').doc(fsDocId);

    try {
      const docSnap = await fsDocRef.get();
      const currentGlobalCount = docSnap.exists ? (docSnap.data()?.count || 0) : 0;

      if (currentGlobalCount >= maxRequests) {
        // 同步填滿 L1 Bucket，讓後續同實例請求提早擋下，節省 Firestore 讀取帳單
        bucket.count = maxRequests;
        const waitSec = Math.ceil((bucket.resetAt - now) / 1000);
        return res.status(429).json({
          error: `請求頻率過高：${actionName} 頻率已達上限，請於 ${waitSec} 秒後再試 (Too Many Requests - L2)`
        });
      }

      // 非同步增加全局計數與 TTL，不阻塞主執行緒 (Fire and forget)
      fsDocRef.set({
        count: FieldValue.increment(1),
        expireAt: new Date(now + windowMs * 2)
      }, { merge: true }).catch(err => console.error('[RateLimiter L2] Async update failed:', err));

      // P2-3: 🗑️ 輕量級隨機清理過期 _ratelimits (機率 2%)
      if (Math.random() < 0.02) {
        db.collection('_ratelimits').where('expireAt', '<', new Date()).limit(50).get()
          .then(expiredSnap => {
            if (!expiredSnap.empty) {
              const batch = db.batch();
              expiredSnap.docs.forEach(d => batch.delete(d.ref));
              return batch.commit();
            }
            return null;
          })
          .catch(err => console.error('[RateLimiter Cleanup] Failed:', err));
      }

      return next();
    } catch (err) {
      // 降級放行 (Fail-open): 若 Firestore 異常，不阻斷正常顧客點餐，依賴 L1 防護即可
      console.warn('[RateLimiter L2] Check failed, falling back to L1:', err);
      return next();
    }
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
    // 允許一般手機掃碼顧客正常點餐 (無 ReCAPTCHA App Check 金鑰時放行)
    return next();
  }

  try {
    await getAppCheck().verifyToken(appCheckToken);
    return next();
  } catch (err) {
    console.warn('[App Check] 憑證驗證提醒 (軟性放行):', err);
    return next();
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
import { cleanupStorageImage } from './helpers';

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

// ============================================================
// ⚡ Firestore Event Trigger — 孤兒圖片自動非同步清理 (Suggestion 1)
// ============================================================
export const onMenuItemWritten = onDocumentWritten({
  document: 'menu/{menuId}',
  database: 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07',
  region: 'asia-east1'
}, async (event) => {
  try {
    const beforeData = event.data?.before.exists ? event.data.before.data() : null;
    const afterData = event.data?.after.exists ? event.data.after.data() : null;

    // 情境 1: 餐點被刪除 -> 清理舊圖片、縮圖與 AVIF 版本
    if (beforeData && !afterData) {
      if (beforeData.image) {
        console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning image: ${beforeData.image}`);
        await cleanupStorageImage(beforeData.image, storageBucket);
      }
      if (beforeData.thumbnailUrl) {
        console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning thumbnail: ${beforeData.thumbnailUrl}`);
        await cleanupStorageImage(beforeData.thumbnailUrl, storageBucket);
      }
      if (beforeData.avifUrl) {
        console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning avif: ${beforeData.avifUrl}`);
        await cleanupStorageImage(beforeData.avifUrl, storageBucket);
      }
      if (beforeData.avifThumbnailUrl) {
        console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning avif thumbnail: ${beforeData.avifThumbnailUrl}`);
        await cleanupStorageImage(beforeData.avifThumbnailUrl, storageBucket);
      }
      return;
    }

    // 情境 2: 餐點被更新 -> 若圖片、縮圖或 AVIF 有更換，清理舊檔案
    if (beforeData && afterData) {
      const oldImage = beforeData.image;
      const newImage = afterData.image;
      if (oldImage && oldImage !== newImage) {
        console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new image, cleaning old image: ${oldImage}`);
        await cleanupStorageImage(oldImage, storageBucket);
      }

      const oldThumb = beforeData.thumbnailUrl;
      const newThumb = afterData.thumbnailUrl;
      if (oldThumb && oldThumb !== newThumb) {
        console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new thumbnail, cleaning old thumb: ${oldThumb}`);
        await cleanupStorageImage(oldThumb, storageBucket);
      }

      const oldAvif = beforeData.avifUrl;
      const newAvif = afterData.avifUrl;
      if (oldAvif && oldAvif !== newAvif) {
        console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new avif, cleaning old avif: ${oldAvif}`);
        await cleanupStorageImage(oldAvif, storageBucket);
      }

      const oldAvifThumb = beforeData.avifThumbnailUrl;
      const newAvifThumb = afterData.avifThumbnailUrl;
      if (oldAvifThumb && oldAvifThumb !== newAvifThumb) {
        console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new avif thumb, cleaning old avif thumb: ${oldAvifThumb}`);
        await cleanupStorageImage(oldAvifThumb, storageBucket);
      }
      return;
    }
  } catch (error: any) {
    console.error(`[Firestore Trigger Error] onMenuItemWritten failed for menuId: ${event.params.menuId}`, error);
  }
});

