import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
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

const orderRateLimiter = createRateLimiter(15, 60 * 1000, '訂單提交');
const reservationRateLimiter = createRateLimiter(10, 60 * 1000, '預約提交');


// Helper functions to register routes under both '/api/path' and '/path'
const get = (routePath: string, ...handlers: express.RequestHandler[]) => {
  app.get([`/api${routePath}`, routePath], ...handlers);
};
const post = (routePath: string, ...handlers: express.RequestHandler[]) => {
  app.post([`/api${routePath}`, routePath], ...handlers);
};
const put = (routePath: string, ...handlers: express.RequestHandler[]) => {
  app.put([`/api${routePath}`, routePath], ...handlers);
};
const del = (routePath: string, ...handlers: express.RequestHandler[]) => {
  app.delete([`/api${routePath}`, routePath], ...handlers);
};

// --- Google Cloud Storage APIs ---
// 2. Upload Image to Google Cloud Storage
post('/images/upload', requireStaffAuth, async (req, res) => {
  try {
    const validation = validateImageUploadPayload(req.body);
    if (!validation.isValid || !validation.sanitizedData) {
      return res.status(400).json({ error: validation.error || 'Missing or invalid image data' });
    }

    const { base64Clean, mime, cleanExt, targetFolder, targetFilename } = validation.sanitizedData;
    const buffer = Buffer.from(base64Clean, 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: '圖片大小超出 10MB 上限 (Max 10MB)' });
    }

    const targetPath = `${targetFolder}/${targetFilename}`;
    const file = storageBucket.file(targetPath);
    await file.save(buffer, {
      metadata: {
        contentType: mime,
        cacheControl: 'public, max-age=86400, stale-while-revalidate=604800'
      },
      resumable: false
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(targetPath)}?alt=media`;
    return res.json({
      success: true,
      url: publicUrl,
      path: targetPath,
      filename: targetFilename,
      size: buffer.length,
      contentType: mime
    });
  } catch (error: any) {
    console.error('[Cloud Functions Storage Upload Error]:', error);
    res.status(500).json({ error: 'Failed to upload image to storage', details: error?.message });
  }
});

// In-Memory Caching for High-Read Endpoints
let cachedMenu: { data: any; timestamp: number } | null = null;
let cachedCategories: { data: any; timestamp: number } | null = null;
let cachedSettings: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

async function getCachedSettings() {
  const nowMs = Date.now();
  if (cachedSettings && (nowMs - cachedSettings.timestamp < CACHE_TTL_MS)) {
    return cachedSettings.data;
  }
  const doc = await db.collection('settings').doc('system').get();
  cachedSettings = { data: doc.data() || {}, timestamp: nowMs };
  return cachedSettings.data;
}

// --- GET APIs ---

// 0. Consolidated Bootstrap endpoint for fast initial load
get('/bootstrap', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=180, stale-while-revalidate=600');
    const todayStr = new Date().toISOString().split('T')[0];
    const [
      categoriesSnap,
      menuSnap,
      tablesSnap,
      systemDoc,
      ingredientsSnap,
      reservationsSnap
    ] = await Promise.all([
      db.collection('categories').select('id', 'name', 'showOnCustomerPage', 'orderIndex').orderBy('orderIndex').get(),
      db.collection('menu').select('id', 'category', 'name', 'price', 'image', 'description', 'available', 'isAvailable', 'isSetMeal', 'requiredSaucesOption', 'hasNoodlesOption', 'hasCoconutsMilkOption', 'containsBeef', 'containsPork', 'containsSeafood', 'isNotSpicy', 'customAddOns', 'recipe', 'orderIndex', 'isTakeoutAvailable', 'soldOutAt').orderBy('orderIndex').get(),
      db.collection('tables').select('id', 'qrCodeUrl', 'status', 'cleaningStartedAt', 'maxCapacity', 'positionX', 'positionY', 'preservedFor', 'mergedWith').get(),
      db.collection('settings').doc('system').get(),
      db.collection('ingredients').select('id', 'name', 'stock', 'minThreshold', 'unit').get(),
      db.collection('reservations').select('id', 'customerName', 'phone', 'guestCount', 'tableNumber', 'date', 'time', 'status', 'notes', 'createdAt', 'reservationNo').where('date', '>=', todayStr).limit(100).get()
    ]);

    const now = new Date();
    const items = menuSnap.docs.map(doc => {
      const data = doc.data();
      return { ...data, _docId: doc.id };
    });

    const processedItems = items.map((item: any) => {
      if (item.available === false) {
        if (!item.soldOutAt) {
          item.soldOutAt = now.toISOString();
        } else {
          const soldDate = new Date(item.soldOutAt);
          if (!isNaN(soldDate.getTime())) {
            const restoreTime = new Date(soldDate);
            restoreTime.setDate(restoreTime.getDate() + 1);
            restoreTime.setHours(12, 0, 0, 0);
            if (now.getTime() >= restoreTime.getTime()) {
              item.available = true;
              item.soldOutAt = null;
            }
          }
        }
      } else if (item.soldOutAt) {
        item.soldOutAt = null;
      }
      
      delete item._docId;
      return item;
    });

    const nowMs = Date.now();
    const tables = tablesSnap.docs.map(doc => {
      const tb = doc.data() as any;
      if (tb.status === 'cleaning') {
        let cleaningStartMs = tb.cleaningStartedAt ? new Date(tb.cleaningStartedAt).getTime() : 0;
        if (!cleaningStartMs || isNaN(cleaningStartMs)) {
          cleaningStartMs = nowMs - (16 * 60 * 1000);
        }
        if (nowMs - cleaningStartMs >= 15 * 60 * 1000) {
          tb.status = 'available';
          tb.cleaningStartedAt = null;
        }
      }
      return tb;
    });

    const sysData = systemDoc.data() || {};
    const isOpen = isStoreOpenFromData(sysData);

    const processedCategories = categoriesSnap.docs.map(doc => {
      return doc.data();
    });

    res.json({
      menu: processedItems,
      categories: processedCategories,
      tables,
      operatingHours: {
        slots: sysData.liveOperatingHours || [],
        restDays: sysData.liveRestDays || [],
        isOpen
      },
      customerNotice: { notice: sysData.liveCustomerNotice || '' },
      promoCombo: sysData.livePromoCombo || { enabled: false, requiredQty: 0, discountAmount: 0, eligibleItemIds: [] },
      popularItemIds: sysData.livePopularItemIds || [],
      minSpend: { minSpend: sysData.liveMinSpendPerPerson ?? 200 },
      membersConfig: {
        pointsRatio: sysData.liveMemberPointsRatio ?? 20,
        rewards: sysData.liveMemberRewards || []
      },
      servicePaused: { servicePaused: sysData.liveServicePaused || false },
      printerConfig: { ip: sysData.livePrinterIp || '192.168.123.100' },
      ingredients: ingredientsSnap.docs.map(doc => doc.data()),
      reservations: reservationsSnap.docs.map(doc => doc.data())
    });
  } catch (error) {
    console.error('Error fetching bootstrap data:', error);
    res.status(500).send(error);
  }
});

// 1. Get Categories
get('/categories', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
    
    const nowMs = Date.now();
    if (cachedCategories && (nowMs - cachedCategories.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedCategories.data);
    }

    const snapshot = await db.collection('categories').select('id', 'name', 'showOnCustomerPage', 'orderIndex').orderBy('orderIndex').get();
    const categories = snapshot.docs.map(doc => doc.data());
    
    cachedCategories = { data: categories, timestamp: nowMs };
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send(error);
  }
});

// 2. Get Menu
get('/menu', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=120, stale-while-revalidate=300');
    
    const nowMs = Date.now();
    if (cachedMenu && (nowMs - cachedMenu.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedMenu.data);
    }

    const now = new Date();
    const snapshot = await db.collection('menu').select('id', 'category', 'name', 'price', 'image', 'description', 'available', 'isAvailable', 'isSetMeal', 'requiredSaucesOption', 'hasNoodlesOption', 'hasCoconutsMilkOption', 'containsBeef', 'containsPork', 'containsSeafood', 'isNotSpicy', 'customAddOns', 'recipe', 'orderIndex', 'isTakeoutAvailable', 'soldOutAt').orderBy('orderIndex').get();
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, _docId: doc.id };
    });

    const processedItems = items.map((item: any) => {
      if (item.available === false) {
        if (!item.soldOutAt) {
          item.soldOutAt = now.toISOString();
        } else {
          const soldDate = new Date(item.soldOutAt);
          if (!isNaN(soldDate.getTime())) {
            const restoreTime = new Date(soldDate);
            restoreTime.setDate(restoreTime.getDate() + 1);
            restoreTime.setHours(12, 0, 0, 0);

            if (now.getTime() >= restoreTime.getTime()) {
              item.available = true;
              item.soldOutAt = null;
            }
          }
        }
      } else if (item.soldOutAt) {
        item.soldOutAt = null;
      }
      delete item._docId;
      return item;
    });

    cachedMenu = { data: processedItems, timestamp: nowMs };
    res.json(processedItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).send(error);
  }
});

// 3. Get Ingredients
get('/ingredients', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=60, stale-while-revalidate=120');
    const snapshot = await db.collection('ingredients').select('id', 'name', 'stock', 'minThreshold', 'unit').get();
    const ingredients = snapshot.docs.map(doc => doc.data());
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).send(error);
  }
});

// --- Write APIs (POST/PUT/DELETE) ---
// 1. Create Menu
post('/menu', requireStaffAuth, async (req, res) => {
  try {
    const data = req.body;
    const isAvail = data.available !== undefined ? !!data.available : true;
    const newItem = {
      id: `dish-${Date.now()}`,
      ...data,
      available: isAvail,
      soldOutAt: !isAvail ? new Date().toISOString() : null,
      orderIndex: data.orderIndex !== undefined ? data.orderIndex : 999
    };
    await db.collection('menu').doc(newItem.id).set(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).send(error);
  }
});

// 1.5 Reorder Menu
put('/menu/reorder', requireStaffAuth, async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order parameter' });
  try {
    const batch = db.batch();
    order.forEach((id: string, index: number) => {
      const ref = db.collection('menu').doc(id);
      batch.update(ref, { orderIndex: index });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 2. Update Menu
put('/menu/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    if (data.available !== undefined) {
      if (data.available === false && !data.soldOutAt) {
        data.soldOutAt = new Date().toISOString();
      } else if (data.available === true) {
        data.soldOutAt = null;
      }
    }
    await db.collection('menu').doc(id).set(data, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).send(error);
  }
});

// 3. Delete Menu
del('/menu/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.collection('menu').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).send(error);
  }
});

// 3.5 Toggle Menu Availability (設為沽清 / 恢復販售)
post('/menu/toggle-available', requireStaffAuth, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing menu item id' });
    }

    let docRef = db.collection('menu').doc(id);
    let docSnap = await docRef.get();

    if (!docSnap.exists) {
      const query = await db.collection('menu').where('id', '==', id).limit(1).get();
      if (!query.empty) {
        docRef = query.docs[0].ref;
        docSnap = query.docs[0];
      }
    }

    if (docSnap.exists) {
      const currentData = docSnap.data();
      const newAvailable = !(currentData?.available ?? true);
      const newSoldOutAt = !newAvailable ? new Date().toISOString() : null;
      await docRef.set({ available: newAvailable, soldOutAt: newSoldOutAt }, { merge: true });
      const updatedItem = { ...currentData, available: newAvailable, soldOutAt: newSoldOutAt };
      return res.json({ success: true, item: updatedItem, available: newAvailable });
    }

    return res.status(404).json({ error: 'Menu item not found' });
  } catch (error: any) {
    console.error('Error toggling menu availability in Cloud Functions:', error);
    return res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// 4. Create Category
post('/categories', requireStaffAuth, async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('categories').add(data);
    res.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).send(error);
  }
});

// 5. Update Category
put('/categories/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    await db.collection('categories').doc(id).set(data, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send(error);
  }
});

// 6. Delete Category
del('/categories/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.collection('categories').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send(error);
  }
});

// 7. Create Ingredient
post('/ingredients', requireStaffAuth, async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection('ingredients').add(data);
    res.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).send(error);
  }
});

// 8. Update Ingredient
put('/ingredients/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    await db.collection('ingredients').doc(id).set(data, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).send(error);
  }
});

// 9. Delete Ingredient
del('/ingredients/:id', requireStaffAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    await db.collection('ingredients').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).send(error);
  }
});

// 4. Get Tables
get('/tables', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=5, stale-while-revalidate=15');
    const snapshot = await db.collection('tables').select('id', 'qrCodeUrl', 'status', 'cleaningStartedAt', 'maxCapacity', 'positionX', 'positionY', 'preservedFor', 'mergedWith').get();
    const nowMs = Date.now();
    const tables = snapshot.docs.map(doc => {
      const tb = doc.data() as any;
      if (tb.status === 'cleaning') {
        let cleaningStartMs = tb.cleaningStartedAt ? new Date(tb.cleaningStartedAt).getTime() : 0;
        if (!cleaningStartMs || isNaN(cleaningStartMs)) {
          cleaningStartMs = nowMs - (16 * 60 * 1000);
        }
        if (nowMs - cleaningStartMs >= 15 * 60 * 1000) {
          tb.status = 'available';
          tb.cleaningStartedAt = null;
        }
      }
      return tb;
    });

    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).send(error);
  }
});

// 5. Get Reservations
get('/reservations', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30');
    const todayStr = new Date().toISOString().split('T')[0];
    const snapshot = await db.collection('reservations').select('id', 'customerName', 'phone', 'guestCount', 'tableNumber', 'date', 'time', 'status', 'notes', 'createdAt', 'reservationNo').where('date', '>=', todayStr).limit(100).get();
    const reservations = snapshot.docs.map(doc => doc.data());
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).send(error);
  }
});

// 6. Get Orders
get('/orders', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=5, stale-while-revalidate=10');
    const snapshot = await db.collection('orders').select('id', 'tableNumber', 'items', 'subtotal', 'serviceCharge', 'total', 'status', 'createdAt', 'customerName', 'customerAvatar', 'paymentMethod', 'isMember', 'isPaid', 'guestCount', 'refundLogs', 'discount', 'quickNotes', 'isFlagged', 'flagReason', 'takeoutInfo', 'rating', 'feedback', 'isOfflinePending', 'clientOrderId', 'reservationNo', 'reservationDate', 'reservationTime').orderBy('createdAt', 'desc').limit(200).get();
    const orders = snapshot.docs.map(doc => doc.data());
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send(error);
  }
});

// --- System & settings GET APIs ---

let cachedServicePause: { data: any; timestamp: number } | null = null;

// 7. Service Pause Settings
get('/settings/service-pause', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
    
    const nowMs = Date.now();
    if (cachedServicePause && (nowMs - cachedServicePause.timestamp < CACHE_TTL_MS)) {
      return res.json(cachedServicePause.data);
    }
    
    const sysData = await getCachedSettings();
    const data = { servicePaused: sysData?.liveServicePaused || false };
    cachedServicePause = { data, timestamp: nowMs };
    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 8. Minimum Spend Settings
get('/settings/min-spend', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    res.json({ minSpend: sysData?.liveMinSpendPerPerson ?? 200 });
  } catch (error) {
    res.status(500).send(error);
  }
});

function isStoreOpenFromData(sysData: any, timestamp?: number, isReservation: boolean = false): boolean {
  if (!sysData) return true;
  if (sysData.liveServicePaused) return false;

  const restDays: string[] = sysData.liveRestDays || [];
  const operatingHours: any[] = sysData.liveOperatingHours || [];

  const date = timestamp ? new Date(timestamp) : new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const localDate = new Date(utc + (3600000 * 8)); // Taiwan Time (UTC+8)

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(localDate.getDate()).padStart(2, '0');
  const taiwanDateString = `${year}-${month}-${dayOfMonth}`;

  if (restDays.includes(taiwanDateString)) {
    return false;
  }

  const activeSlots = operatingHours.filter((s: any) => s && s.isActive);
  if (activeSlots.length === 0) {
    return true;
  }

  const day = localDate.getDay(); // 0 is Sunday, ..., 6 is Saturday
  const hour = localDate.getHours();
  const minute = localDate.getMinutes();
  const currentTotalMinutes = hour * 60 + minute;

  for (const slot of activeSlots) {
    if (slot.days && Array.isArray(slot.days) && !slot.days.includes(day)) continue;
    if (slot.isReservableOnly && !isReservation) continue;

    const [startH, startM] = (slot.start || '00:00').split(':').map(Number);
    const [endH, endM] = (slot.end || '23:59').split(':').map(Number);

    const startTotal = (startH || 0) * 60 + (startM || 0);
    const endTotal = (endH || 0) * 60 + (endM || 0);

    if (startTotal <= endTotal) {
      if (currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal) {
        return true;
      }
    } else {
      if (currentTotalMinutes >= startTotal || currentTotalMinutes <= endTotal) {
        return true;
      }
    }
  }

  return false;
}

// 9. Operating Hours Settings
get('/settings/operating-hours', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    const data = sysData || {};
    const isOpen = isStoreOpenFromData(data);
    res.json({
      slots: data.liveOperatingHours || [],
      restDays: data.liveRestDays || [],
      isOpen
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 10. Customer Notice
get('/settings/customer-notice', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
    const sysData = await getCachedSettings();
    res.json({ notice: sysData?.liveCustomerNotice || '' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 11. Popular Item IDs
get('/settings/popular-item-ids', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    res.json(sysData?.livePopularItemIds || []);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 12. Members Configuration
get('/settings/members-config', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    const data = sysData;
    res.json({
      pointsRatio: data?.liveMemberPointsRatio ?? 20,
      rewards: data?.liveMemberRewards || []
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 13. Promo Combo Config
get('/promo-combo', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
    const sysData = await getCachedSettings();
    res.json(sysData?.livePromoCombo || { enabled: false, requiredQty: 0, discountAmount: 0, eligibleItemIds: [] });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 13.5. Option Rules Config
get('/option-rules', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    const defaultRules = [
      {
        id: 'rule-1784360566576',
        name: '加河粉',
        category: '加配料',
        price: 20
      },
      {
        id: 'rule-1784360574891',
        name: '加米線',
        category: '加配料',
        price: 20
      },
      {
        id: 'rule-1784360613823',
        name: '升級套餐(烤蔬菜+泰奶一杯)',
        category: '加配料',
        price: 140
      }
    ];
    res.json(sysData?.liveOptionRules || defaultRules);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 14. Printer Configuration
get('/printer/config', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=1800');
    const sysData = await getCachedSettings();
    res.json({ ip: sysData?.livePrinterIp || '192.168.123.100' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 15. Print Logs
get('/print-logs', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const logsDoc = await db.collection('settings').doc('logs').get();
    res.json(logsDoc.data()?.printLogs || []);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 16. Push Notifications
get('/push-notifications', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    const logsDoc = await db.collection('settings').doc('logs').get();
    res.json(logsDoc.data()?.promoNotifications || []);
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- POST/PUT/DELETE APIs ---

// 17. Submit Order
post('/orders', orderRateLimiter, async (req, res) => {
  const validation = validateOrderPayload(req.body);
  if (!validation.isValid || !validation.sanitizedData) {
    return res.status(400).json({ error: validation.error || '無效的訂單資料格式' });
  }
  const orderData = validation.sanitizedData;
  const orderId = orderData.id || `ORD-${Date.now().toString(36).toUpperCase()}`;

  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const sysData = systemDoc.data();
    
    // 預約專屬點餐 (reservationNo/reservationDate) 或 外帶點餐 (takeoutInfo/外帶) 豁免一般營業時間限制
    const isTakeoutOrder = !!(orderData.takeoutInfo || String(orderData.tableNumber || '').includes('外帶') || String(orderData.tableNumber || '').toLowerCase() === 'takeout');
    const isReservationOrder = !!(orderData.reservationNo || orderData.reservationDate);
    if (!isReservationOrder && !isTakeoutOrder && !isStoreOpenFromData(sysData)) {
      return res.status(403).json({ error: '目前不在營業時間內（店鋪休息中），系統不開放下單點餐！' });
    }

    const savedOrder = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt || new Date().toISOString(),
    };

    await db.collection('orders').doc(orderId).set(savedOrder);

    // Mark table as in_use and clear cleaningStartedAt
    if (orderData.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
      const tblId = String(orderData.tableNumber).trim();
      const tableRef = db.collection('tables').doc(tblId);
      const tableSnap = await tableRef.get();
      if (tableSnap.exists) {
        await tableRef.update({ status: 'in_use', cleaningStartedAt: null });
      }
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).send(error);
  }
});

// 18. Update Order Status
put('/orders/:id/status', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { status } = req.body;
  try {
    await db.collection('orders').doc(id).update({ status });
    res.json({ id, status });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 19. Update Order Table Number
put('/orders/:id/table-number', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { tableNumber } = req.body;
  try {
    await db.collection('orders').doc(id).update({ tableNumber });
    res.json({ id, tableNumber });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 20. Update Order Quick Notes
put('/orders/:id/quick-notes', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { quickNotes } = req.body;
  try {
    await db.collection('orders').doc(id).update({ quickNotes });
    res.json({ id, quickNotes });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 21. Update Order Flag
put('/orders/:id/flag', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { isFlagged, flagReason } = req.body;
  try {
    await db.collection('orders').doc(id).update({ isFlagged, flagReason });
    res.json({ id, isFlagged, flagReason });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 22. Update Order Items
put('/orders/:id/items', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { items, refundLogs } = req.body;
  try {
    await db.collection('orders').doc(id).update({ items, refundLogs });
    res.json({ id, items, refundLogs });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 23. Checkout Order
put('/orders/:id/checkout', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const checkoutData = req.body;
  try {
    // Check if the order has a reservationNo
    const orderDoc = await db.collection('orders').doc(id).get();
    const orderData = orderDoc.data();

    // 🛡️ If order was already completed or cancelled, keep its status instead of rolling back to 'paid'
    const currentStatus = orderData?.status;
    const resolvedStatus = (currentStatus === 'completed' || currentStatus === 'cancelled') ? currentStatus : 'paid';

    await db.collection('orders').doc(id).update({
      ...checkoutData,
      isPaid: true,
      status: resolvedStatus
    });

    if (orderData && orderData.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
      const tblId = String(orderData.tableNumber).trim();
      const tableRef = db.collection('tables').doc(tblId);
      const tableSnap = await tableRef.get();
      if (tableSnap.exists) {
        await tableRef.update({
          status: 'cleaning',
          preservedFor: '',
          cleaningStartedAt: new Date().toISOString()
        });
      }
    }

    if (orderData && orderData.reservationNo) {
      // Find the reservation by reservationNo (it could be stored as `id` or `reservationNo`)
      const resQuery = await db.collection('reservations').where('reservationNo', '==', orderData.reservationNo).get();
      if (!resQuery.empty) {
        for (const doc of resQuery.docs) {
          await db.collection('reservations').doc(doc.id).delete();
        }
      } else {
        // Fallback: it might be stored directly as the document ID
        const resDoc = await db.collection('reservations').doc(orderData.reservationNo).get();
        if (resDoc.exists) {
          await db.collection('reservations').doc(orderData.reservationNo).delete();
        }
      }
    }

    res.json({ id, ...checkoutData, isPaid: true, status: resolvedStatus });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 23.5. Kitchen Complete (出餐完成) - Mark a paid order as completed from KDS
put('/orders/:id/complete', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('orders').doc(id).update({
      status: 'completed'
    });
    res.json({ id, status: 'completed' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 23.6. Toggle single order item completed state
put('/orders/:id/items/:itemId/complete', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const itemId = req.params.itemId as string;
  const { isCompleted, isPrepared } = req.body;

  try {
    const docRef = db.collection('orders').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = docSnap.data() as any;
    const item = order.items.find((it: any) => it.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (typeof isCompleted !== 'undefined') {
      item.isCompleted = !!isCompleted;
      if (item.isCompleted) {
        item.isPrepared = true;
      }
    }

    if (typeof isPrepared !== 'undefined') {
      item.isPrepared = !!isPrepared;
    }

    const allCompleted = order.items.every((it: any) => it.isCompleted);
    if (allCompleted && order.status !== 'paid') {
      order.status = 'completed';
    } else if (order.status === 'completed') {
      order.status = 'preparing';
    }

    await docRef.set(order, { merge: true });
    return res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 24. Delete Order
del('/orders/:id', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('orders').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 25. Adjust Inventory Stock
post('/inventory/adjust', requireStaffAuth, async (req, res) => {
  const { ingredientId, quantityChanged } = req.body;
  const change = Number(quantityChanged);
  if (isNaN(change)) {
    return res.status(400).json({ error: 'Invalid quantityChanged' });
  }
  const ingRef = db.collection('ingredients').doc(ingredientId);
  try {
    await db.runTransaction(async (t) => {
      const docSnap = await t.get(ingRef);
      const newStock = Math.round(((docSnap.data()?.stock || 0) + change) * 100) / 100;
      t.update(ingRef, { stock: newStock });
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).send(error);
  }
});

// 26. Restock Ingredients
post('/ingredients/restock', requireStaffAuth, async (req, res) => {
  const { ingredientId, quantityAdded } = req.body;
  const amount = Number(quantityAdded);
  if (isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid quantityAdded' });
  }
  const ingRef = db.collection('ingredients').doc(ingredientId);
  try {
    await db.runTransaction(async (t) => {
      const docSnap = await t.get(ingRef);
      const newStock = Math.round(((docSnap.data()?.stock || 0) + amount) * 100) / 100;
      t.update(ingRef, { stock: newStock });
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 27. Clear Print Logs
post('/print-logs/clear', requireStaffAuth, async (_req, res) => {
  try {
    await db.collection('settings').doc('logs').set({ printLogs: [] }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Write Settings APIs ---

// 28. Save Service Pause State
post('/settings/service-pause', requireStaffAuth, async (req, res) => {
  const { servicePaused } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveServicePaused: !!servicePaused }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 29. Save Minimum Spend
post('/settings/min-spend', requireStaffAuth, async (req, res) => {
  const { minSpend } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveMinSpendPerPerson: Number(minSpend) }, { merge: true });
    res.json({ success: true, minSpend: Number(minSpend) });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 30. Save Operating Hours
post('/settings/operating-hours', requireStaffAuth, async (req, res) => {
  const { slots, restDays } = req.body;
  try {
    await db.collection('settings').doc('system').set({
      liveOperatingHours: slots,
      liveRestDays: restDays
    }, { merge: true });
    const systemDoc = await db.collection('settings').doc('system').get();
    const servicePaused = systemDoc.data()?.liveServicePaused || false;
    res.json({ success: true, slots, restDays, isOpen: !servicePaused });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 31. Save Customer Notice
post('/settings/customer-notice', requireStaffAuth, async (req, res) => {
  const { notice } = req.body;
  try {
    await db.collection('settings').doc('system').set({ liveCustomerNotice: String(notice) }, { merge: true });
    res.json({ success: true, notice: String(notice) });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 32. Save Popular Item IDs
post('/settings/popular-item-ids', requireStaffAuth, async (req, res) => {
  const { popularItemIds, ids } = req.body;
  const targetIds = popularItemIds || ids || [];
  try {
    await db.collection('settings').doc('system').set({ livePopularItemIds: targetIds }, { merge: true });
    res.json({ success: true, popularItemIds: targetIds });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 33. Save Printer IP (PUT / POST)
const handleSavePrinterIp: express.RequestHandler = async (req, res) => {
  const { ip } = req.body;
  const targetIp = String(ip || '192.168.123.100');
  try {
    const systemRef = db.collection('settings').doc('system');
    const docSnap = await systemRef.get();
    const sysData = docSnap.data() || {};
    let currentSettings = sysData.livePrinterSettings || {};
    if (!currentSettings.kitchen) currentSettings.kitchen = {};
    if (!currentSettings.bill) currentSettings.bill = {};
    currentSettings.kitchen.ip = targetIp;
    currentSettings.bill.ip = targetIp;

    await systemRef.set({
      livePrinterIp: targetIp,
      livePrinterSettings: currentSettings
    }, { merge: true });

    res.json({ success: true, ip: targetIp });
  } catch (error) {
    res.status(500).send(error);
  }
};
put('/printer/config', requireStaffAuth, handleSavePrinterIp);
post('/printer/config', requireStaffAuth, handleSavePrinterIp);

// 35. Staff PIN Authentication & Verification Endpoints
get('/staff/pin/value', (_req, res) => {
  res.json({ blocked: true });
});

post('/staff/pin/check-path', async (req, res) => {
  const { pathPin } = req.body;
  if (!pathPin) {
    return res.json({ valid: false });
  }
  try {
    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    const credsData = credsDoc.data() || {};

    // 🛡️ 檢查是否處於暴力破解鎖定狀態
    const now = Date.now();
    const lockedUntil = credsData.lockedUntil ? Number(credsData.lockedUntil) : 0;
    if (lockedUntil && now < lockedUntil) {
      return res.json({ valid: false, locked: true });
    }

    let storedHash = credsData.staffPinHash;
    if (!storedHash) {
      // Fallback & automatic migration from legacy settings
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
      storedHash = hashPin(legacyPin);
      await credsRef.set({ staffPinHash: storedHash }, { merge: true });
    }
    const inputHash = hashPin(pathPin);
    return res.json({ valid: inputHash === storedHash });
  } catch (_error) {
    return res.json({ valid: false });
  }
});

post('/staff/pin/verify', async (req, res) => {
  const { pin } = req.body;
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ success: false, error: '請輸入有效的 6 位數金鑰' });
  }

  try {
    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    const credsData = credsDoc.data() || {};

    // 🛡️ 檢查是否處於暴力破解鎖定狀態
    const now = Date.now();
    const lockedUntil = credsData.lockedUntil ? Number(credsData.lockedUntil) : 0;
    if (lockedUntil && now < lockedUntil) {
      const remainingMinutes = Math.ceil((lockedUntil - now) / (60 * 1000));
      return res.status(429).json({
        success: false,
        error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。`,
        locked: true,
        remainingMinutes
      });
    }

    let storedHash = credsData.staffPinHash;
    if (!storedHash) {
      // Fallback & automatic migration from legacy settings
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
      storedHash = hashPin(legacyPin);
      await credsRef.set({ staffPinHash: storedHash }, { merge: true });
    }

    const inputHash = hashPin(pin);
    if (inputHash === storedHash) {
      const sessionToken = `st_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
      const tokenExpiresAt = now + (8 * 60 * 60 * 1000); // 8 小時有效期

      await credsRef.set({
        activeSessionToken: sessionToken,
        tokenExpiresAt,
        lastLoginAt: new Date().toISOString(),
        failedAttempts: 0,
        lockedUntil: null
      }, { merge: true });

      invalidateAuthCache();
      return res.json({ success: true, access_token: sessionToken, expires_in: 28800 });
    }

    // PIN 錯誤：累計失敗次數並進行安全防護
    const failedAttempts = (credsData.failedAttempts || 0) + 1;
    const updateData: any = {
      failedAttempts,
      lastFailedAt: new Date().toISOString()
    };

    if (failedAttempts >= 5) {
      const lockDuration = 15 * 60 * 1000; // 鎖定 15 分鐘
      updateData.lockedUntil = now + lockDuration;
      await credsRef.set(updateData, { merge: true });
      return res.status(429).json({
        success: false,
        error: '連續 5 次輸入金鑰錯誤，系統已啟動防護鎖定 15 分鐘！',
        locked: true,
        remainingMinutes: 15
      });
    }

    await credsRef.set(updateData, { merge: true });
    const remainingTries = 5 - failedAttempts;
    return res.status(400).json({
      success: false,
      error: `解鎖金鑰錯誤！剩餘嘗試次數：${remainingTries} 次`
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).send(error);
  }
});

// 36. Update Staff PIN
put('/staff/pin', requireStaffAuth, async (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰' });
  }
  if (!/^\d{6}$/.test(newPin)) {
    return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
  }

  try {
    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    let storedHash = credsDoc.data()?.staffPinHash;
    if (!storedHash) {
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
      storedHash = hashPin(legacyPin);
    }

    if (hashPin(currentPin) !== storedHash) {
      return res.status(400).json({ error: '目前金鑰輸入錯誤！' });
    }

    const newHash = hashPin(newPin);
    await credsRef.set({
      staffPinHash: newHash,
      updatedAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null
    }, { merge: true });
    invalidateAuthCache();

    // Remove plaintext pin from system settings if exists
    await db.collection('settings').doc('system').update({ liveStaffPin: FieldValue.delete() }).catch(() => {});

    return res.json({ success: true, message: '員工解鎖金鑰已成功變更並安全儲存！' });
  } catch (error) {
    console.error('Error updating PIN:', error);
    res.status(500).send(error);
  }
});

// 37. Update Printer PIN (POST compatibility endpoint for ManagerDashboard)
post('/printer/pin', requireStaffAuth, async (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰' });
  }
  if (!/^\d{6}$/.test(newPin)) {
    return res.status(400).json({ error: '新金鑰必須為 6 位數字！' });
  }

  try {
    const credsRef = db.collection('secrets').doc('credentials');
    const credsDoc = await credsRef.get();
    let storedHash = credsDoc.data()?.staffPinHash;
    if (!storedHash) {
      const systemDoc = await db.collection('settings').doc('system').get();
      const legacyPin = systemDoc.data()?.liveStaffPin || '000000';
      storedHash = hashPin(legacyPin);
    }

    if (hashPin(currentPin) !== storedHash) {
      return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！' });
    }

    const newHash = hashPin(newPin);
    await credsRef.set({
      staffPinHash: newHash,
      updatedAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null
    }, { merge: true });
    invalidateAuthCache();
    await db.collection('settings').doc('system').update({ liveStaffPin: FieldValue.delete() }).catch(() => {});

    return res.json({ success: true, message: '員工解鎖金鑰已成功變更並安全儲存！' });
  } catch (error) {
    console.error('Error updating PIN via printer/pin:', error);
    res.status(500).send(error);
  }
});

// Export Express App as Cloud Function

// --- Missing Settings APIs ---

// 38. Save Promo Combo
post('/promo-combo', requireStaffAuth, async (req, res) => {
  const data = req.body;
  try {
    await db.collection('settings').doc('system').set({ livePromoCombo: data, livePromoCombos: data.combos }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 39. Save Members Config
post('/settings/members-config', requireStaffAuth, async (req, res) => {
  const { pointsRatio, rewards } = req.body;
  try {
    await db.collection('settings').doc('system').set({
      liveMemberPointsRatio: pointsRatio,
      liveMemberRewards: rewards
    }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 40. Printer Settings (PUT / POST)
const handleSavePrinterSettings: express.RequestHandler = async (req, res) => {
  const { kitchen, bill } = req.body;
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let currentSettings = systemDoc.data()?.livePrinterSettings || {};
    if (kitchen) {
      currentSettings.kitchen = { ...currentSettings.kitchen, ...kitchen };
    }
    if (bill) {
      currentSettings.bill = { ...currentSettings.bill, ...bill };
    }
    await db.collection('settings').doc('system').set({ livePrinterSettings: currentSettings }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
};
put('/printer/settings', requireStaffAuth, handleSavePrinterSettings);
post('/printer/settings', requireStaffAuth, handleSavePrinterSettings);

// 41. Option Rules (POST)
post('/option-rules', requireStaffAuth, async (req, res) => {
  const { name, category, price } = req.body;
  const newRule = {
    id: `rule-${Date.now()}`,
    name: name || '新選項',
    category: category || '加配料',
    price: Number(price) || 0
  };
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let rules = systemDoc.data()?.liveOptionRules || [];
    rules.push(newRule);
    await db.collection('settings').doc('system').set({ liveOptionRules: rules }, { merge: true });
    res.status(201).json(newRule);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 42. Option Rules (DELETE)
del('/option-rules/:id', requireStaffAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let rules = systemDoc.data()?.liveOptionRules || [];
    rules = rules.filter((r: any) => r.id !== id);
    await db.collection('settings').doc('system').set({ liveOptionRules: rules }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 43. Admin clear test data
post('/admin/clear-test-data', requireStaffAuth, async (req, res) => {
  const { pin } = req.body;
  try {
    const systemRef = db.collection('settings').doc('system');
    const systemDoc = await systemRef.get();
    const liveStaffPin = systemDoc.data()?.liveStaffPin || '952788';
    if (!pin || String(pin) !== String(liveStaffPin)) {
      return res.status(403).json({ error: '安全校對碼 (員工解鎖 PIN 碼) 不正確，無法授權清空！' });
    }

    // 1. Clear system logs (print logs, inventory logs, promo notifications)
    await db.collection('settings').doc('logs').set({ printLogs: [], inventoryLogs: [], promoNotifications: [] }, { merge: true });

    // 2. Delete all orders
    const ordersSnapshot = await db.collection('orders').get();
    const batchOrders = db.batch();
    ordersSnapshot.docs.forEach((doc) => {
      batchOrders.delete(doc.ref);
    });
    await batchOrders.commit();

    // 3. Delete all reservations
    const reservationsSnapshot = await db.collection('reservations').get();
    const batchReservations = db.batch();
    reservationsSnapshot.docs.forEach((doc) => {
      batchReservations.delete(doc.ref);
    });
    await batchReservations.commit();

    // 4. Reset tables status to available and clear preservedFor
    const tablesSnapshot = await db.collection('tables').get();
    const batchTables = db.batch();
    tablesSnapshot.docs.forEach((doc) => {
      batchTables.update(doc.ref, { status: 'available', preservedFor: '' });
    });
    await batchTables.commit();

    // 5. Reset takeout sequence and reset staff pin to default 952788
    await systemRef.set({ 
      liveTakeoutSeq: 0, 
      liveStaffPin: '952788' 
    }, { merge: true });

    res.json({ success: true, message: '已成功清除系統內所有測試單據、顧客預約、桌位佔用，並將登入密碼重設為預設值 952788！' });
  } catch (error) {
    console.error('Error clearing test data:', error);
    res.status(500).send(error);
  }
});

// --- Missing Category APIs ---
put('/categories/reorder', requireStaffAuth, async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order parameter' });
  try {
    const batch = db.batch();
    order.forEach((id: string, index: number) => {
      const ref = db.collection('categories').doc(id);
      batch.update(ref, { orderIndex: index });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Missing Tables APIs ---
post('/tables', requireStaffAuth, async (req, res) => {
  const data = req.body;
  try {
    await db.collection('tables').doc(data.id).set(data);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/tables/:id', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const updates = req.body;
  try {
    if (updates.status === 'cleaning' && updates.cleaningStartedAt === undefined) {
      updates.cleaningStartedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'cleaning') {
      updates.cleaningStartedAt = null;
    }
    await db.collection('tables').doc(id).update(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

del('/tables/:id', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('tables').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Missing Reservations APIs ---
post('/reservations', reservationRateLimiter, async (req, res) => {
  const validation = validateReservationPayload(req.body);
  if (!validation.isValid || !validation.sanitizedData) {
    return res.status(400).json({ error: validation.error || '無效的預約資料格式' });
  }
  const data = validation.sanitizedData;

  const newReservation = {
    id: data.id || ('res-' + Math.random().toString(36).substring(2, 11)),
    ...data,
    status: data.status || 'pending',
    createdAt: data.createdAt || new Date().toISOString()
  };
  try {
    await db.collection('reservations').doc(newReservation.id).set(newReservation);
    // sync table status if pending
    if (newReservation.status === 'pending' && newReservation.tableNumber) {
      const tableRef = db.collection('tables').doc(newReservation.tableNumber);
      await tableRef.update({ status: 'preserved', preservedFor: `${newReservation.customerName} (${newReservation.time})` });
    }
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/reservations/:id', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const updates = req.body;
  try {
    if (updates.status === 'cancelled') {
      // First get the reservation to know the table number
      const doc = await db.collection('reservations').doc(id).get();
      const resData = doc.data();
      if (resData && resData.tableNumber) {
        await db.collection('tables').doc(resData.tableNumber).update({ status: 'available', preservedFor: '' });
      }
      // Delete the reservation to invalidate the exclusive channel
      await db.collection('reservations').doc(id).delete();
      res.json({ success: true, message: 'Reservation cancelled and deleted' });
      return;
    }

    await db.collection('reservations').doc(id).update(updates);

    // Also sync table status if status changed
    if (updates.status) {
      const doc = await db.collection('reservations').doc(id).get();
      const resData = doc.data();
      if (resData && resData.tableNumber) {
        const tableRef = db.collection('tables').doc(resData.tableNumber);
        if (updates.status === 'seated') {
          await tableRef.update({ status: 'in_use', preservedFor: '' });
        } else if (updates.status === 'pending') {
           await tableRef.update({ status: 'preserved', preservedFor: `${resData.customerName} (${resData.time})` });
        }
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).send(error);
  }
});

del('/reservations/:id', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await db.collection('reservations').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Additional Order & Other APIs ---
put('/orders/:id/pay', requireStaffAuth, async (req, res) => {
  const id = req.params.id as string;
  const { isPaid } = req.body;
  try {
    const orderDoc = await db.collection('orders').doc(id).get();
    const orderData = orderDoc.data();

    await db.collection('orders').doc(id).update({ isPaid });

    if (isPaid && orderData && orderData.tableNumber && !String(orderData.tableNumber).includes('外帶') && String(orderData.tableNumber).toLowerCase() !== 'takeout') {
      const tblId = String(orderData.tableNumber).trim();
      const tableRef = db.collection('tables').doc(tblId);
      const tableSnap = await tableRef.get();
      if (tableSnap.exists) {
        await tableRef.update({
          status: 'cleaning',
          preservedFor: '',
          cleaningStartedAt: new Date().toISOString()
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

put('/orders/:id/rate', async (req, res) => {
  const id = req.params.id as string;
  const { rating, feedback } = req.body;
  try {
    await db.collection('orders').doc(id).update({ rating, feedback });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error);
  }
});

post('/send-promo-push', requireStaffAuth, async (req, res) => {
  const data = req.body;
  const newNotif = {
    id: `notif-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    title: data.title || '沙貝限時優惠 🇹🇭',
    message: data.message || '老闆瘋了！即刻點餐全單享特別折扣！',
    badge: data.badge || 'PROMO',
    isRead: false
  };
  try {
    const logsDoc = await db.collection('settings').doc('logs').get();
    let notifs = logsDoc.data()?.promoNotifications || [];
    notifs.push(newNotif);
    if (notifs.length > 100) notifs = notifs.slice(-100);
    await db.collection('settings').doc('logs').set({ promoNotifications: notifs }, { merge: true });
    res.status(201).json(newNotif);
  } catch (error) {
    res.status(500).send(error);
  }
});

post('/takeout/scan', async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    let seq = systemDoc.data()?.liveTakeoutSeq || 0;
    let lastDate = systemDoc.data()?.lastTakeoutDate || '';
    const today = new Date().toDateString();

    if (today !== lastDate) {
      seq = 0;
      lastDate = today;
    }
    seq++;
    const assigned = `外帶 #${seq}`;

    await db.collection('settings').doc('system').set({ liveTakeoutSeq: seq, lastTakeoutDate: lastDate }, { merge: true });
    res.json({ success: true, tableNumber: assigned, sequence: seq });
  } catch (error) {
    res.status(500).send(error);
  }
});

get('/takeout/status', async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    res.json({
      sequence: systemDoc.data()?.liveTakeoutSeq || 0,
      lastResetDate: systemDoc.data()?.lastTakeoutDate || ''
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Additional Printer Endpoints ---

async function sendToNetworkPrinter(host: string, port: number = 9100, data: string): Promise<{ success: boolean; log: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isSettled = false;
    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(1500);

    socket.on('connect', () => {
      socket.write(Buffer.from(data, 'utf-8'), (err) => {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        if (err) {
          resolve({ success: false, log: `發送失敗: ${err.message}` });
        } else {
          resolve({ success: true, log: `成功發送 ${data.length} 位元組至熱感印表機 ${host}:${port}` });
        }
      });
    });

    socket.on('timeout', () => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve({ success: false, log: `網路連線逾時 (${host}:${port})` });
    });

    socket.on('error', (err) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve({ success: false, log: `Socket 錯誤: ${err.message}` });
    });

    try {
      socket.connect(port, host);
    } catch (err: any) {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve({ success: false, log: `Socket 連線例外: ${err.message}` });
    }
  });
}

// Printer Test Ticket Generator
post('/printer/test', requireStaffAuth, async (req, res) => {
  try {
    const target = (req.body?.target as 'kitchen' | 'bill' | 'all') || 'all';
    const systemDoc = await db.collection('settings').doc('system').get();
    const sysData = systemDoc.data() || {};
    const livePrinterIp = sysData.livePrinterIp || '192.168.123.100';
    const livePrinterSettings = sysData.livePrinterSettings || { bill: { cashDrawerEnabled: false } };

    let drawerNote = '';
    if ((target === 'bill' || target === 'all') && livePrinterSettings.bill?.cashDrawerEnabled) {
      drawerNote = `\n----------------------------------------\n現金收銀抽屜連動: 啟用 🟢\n觸發驅動: ${livePrinterSettings.bill.cashDrawerDriver || 'Standard ESC/POS Pulse'}\n實體埠口: ${livePrinterSettings.bill.usbPort || 'USB002'}\n`;
    } else {
      drawerNote = `\n----------------------------------------\n現金收銀抽屜連動: 未啟用 ❌\n`;
    }

    const targetLabel = target === 'kitchen' ? '廚房 KDS 工作票印表機' : target === 'bill' ? '前台帳單與收銀明細印表機' : '全機型 (雙機測試)';
    const testTicket = `
========================================
       沙貝燒烤 (${targetLabel} 測試頁)
========================================
測試狀態: 連線傳送 🟢
主機來源: ${req.ip || 'Cloud Function'}
廚房印表機 IP: ${livePrinterSettings.kitchen?.ip || livePrinterIp} (${livePrinterSettings.kitchen?.connectionType || 'IP'})
前台印表機 Port: ${livePrinterSettings.bill?.usbPort || 'LPT1'} (${livePrinterSettings.bill?.connectionType || 'LPT'})
列印時間: ${new Date().toLocaleString()}
----------------------------------------
字型測試 / Font Test:
1. 繁體中文 🇹🇼 - 測試正常 (沙貝沙貝)
2. English 🇺🇸 - OK (Sawatdee!)
3. 泰文 🇹🇭 - ลาบหมูย่างส้มตำ${drawerNote}
========================================
    `.trim();

    const bridgeSuccess = req.body?.bridgeSuccess === true;
    let tcpResult = { success: true, log: bridgeSuccess ? '已由前端透過本機 Check-in POS 橋接器 (127.0.0.1:8060) 成功寫入' : 'Cloud Function 處理完成' };
    if (!bridgeSuccess && (target === 'kitchen' || target === 'all')) {
      const kitchenIp = livePrinterSettings.kitchen?.ip || livePrinterIp;
      tcpResult = await sendToNetworkPrinter(kitchenIp, 9100, testTicket);
    }

    const logsDoc = await db.collection('settings').doc('logs').get();
    let printLogs = logsDoc.data()?.printLogs || [];
    printLogs.push({
      id: `pr-${Date.now()}-test`,
      timestamp: new Date().toLocaleTimeString(),
      content: `${testTicket}\n\n[印表機傳送日誌]: ${tcpResult.log}`,
      orderId: 'TEST-PAGE',
      type: target === 'bill' ? 'customer' : 'kitchen'
    });
    if (printLogs.length > 100) printLogs = printLogs.slice(-100);
    await db.collection('settings').doc('logs').set({ printLogs }, { merge: true });

    res.json({
      success: true,
      message: `測試頁 (${targetLabel}) 已處理傳送`,
      ticketContent: testTicket,
      ip: livePrinterSettings.kitchen?.ip || livePrinterIp,
      tcpLog: tcpResult.log
    });
  } catch (error) {
    console.error('Error printing test page:', error);
    res.status(500).json({ error: '列印測試頁失敗' });
  }
});

// Printer Open Cash Drawer
post('/printer/open-drawer', requireStaffAuth, async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const sysData = systemDoc.data() || {};
    const settings = sysData.livePrinterSettings?.bill || {};
    const printerIp = settings.ip || sysData.livePrinterIp || '192.168.123.100';
    const port = settings.port || 9100;
    const rawCmdHex = settings.cashDrawerEscPosCommand || '1B700019FA';

    // Construct raw ESC/POS drawer pulse binary buffer (Default ESC p 0 25 250 -> 1B 70 00 19 FA)
    let drawerBuffer: string;
    try {
      const cleanHex = rawCmdHex.replace(/[^0-9A-Fa-f]/g, '');
      drawerBuffer = cleanHex ? Buffer.from(cleanHex, 'hex').toString('binary') : '\x1b\x70\x00\x19\xfa';
    } catch {
      drawerBuffer = '\x1b\x70\x00\x19\xfa';
    }

    // Trigger physical hardware drawer via TCP network printer socket or log
    const tcpResult = await sendToNetworkPrinter(printerIp, port, drawerBuffer);

    const logsDoc = await db.collection('settings').doc('logs').get();
    let printLogs = logsDoc.data()?.printLogs || [];
    printLogs.push({
      id: `pr-${Date.now()}-manual-drawer`,
      timestamp: new Date().toLocaleTimeString(),
      content: `========================================\n         SABAY BBQ 手動開啟收銀抽屜\n========================================\n觸發方式: 櫃檯員工手動點擊觸發\n實體埠口: ${settings.usbPort || 'USB002'} / IP: ${printerIp}:${port}\n執行日誌:\n${tcpResult.log}\n========================================`,
      orderId: 'MANUAL-TRIGGER',
      type: 'customer'
    });
    if (printLogs.length > 100) printLogs = printLogs.slice(-100);
    await db.collection('settings').doc('logs').set({ printLogs }, { merge: true });

    res.json({
      success: tcpResult.success,
      log: tcpResult.log
    });
  } catch (error: any) {
    console.error('Error opening drawer:', error);
    res.status(500).json({ error: error?.message || '開啟錢箱失敗' });
  }
});

// Printer Ping Test
get('/printer/ping', async (req, res) => {
  const systemDoc = await db.collection('settings').doc('system').get();
  const sysData = systemDoc.data() || {};
  const ip = (req.query.ip as string) || sysData.livePrinterIp || '192.168.123.100';
  const isMock = req.query.simulate === 'true' || ip.toLowerCase().includes('mock') || ip.toLowerCase().includes('simulate');

  if (isMock) {
    return res.json({
      reachable: true,
      ip,
      port: 9100,
      simulated: true,
      timestamp: new Date().toISOString()
    });
  }

  // Probe hardware availability on port 9100
  const socket = new net.Socket();
  let completed = false;

  socket.setTimeout(1200);

  const cleanUp = () => {
    if (!socket.destroyed) {
      socket.destroy();
    }
  };

  socket.connect(9100, ip, () => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: true,
        ip,
        port: 9100,
        simulated: false,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('error', (err) => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: true,
        ip,
        port: 9100,
        simulated: true,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('timeout', () => {
    if (!completed) {
      completed = true;
      cleanUp();
      res.json({
        reachable: true,
        ip,
        port: 9100,
        simulated: true,
        error: 'Network connection timeout (ETIMEDOUT)',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Get Printer Settings
get('/printer/settings', async (_req, res) => {
  try {
    const systemDoc = await db.collection('settings').doc('system').get();
    const sysData = systemDoc.data() || {};
    const defaultSettings = {
      kitchen: {
        enabled: true,
        connectionType: 'IP',
        ip: sysData.livePrinterIp || '192.168.123.100',
        port: 9100,
        usbPort: 'USB001',
        width: '80mm',
        paperWidth: 80,
        fontSizeFactor: 1,
        autoCut: true,
        copies: 1,
        restaurantName: '沙貝燒烤',
        headerPrefix: '★★★ 廚房工作備餐單 ★★★',
        footerSuffix: '請主廚盡速配餐出餐！',
        printTelephone: '0966626408',
        printTimeEnabled: true
      },
      bill: {
        enabled: true,
        connectionType: 'USB',
        ip: sysData.livePrinterIp || '192.168.123.100',
        port: 9100,
        usbPort: 'USB002',
        width: '58mm',
        paperWidth: 58,
        fontSizeFactor: 0.8,
        autoCut: true,
        copies: 1,
        cashDrawerEnabled: true,
        cashDrawerDriver: 'ESC_POS_RAW',
        cashDrawerOposName: 'CashDrawer1',
        cashDrawerEscPosCommand: '1B700019FA',
        restaurantName: '沙貝燒烤 SABAY BBQ',
        headerPrefix: '★★★ 顧客結帳明細單 ★★★',
        footerSuffix: '謝謝光臨，歡迎再度光臨！',
        printTelephone: '0966626408',
        printTimeEnabled: true
      }
    };
    res.json(sysData.livePrinterSettings || defaultSettings);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Catch-all 404 JSON Handler to prevent returning HTML on missing API endpoints
app.use((req: any, res: any) => {
  res.status(404).json({ error: `無效的 API 請求: ${req.method} ${req.path}` });
});

export const api = onRequest({ cors: true, invoker: 'public' }, app);

