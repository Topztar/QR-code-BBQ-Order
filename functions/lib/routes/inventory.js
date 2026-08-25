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
                const newStock = Math.round(((docSnap.data()?.stock || 0) + change) * 100) / 100;
                t.update(ingRef, { stock: newStock });
            });
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error adjusting inventory:', error);
            sendErrorResponse(res, error);
        }
    });
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
        }
        catch (error) {
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=inventory.js.map