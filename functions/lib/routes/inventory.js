"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInventoryRoutes = registerInventoryRoutes;
function registerInventoryRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/ingredients', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=60, stale-while-revalidate=120');
            const snapshot = await db.collection('ingredients').select('id', 'name', 'stock', 'minThreshold', 'unit').get();
            const ingredients = snapshot.docs.map(doc => doc.data());
            res.json(ingredients);
        }
        catch (error) {
            console.error('Error fetching ingredients:', error);
            sendErrorResponse(res, error);
        }
    });
    post('/ingredients', requireStaffAuth, async (req, res) => {
        try {
            const data = req.body;
            const docRef = await db.collection('ingredients').add(data);
            res.json({ id: docRef.id });
        }
        catch (error) {
            console.error('Error creating ingredient:', error);
            sendErrorResponse(res, error);
        }
    });
    put('/ingredients/:id', requireStaffAuth, async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            await db.collection('ingredients').doc(id).set(data, { merge: true });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error updating ingredient:', error);
            sendErrorResponse(res, error);
        }
    });
    del('/ingredients/:id', requireStaffAuth, async (req, res) => {
        try {
            const id = req.params.id;
            await db.collection('ingredients').doc(id).delete();
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting ingredient:', error);
            sendErrorResponse(res, error);
        }
    });
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
                const data = docSnap.data();
                const newStock = Math.round(((data?.stock || 0) + change) * 100) / 100;
                t.update(ingRef, { stock: newStock });
                const logRef = db.collection('inventoryLogs').doc();
                t.set(logRef, {
                    id: logRef.id,
                    timestamp: new Date().toISOString(),
                    ingredientId,
                    ingredientName: data?.name || ingredientId,
                    type: 'adjustment',
                    quantityChanged: change,
                    remainingStock: newStock,
                    note: req.body.note || ''
                });
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error adjusting inventory:', error);
            sendErrorResponse(res, error);
        }
    });
    post('/ingredients/restock', requireStaffAuth, async (req, res) => {
        const id = req.body.id || req.body.ingredientId;
        const amount = Number(req.body.amount !== undefined ? req.body.amount : req.body.quantityAdded);
        if (!id) {
            return res.status(400).json({ error: 'Missing ingredient id' });
        }
        if (isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const ingRef = db.collection('ingredients').doc(id);
        try {
            await db.runTransaction(async (t) => {
                const docSnap = await t.get(ingRef);
                const data = docSnap.data();
                const newStock = Math.round(((data?.stock || 0) + amount) * 100) / 100;
                t.update(ingRef, { stock: newStock });
                const logRef = db.collection('inventoryLogs').doc();
                t.set(logRef, {
                    id: logRef.id,
                    timestamp: new Date().toISOString(),
                    ingredientId: id,
                    ingredientName: data?.name || id,
                    type: 'incoming',
                    quantityChanged: amount,
                    remainingStock: newStock,
                    note: req.body.note || 'Restocked via Manager UI'
                });
            });
            res.json({ success: true });
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=inventory.js.map