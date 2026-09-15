import express from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import * as crypto from 'crypto';
import { processMenuItemSoldOut, isStoreOpenFromData } from '../helpers';
import { getStoredActiveToken } from '../auth';

// ============================================================
// BOOTSTRAP 路由模組
// ============================================================

type RouteRegister = (path: string, ...handlers: express.RequestHandler[]) => void;

export interface RouteContext {
  db: Firestore;
  storageBucket: Bucket;
  requireStaffAuth: express.RequestHandler;
  createRateLimiter: (max: number, windowMs: number, name: string) => express.RequestHandler;
  sendErrorResponse: (res: express.Response, error: any, ctx?: string) => void;
}

let cachedPublicBootstrap: { payload: any; etag: string; timestamp: number } | null = null;
const BOOTSTRAP_CACHE_TTL_MS = 180 * 1000; // 3 minutes in-memory TTL to eliminate read storms

/**
 * ⚡ 主動清除公開 Bootstrap 快取
 * 當管理員新增/修改/刪除菜單品項、分類、桌位或營業設定時調用
 */
export function invalidatePublicBootstrapCache() {
  cachedPublicBootstrap = null;
}

export function registerBootstrapRoutes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
  const _storageBucket = storageBucket; // alias for unused var
  const _createRateLimiter = createRateLimiter; // alias for unused var

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

  get('/bootstrap', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=180, stale-while-revalidate=600');
      const todayStr = new Date().toISOString().split('T')[0];
      
      let isStaffRequest = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1]?.trim();
        if (token) {
          const storedAuth = await getStoredActiveToken(db);
          if (storedAuth && storedAuth.token === token && Date.now() <= storedAuth.expiresAt) {
            isStaffRequest = true;
          }
        }
      }

      const nowMs = Date.now();
      if (!isStaffRequest && cachedPublicBootstrap && (nowMs - cachedPublicBootstrap.timestamp < BOOTSTRAP_CACHE_TTL_MS)) {
        res.setHeader('ETag', cachedPublicBootstrap.etag);
        if (req.headers['if-none-match'] === cachedPublicBootstrap.etag) {
          return res.status(304).end();
        }
        return res.json(cachedPublicBootstrap.payload);
      }
      
      const [
        categoriesSnap,
        menuSnap,
        tablesSnap,
        systemDoc,
        ingredientsSnap,
        reservationsSnap
      ] = await Promise.all([
        db.collection('categories').select('id', 'name', 'showOnCustomerPage', 'orderIndex').orderBy('orderIndex').get(),
        db.collection('menu').select('id', 'category', 'name', 'price', 'image', 'thumbnailUrl', 'avifUrl', 'avifThumbnailUrl', 'description', 'available', 'isAvailable', 'isSetMeal', 'requiredSaucesOption', 'hasNoodlesOption', 'hasCoconutsMilkOption', 'containsBeef', 'containsPork', 'containsSeafood', 'isNotSpicy', 'customAddOns', 'recipe', 'orderIndex', 'isTakeoutAvailable', 'soldOutAt', 'soldOutType', 'soldOutDate').orderBy('orderIndex').get(),
        db.collection('tables').select('id', 'qrCodeUrl', 'status', 'cleaningStartedAt', 'maxCapacity', 'positionX', 'positionY', 'preservedFor', 'mergedWith').get(),
        db.collection('settings').doc('system').get(),
        isStaffRequest 
          ? db.collection('ingredients').select('id', 'name', 'stock', 'minThreshold', 'unit').get()
          : Promise.resolve({ docs: [] }),
        isStaffRequest
          ? db.collection('reservations').select('id', 'customerName', 'phone', 'notes', 'createdAt', 'guestCount', 'tableNumber', 'date', 'time', 'status', 'reservationNo').where('date', '>=', todayStr).limit(100).get()
          : Promise.resolve({ docs: [] })
      ]);

      const now = new Date();
      const items = menuSnap.docs.map(doc => {
        const d = doc.data() as any;
        return {
          id: d.id ?? doc.id,
          category: d.category ?? 'uncategorized',
          name: d.name ?? { zh: '' },
          price: typeof d.price === 'number' ? d.price : 0,
          image: d.image ?? '',
          thumbnailUrl: d.thumbnailUrl ?? '',
          avifUrl: d.avifUrl ?? '',
          avifThumbnailUrl: d.avifThumbnailUrl ?? '',
          description: d.description ?? { zh: '' },
          available: !!d.available,
          isAvailable: d.isAvailable,
          soldOutType: d.soldOutType || (d.available ? 'none' : 'permanent'),
          soldOutDate: d.soldOutDate ?? null,
          isSetMeal: !!d.isSetMeal,
          requiredSaucesOption: !!d.requiredSaucesOption,
          hasNoodlesOption: !!d.hasNoodlesOption,
          hasCoconutsMilkOption: !!d.hasCoconutsMilkOption,
          containsBeef: !!d.containsBeef,
          containsPork: !!d.containsPork,
          containsSeafood: !!d.containsSeafood,
          isNotSpicy: !!d.isNotSpicy,
          customAddOns: d.customAddOns ?? [],
          recipe: d.recipe ?? [],
          orderIndex: typeof d.orderIndex === 'number' ? d.orderIndex : 0,
          isTakeoutAvailable: d.isTakeoutAvailable !== false,
          soldOutAt: d.soldOutAt ?? null,
          _docId: doc.id
        };
      });

      const processedItems = items.map((item: any) => {
        const processed = processMenuItemSoldOut(item, now);
        delete processed._docId;
        return processed;
      });

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

      const responsePayload = {
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
          vipThreshold: sysData.liveMemberVipThreshold ?? 1000,
          vipDiscountRate: sysData.liveMemberVipDiscountRate ?? 0.9,
          enablePointsDiscount: sysData.liveMemberEnablePointsDiscount ?? true,
          pointsRedeemRate: sysData.liveMemberPointsRedeemRate ?? 1,
          rewards: sysData.liveMemberRewards || []
        },
        servicePaused: { servicePaused: sysData.liveServicePaused || false },
        printerConfig: { ip: sysData.livePrinterIp || '192.168.123.100' },
        ingredients: ingredientsSnap.docs.map(doc => doc.data()),
        reservations: reservationsSnap.docs.map(doc => doc.data()),
        version: sysData.liveSystemVersion || sysData.version || '1.0.1',
        isFirebaseSyncEnabled: true
      };

      // 🚀 ETag 快取協商 (304 Not Modified): 減少重複序列化與頻寬消耗
      const rawString = JSON.stringify(responsePayload);
      const etag = `W/"${crypto.createHash('md5').update(rawString).digest('hex').substring(0, 16)}"`;

      if (!isStaffRequest) {
        cachedPublicBootstrap = {
          payload: responsePayload,
          etag,
          timestamp: Date.now()
        };
      }

      res.setHeader('ETag', etag);
      res.setHeader('Vary', 'Authorization');
      
      if (isStaffRequest) {
        res.setHeader('Cache-Control', 'private, max-age=0, no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=180, stale-while-revalidate=600');
      }

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      res.json(responsePayload);
    } catch (error) {
      console.error('Error fetching bootstrap data:', error);
      sendErrorResponse(res, error);
    }
  });

  // ============================================================
  // ⚡ 修正 3：即時動態營運狀態端點 (/api/store-status)
  // 解耦 CDN 靜態長效快取與動態高急迫性營運狀態 (售罄/暫停接單/營業開關)
  // Cache-Control: no-cache, no-store, must-revalidate (杜絕顧客因 CDN 快取延遲點到售罄餐點)
  // ============================================================
  get('/store-status', async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const now = new Date();
      const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);

      const [systemDoc, soldOutMenuSnap] = await Promise.all([
        db.collection('settings').doc('system').get(),
        db.collection('menu')
          .select('available', 'isAvailable', 'soldOutType', 'soldOutDate')
          .get()
      ]);

      const sysData = systemDoc.data() || {};
      const isOpen = isStoreOpenFromData(sysData);
      const servicePaused = !!sysData.liveServicePaused;

      // 提取目前真實售罄的品項 ID 清單
      const soldOutItemIds: string[] = [];
      for (const doc of soldOutMenuSnap.docs) {
        const d = doc.data() as any;
        let isAvailable = d.available ?? true;
        if (d.soldOutType === 'permanent') {
          isAvailable = false;
        } else if (d.soldOutType === 'daily') {
          if (d.soldOutDate === todayStr) {
            isAvailable = false;
          } else {
            isAvailable = true;
          }
        }
        if (!isAvailable) {
          soldOutItemIds.push(doc.id);
        }
      }

      res.json({
        isOpen,
        servicePaused,
        soldOutItemIds,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching real-time store status:', error);
      sendErrorResponse(res, error);
    }
  });
}

