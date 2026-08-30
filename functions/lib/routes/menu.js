"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAndSaveImage = processAndSaveImage;
exports.registerMenuRoutes = registerMenuRoutes;
const sharp_1 = __importDefault(require("sharp"));
const busboy_1 = __importDefault(require("busboy"));
const validators_1 = require("../validators");
const helpers_1 = require("../helpers");
async function processAndSaveImage(buffer, targetFolder, rawFilename, storageBucket) {
    if (buffer.length > 10 * 1024 * 1024) {
        throw new Error('圖片大小超出 10MB 上限 (Max 10MB)');
    }
    const timestamp = Date.now();
    const nameWithoutExt = rawFilename.replace(/\.[^/.]+$/, '');
    const cleanFolder = targetFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'dishes';
    const versionedFilename = `${nameWithoutExt}-${timestamp}.webp`;
    const thumbFilename = `${nameWithoutExt}-${timestamp}-thumb.webp`;
    const avifFilename = `${nameWithoutExt}-${timestamp}.avif`;
    const thumbAvifFilename = `${nameWithoutExt}-${timestamp}-thumb.avif`;
    const targetPath = `${cleanFolder}/${versionedFilename}`;
    const thumbTargetPath = `${cleanFolder}/${thumbFilename}`;
    const avifTargetPath = `${cleanFolder}/${avifFilename}`;
    const thumbAvifTargetPath = `${cleanFolder}/${thumbAvifFilename}`;
    const [webpBuffer, thumbWebpBuffer, avifBuffer, thumbAvifBuffer] = await Promise.all([
        (0, sharp_1.default)(buffer)
            .resize(800, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer(),
        (0, sharp_1.default)(buffer)
            .resize(200, 200, { fit: 'cover' })
            .webp({ quality: 70 })
            .toBuffer(),
        (0, sharp_1.default)(buffer)
            .resize(800, null, { withoutEnlargement: true })
            .avif({ quality: 75, effort: 4 })
            .toBuffer(),
        (0, sharp_1.default)(buffer)
            .resize(200, 200, { fit: 'cover' })
            .avif({ quality: 65, effort: 4 })
            .toBuffer()
    ]);
    const webpMetadata = {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable'
    };
    const avifMetadata = {
        contentType: 'image/avif',
        cacheControl: 'public, max-age=31536000, immutable'
    };
    const file = storageBucket.file(targetPath);
    const thumbFile = storageBucket.file(thumbTargetPath);
    const avifFile = storageBucket.file(avifTargetPath);
    const thumbAvifFile = storageBucket.file(thumbAvifTargetPath);
    await Promise.all([
        file.save(webpBuffer, { metadata: webpMetadata, resumable: false }),
        thumbFile.save(thumbWebpBuffer, { metadata: webpMetadata, resumable: false }),
        avifFile.save(avifBuffer, { metadata: avifMetadata, resumable: false }),
        thumbAvifFile.save(thumbAvifBuffer, { metadata: avifMetadata, resumable: false })
    ]);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(targetPath)}?alt=media`;
    const publicThumbUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(thumbTargetPath)}?alt=media`;
    const publicAvifUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(avifTargetPath)}?alt=media`;
    const publicThumbAvifUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(thumbAvifTargetPath)}?alt=media`;
    return {
        success: true,
        url: publicUrl,
        thumbnailUrl: publicThumbUrl,
        avifUrl: publicAvifUrl,
        avifThumbnailUrl: publicThumbAvifUrl,
        path: targetPath,
        thumbPath: thumbTargetPath,
        avifPath: avifTargetPath,
        thumbAvifPath: thumbAvifTargetPath,
        filename: versionedFilename,
        size: webpBuffer.length,
        thumbSize: thumbWebpBuffer.length,
        avifSize: avifBuffer.length,
        thumbAvifSize: thumbAvifBuffer.length,
        contentType: 'image/webp'
    };
}
function registerMenuRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    post('/images/upload', requireStaffAuth, async (req, res) => {
        try {
            const contentType = req.headers['content-type'] || '';
            if (contentType.includes('multipart/form-data')) {
                const bb = (0, busboy_1.default)({
                    headers: req.headers,
                    limits: { fileSize: 10 * 1024 * 1024, files: 1 }
                });
                let fileBuffer = null;
                let fileMime = 'image/jpeg';
                let rawFilename = `dish-${Date.now()}.jpg`;
                let targetFolder = 'dishes';
                let fileExceededLimit = false;
                bb.on('file', (_name, fileStream, info) => {
                    fileMime = info.mimeType;
                    rawFilename = info.filename || rawFilename;
                    const chunks = [];
                    fileStream.on('data', (data) => {
                        chunks.push(data);
                    });
                    fileStream.on('limit', () => {
                        fileExceededLimit = true;
                    });
                    fileStream.on('end', () => {
                        fileBuffer = Buffer.concat(chunks);
                    });
                });
                bb.on('field', (name, val) => {
                    if (name === 'folder') {
                        const cleanFolder = (0, validators_1.sanitizeString)(val, 50).replace(/[^a-zA-Z0-9_-]/g, '');
                        if (cleanFolder)
                            targetFolder = cleanFolder;
                    }
                    if (name === 'filename') {
                        const cleanFilename = (0, validators_1.sanitizeString)(val, 100).replace(/[^a-zA-Z0-9._-]/g, '');
                        if (cleanFilename)
                            rawFilename = cleanFilename;
                    }
                });
                bb.on('finish', async () => {
                    if (fileExceededLimit) {
                        return res.status(400).json({ error: '圖片大小超出 10MB 上限 (Max 10MB)' });
                    }
                    if (!fileBuffer || fileBuffer.length === 0) {
                        return res.status(400).json({ error: '未接收到有效圖片檔案 (Missing file)' });
                    }
                    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                    if (!allowedMimes.includes(fileMime)) {
                        return res.status(400).json({ error: `不支援的圖片格式 (${fileMime})，僅允許 JPEG, PNG, WEBP, GIF` });
                    }
                    try {
                        const result = await processAndSaveImage(fileBuffer, targetFolder, rawFilename, storageBucket);
                        return res.json(result);
                    }
                    catch (err) {
                        console.error('[Cloud Functions Storage Upload Error]:', err);
                        return res.status(500).json({ error: 'Failed to upload image to storage', details: err?.message });
                    }
                });
                bb.on('error', (err) => {
                    console.error('[Busboy Error]:', err);
                    return res.status(500).json({ error: 'Failed to parse multipart upload', details: err?.message });
                });
                if (req.rawBody) {
                    bb.end(req.rawBody);
                }
                else {
                    req.pipe(bb);
                }
                return;
            }
            const validation = (0, validators_1.validateImageUploadPayload)(req.body);
            if (!validation.isValid || !validation.sanitizedData) {
                return res.status(400).json({ error: validation.error || 'Missing or invalid image data' });
            }
            const { base64Clean, targetFolder, targetFilename: rawFilename } = validation.sanitizedData;
            const buffer = Buffer.from(base64Clean, 'base64');
            const result = await processAndSaveImage(buffer, targetFolder, rawFilename, storageBucket);
            return res.json(result);
        }
        catch (error) {
            console.error('[Cloud Functions Storage Upload Error]:', error);
            return res.status(500).json({ error: 'Failed to upload image to storage', details: error?.message });
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
            const snapshot = await db.collection('menu').select('id', 'category', 'name', 'price', 'image', 'thumbnailUrl', 'avifUrl', 'avifThumbnailUrl', 'description', 'available', 'isAvailable', 'isSetMeal', 'requiredSaucesOption', 'hasNoodlesOption', 'hasCoconutsMilkOption', 'containsBeef', 'containsPork', 'containsSeafood', 'isNotSpicy', 'customAddOns', 'recipe', 'orderIndex', 'isTakeoutAvailable', 'soldOutAt').orderBy('orderIndex').get();
            const items = snapshot.docs.map(doc => {
                const d = doc.data();
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
            if (data.image !== undefined || data.thumbnailUrl !== undefined || data.avifUrl !== undefined || data.avifThumbnailUrl !== undefined) {
                const docRef = db.collection('menu').doc(id);
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    const oldData = docSnap.data();
                    const oldImage = oldData?.image;
                    const oldThumb = oldData?.thumbnailUrl;
                    const oldAvif = oldData?.avifUrl;
                    const oldAvifThumb = oldData?.avifThumbnailUrl;
                    if (data.image !== undefined && oldImage && oldImage !== data.image) {
                        (0, helpers_1.cleanupStorageImage)(oldImage, storageBucket).catch((err) => {
                            console.warn(`[Menu Update] Storage cleanup note for ${id}:`, err?.message);
                        });
                    }
                    if (data.thumbnailUrl !== undefined && oldThumb && oldThumb !== data.thumbnailUrl) {
                        (0, helpers_1.cleanupStorageImage)(oldThumb, storageBucket).catch((err) => {
                            console.warn(`[Menu Update] Storage thumb cleanup note for ${id}:`, err?.message);
                        });
                    }
                    if (data.avifUrl !== undefined && oldAvif && oldAvif !== data.avifUrl) {
                        (0, helpers_1.cleanupStorageImage)(oldAvif, storageBucket).catch((err) => {
                            console.warn(`[Menu Update] Storage avif cleanup note for ${id}:`, err?.message);
                        });
                    }
                    if (data.avifThumbnailUrl !== undefined && oldAvifThumb && oldAvifThumb !== data.avifThumbnailUrl) {
                        (0, helpers_1.cleanupStorageImage)(oldAvifThumb, storageBucket).catch((err) => {
                            console.warn(`[Menu Update] Storage avif thumb cleanup note for ${id}:`, err?.message);
                        });
                    }
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
            const docRef = db.collection('menu').doc(id);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                const itemData = docSnap.data();
                const oldImage = itemData?.image;
                const oldThumb = itemData?.thumbnailUrl;
                const oldAvif = itemData?.avifUrl;
                const oldAvifThumb = itemData?.avifThumbnailUrl;
                if (oldImage) {
                    (0, helpers_1.cleanupStorageImage)(oldImage, storageBucket).catch((err) => {
                        console.warn(`[Menu Delete] Storage cleanup note for ${id}:`, err?.message);
                    });
                }
                if (oldThumb) {
                    (0, helpers_1.cleanupStorageImage)(oldThumb, storageBucket).catch((err) => {
                        console.warn(`[Menu Delete] Storage thumb cleanup note for ${id}:`, err?.message);
                    });
                }
                if (oldAvif) {
                    (0, helpers_1.cleanupStorageImage)(oldAvif, storageBucket).catch((err) => {
                        console.warn(`[Menu Delete] Storage avif cleanup note for ${id}:`, err?.message);
                    });
                }
                if (oldAvifThumb) {
                    (0, helpers_1.cleanupStorageImage)(oldAvifThumb, storageBucket).catch((err) => {
                        console.warn(`[Menu Delete] Storage avif thumb cleanup note for ${id}:`, err?.message);
                    });
                }
                await docRef.delete();
            }
            else {
                await db.collection('menu').doc(id).delete();
            }
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