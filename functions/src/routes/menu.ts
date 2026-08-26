import express from 'express';
import sharp from 'sharp';
import { Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import * as net from 'net';
import * as crypto from 'crypto';
import { hashPin, invalidateAuthCache } from '../auth';
import { validateOrderPayload, validateReservationPayload, validateImageUploadPayload, sanitizeString } from '../validators';
import { cachedMenu, cachedCategories, setCachedMenu, setCachedCategories, CACHE_TTL_MS, processMenuItemSoldOut } from '../helpers';

// ============================================================
// MENU 路由模組
// ============================================================

type RouteRegister = (path: string, ...handlers: express.RequestHandler[]) => void;

export interface RouteContext {
  db: Firestore;
  storageBucket: Bucket;
  requireStaffAuth: express.RequestHandler;
  createRateLimiter: (max: number, windowMs: number, name: string) => express.RequestHandler;
  sendErrorResponse: (res: express.Response, error: any, ctx?: string) => void;
}

export function registerMenuRoutes(app: express.Application, ctx: RouteContext) {
  const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;

  // 雙路徑路由包裝器
  const get: RouteRegister = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post: RouteRegister = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
  const put: RouteRegister = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
  const del: RouteRegister = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);

  // 1. Upload Image to Google Cloud Storage
  post('/images/upload', requireStaffAuth, async (req, res) => {
    try {
      const validation = validateImageUploadPayload(req.body);
      if (!validation.isValid || !validation.sanitizedData) {
        return res.status(400).json({ error: validation.error || 'Missing or invalid image data' });
      }

      const { base64Clean, mime, cleanExt, targetFolder, targetFilename: rawFilename } = validation.sanitizedData;
      const buffer = Buffer.from(base64Clean, 'base64');
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: '圖片大小超出 10MB 上限 (Max 10MB)' });
      }

      // 🚀 使用 sharp 自動產生 WebP 縮圖並限制寬度為 800px
      const webpBuffer = await sharp(buffer)
        .resize(800, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // 🚀 加入版本時間戳避免 CDN 同名覆蓋快取陳舊
      const nameWithoutExt = rawFilename.replace(/\.[^/.]+$/, '');
      const versionedFilename = `${nameWithoutExt}-${Date.now()}.webp`;
      const targetPath = `${targetFolder}/${versionedFilename}`;
      const file = storageBucket.file(targetPath);
      await file.save(webpBuffer, {
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000, immutable'
        },
        resumable: false
      });

      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(targetPath)}?alt=media`;
      return res.json({
        success: true,
        url: publicUrl,
        path: targetPath,
        filename: versionedFilename,
        size: webpBuffer.length,
        contentType: 'image/webp'
      });
    } catch (error: any) {
      console.error('[Cloud Functions Storage Upload Error]:', error);
      res.status(500).json({ error: 'Failed to upload image to storage', details: error?.message });
    }
  });

  // 2. Get Categories
  get('/categories', async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
      
      const nowMs = Date.now();
      if (cachedCategories && (nowMs - cachedCategories.timestamp < CACHE_TTL_MS)) {
        return res.json(cachedCategories.data);
      }

      const snapshot = await db.collection('categories').select('id', 'name', 'showOnCustomerPage', 'orderIndex').orderBy('orderIndex').get();
      const categories = snapshot.docs.map(doc => doc.data());
      
      setCachedCategories({ data: categories, timestamp: nowMs });
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      sendErrorResponse(res, error);
    }
  });

  // 3. Get Menu
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

      setCachedMenu({ data: processedItems, timestamp: nowMs });
      res.json(processedItems);
    } catch (error) {
      console.error('Error fetching menu:', error);
      sendErrorResponse(res, error);
    }
  });

  // 4. Create Menu Item
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
      sendErrorResponse(res, error);
    }
  });

  // 5. Reorder Menu
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
      sendErrorResponse(res, error);
    }
  });

  // 6. Update Menu Item
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
      sendErrorResponse(res, error);
    }
  });

  // 7. Delete Menu Item
  del('/menu/:id', requireStaffAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      await db.collection('menu').doc(id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting menu:', error);
      sendErrorResponse(res, error);
    }
  });

  // 8. Toggle Menu Availability (設為沽清 / 恢復販售)
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

  // 9. Create Category
  post('/categories', requireStaffAuth, async (req, res) => {
    try {
      const data = req.body;
      const docRef = await db.collection('categories').add(data);
      res.json({ id: docRef.id });
    } catch (error) {
      console.error('Error creating category:', error);
      sendErrorResponse(res, error);
    }
  });

  // 10. Update Category
  put('/categories/:id', requireStaffAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const data = req.body;
      await db.collection('categories').doc(id).set(data, { merge: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating category:', error);
      sendErrorResponse(res, error);
    }
  });

  // 11. Delete Category
  del('/categories/:id', requireStaffAuth, async (req, res) => {
    try {
      const id = req.params.id as string;
      await db.collection('categories').doc(id).delete();
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting category:', error);
      sendErrorResponse(res, error);
    }
  });

  // 12. Reorder Categories
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
      sendErrorResponse(res, error);
    }
  });
}
