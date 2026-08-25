"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBootstrapRoutes = registerBootstrapRoutes;
const crypto = __importStar(require("crypto"));
const helpers_1 = require("../helpers");
function registerBootstrapRoutes(app, ctx) {
    const { db, storageBucket, requireStaffAuth, createRateLimiter, sendErrorResponse } = ctx;
    const get = (routePath, ...handlers) => app.get([`/api${routePath}`, routePath], ...handlers);
    const post = (routePath, ...handlers) => app.post([`/api${routePath}`, routePath], ...handlers);
    const put = (routePath, ...handlers) => app.put([`/api${routePath}`, routePath], ...handlers);
    const del = (routePath, ...handlers) => app.delete([`/api${routePath}`, routePath], ...handlers);
    get('/bootstrap', async (_req, res) => {
        try {
            res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=180, stale-while-revalidate=600');
            const todayStr = new Date().toISOString().split('T')[0];
            const [categoriesSnap, menuSnap, tablesSnap, systemDoc, ingredientsSnap, reservationsSnap] = await Promise.all([
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
            const processedItems = items.map((item) => {
                const processed = (0, helpers_1.processMenuItemSoldOut)(item, now);
                delete processed._docId;
                return processed;
            });
            const nowMs = Date.now();
            const tables = tablesSnap.docs.map(doc => {
                const tb = doc.data();
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
            const isOpen = (0, helpers_1.isStoreOpenFromData)(sysData);
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
                    rewards: sysData.liveMemberRewards || []
                },
                servicePaused: { servicePaused: sysData.liveServicePaused || false },
                printerConfig: { ip: sysData.livePrinterIp || '192.168.123.100' },
                ingredients: ingredientsSnap.docs.map(doc => doc.data()),
                reservations: reservationsSnap.docs.map(doc => doc.data())
            };
            const rawString = JSON.stringify(responsePayload);
            const etag = `W/"${crypto.createHash('md5').update(rawString).digest('hex').substring(0, 16)}"`;
            res.setHeader('ETag', etag);
            res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=600');
            if (_req.headers['if-none-match'] === etag) {
                return res.status(304).end();
            }
            res.json(responsePayload);
        }
        catch (error) {
            console.error('Error fetching bootstrap data:', error);
            sendErrorResponse(res, error);
        }
    });
}
//# sourceMappingURL=bootstrap.js.map