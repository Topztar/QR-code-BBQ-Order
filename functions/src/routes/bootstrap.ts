import express from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import * as crypto from 'crypto';
import { processMenuItemSoldOut, isStoreOpenFromData } from '../helpers';

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
      res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=180, stale-while-revalidate=600');
      const todayStr = new Date().toISOString().split('T')[0];
      const isStaffRequest = req.query.role === 'staff' || !!req.headers.authorization;
      
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
          description: d.description ?? { zh: '' },
          available: !!d.available,
          isAvailable: d.isAvailable,
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
        isFirebaseSyncEnabled: true
      };

      // 🚀 ETag 快取協商 (304 Not Modified): 減少重複序列化與頻寬消耗
      const rawString = JSON.stringify(responsePayload);
      const etag = `W/"${crypto.createHash('md5').update(rawString).digest('hex').substring(0, 16)}"`;

      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      res.json(responsePayload);
    } catch (error) {
      console.error('Error fetching bootstrap data:', error);
      sendErrorResponse(res, error);
    }
  });
}
