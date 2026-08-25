"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMenuRoutes = registerMenuRoutes;
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
function registerMenuRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    post('/images/upload', requireStaffAuth, async (req, res) => {
        try {
            const validation = (0, validators_1.validateImageUploadPayload)(req.body);
            if (!validation.isValid || !validation.sanitizedData) {
                return res.status(400).json({ error: validation.error || 'Missing or invalid image data' });
            }
            const { base64Clean, mime, cleanExt, targetFolder, targetFilename: rawFilename } = validation.sanitizedData;
            const buffer = Buffer.from(base64Clean, 'base64');
            if (buffer.length > 10 * 1024 * 1024) {
                return res.status(400).json({ error: '圖片大小超出 10MB 上限 (Max 10MB)' });
            }
            const nameWithoutExt = rawFilename.replace(/\.[^/.]+$/, '');
            const versionedFilename = `${nameWithoutExt}-${Date.now()}.${cleanExt}`;
            const targetPath = `${targetFolder}/${versionedFilename}`;
            const file = storageBucket.file(targetPath);
            await file.save(buffer, {
                metadata: {
                    contentType: mime,
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
                size: buffer.length,
                contentType: mime
            });
        }
        catch (error) {
            console.error('[Cloud Functions Storage Upload Error]:', error);
            res.status(500).json({ error: 'Failed to upload image to storage', details: error?.message });
        }
    });
    get('/categories', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
            const nowMs = Date.now();
            if (helpers_1.cachedCategories && (nowMs - helpers_1.cachedCategories.timestamp < helpers_1.CACHE_TTL_MS)) {
                return res.json(helpers_1.cachedCategories.data);
            }
            const snapshot = await db.collection('categories').select('id', 'name', 'showOnCustomerPage', 'orderIndex').orderBy('orderIndex').get();
            const categories = snapshot.docs.map(doc => doc.data());
            (0, helpers_1.setCachedCategories)({ data: categories, timestamp: nowMs });
            res.json(categories);
        }
        catch (error) {
            console.error('Error fetching categories:', error);
            sendErrorResponse(res, error);
        }
    });
    get('/menu', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=120, stale-while-revalidate=300');
            const nowMs = Date.now();
            if (helpers_1.cachedMenu && (nowMs - helpers_1.cachedMenu.timestamp < helpers_1.CACHE_TTL_MS)) {
                return res.json(helpers_1.cachedMenu.data);
            }
            const now = new Date();
            const snapshot = await db.collection('menu').select('id', 'category', 'name', 'price', 'image', 'description', 'available', 'isAvailable', 'isSetMeal', 'requiredSaucesOption', 'hasNoodlesOption', 'hasCoconutsMilkOption', 'containsBeef', 'containsPork', 'containsSeafood', 'isNotSpicy', 'customAddOns', 'recipe', 'orderIndex', 'isTakeoutAvailable', 'soldOutAt').orderBy('orderIndex').get();
            const items = snapshot.docs.map(doc => {
                const d = doc.data();
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
            const processedItems = items.map((item) => {
                const processed = (0, helpers_1.processMenuItemSoldOut)(item, now);
                delete processed._docId;
                return processed;
            });
            (0, helpers_1.setCachedMenu)({ data: processedItems, timestamp: nowMs });
            res.json(processedItems);
        }
        catch (error) {
            console.error('Error fetching menu:', error);
            sendErrorResponse(res, error);
        }
    });
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
        }
        catch (error) {
            console.error('Error creating menu:', error);
            sendErrorResponse(res, error);
        }
    });
    put('/menu/reorder', requireStaffAuth, async (req, res) => {
        const { order } = req.body;
        if (!Array.isArray(order))
            return res.status(400).json({ error: 'Invalid order parameter' });
        try {
            const batch = db.batch();
            order.forEach((id, index) => {
                const ref = db.collection('menu').doc(id);
                batch.update(ref, { orderIndex: index });
            });
            await batch.commit();
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
    put('/menu/:id', requireStaffAuth, async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            if (data.available !== undefined) {
                if (data.available === false && !data.soldOutAt) {
                    data.soldOutAt = new Date().toISOString();
                }
                else if (data.available === true) {
                    data.soldOutAt = null;
                }
            }
            await db.collection('menu').doc(id).set(data, { merge: true });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error updating menu:', error);
            sendErrorResponse(res, error);
        }
    });
    del('/menu/:id', requireStaffAuth, async (req, res) => {
        try {
            const id = req.params.id;
            await db.collection('menu').doc(id).delete();
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting menu:', error);
            sendErrorResponse(res, error);
        }
    });
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
        }
        catch (error) {
            console.error('Error toggling menu availability in Cloud Functions:', error);
            return res.status(500).json({ error: error?.message || 'Server error' });
        }
    });
    post('/categories', requireStaffAuth, async (req, res) => {
        try {
            const data = req.body;
            const docRef = await db.collection('categories').add(data);
            res.json({ id: docRef.id });
        }
        catch (error) {
            console.error('Error creating category:', error);
            sendErrorResponse(res, error);
        }
    });
    put('/categories/:id', requireStaffAuth, async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            await db.collection('categories').doc(id).set(data, { merge: true });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error updating category:', error);
            sendErrorResponse(res, error);
        }
    });
    del('/categories/:id', requireStaffAuth, async (req, res) => {
        try {
            const id = req.params.id;
            await db.collection('categories').doc(id).delete();
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting category:', error);
            sendErrorResponse(res, error);
        }
    });
    put('/categories/reorder', requireStaffAuth, async (req, res) => {
        const { order } = req.body;
        if (!Array.isArray(order))
            return res.status(400).json({ error: 'Invalid order parameter' });
        try {
            const batch = db.batch();
            order.forEach((id, index) => {
                const ref = db.collection('categories').doc(id);
                batch.update(ref, { orderIndex: index });
            });
            await batch.commit();
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=menu.js.map