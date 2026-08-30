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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMenuItemWritten = exports.api = exports.requireAppCheck = exports.sendErrorResponse = exports.requireStaffAuth = void 0;
exports.createRateLimiter = createRateLimiter;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("firebase-admin/storage");
const app_check_1 = require("firebase-admin/app-check");
const express_1 = __importDefault(require("express"));
(0, v2_1.setGlobalOptions)({ maxInstances: 10, minInstances: 0, memory: "256MiB", region: "asia-east1", concurrency: 80, timeoutSeconds: 30, invoker: 'public' });
const cors_1 = __importDefault(require("cors"));
const firestore_2 = require("firebase-admin/firestore");
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Cloud Functions] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[Cloud Functions] Uncaught Exception:', err);
});
admin.initializeApp();
const db = (0, firestore_2.getFirestore)('ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07');
const storageBucket = (0, storage_1.getStorage)().bucket('sabay-bbq-order.firebasestorage.app');
const app = (0, express_1.default)();
const auth_1 = require("./auth");
exports.requireStaffAuth = (0, auth_1.createStaffAuthMiddleware)(db);
const allowedOrigins = [
    'https://sabay-bbq-order.web.app',
    'https://sabay-bbq-order.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:3001'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) ||
            /\.web\.app$/.test(origin) ||
            /\.firebaseapp\.com$/.test(origin) ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://*.cloudfunctions.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google.com/recaptcha/ http://127.0.0.1:8060 http://localhost:8060; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com/recaptcha/; object-src 'none'; base-uri 'self';");
    next();
});
const rateLimitStore = new Map();
function createRateLimiter(maxRequests, windowMs = 60 * 1000, actionName = '操作') {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
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
const sendErrorResponse = (res, error, contextMsg = '伺服器內部錯誤') => {
    const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    console.error(`[API Error] [${errorId}] ${contextMsg}:`, error);
    return res.status(500).json({
        error: `${contextMsg}，請稍後再試或聯繫管理員`,
        errorId
    });
};
exports.sendErrorResponse = sendErrorResponse;
const requireAppCheck = async (req, res, next) => {
    if (process.env.FUNCTIONS_EMULATOR === 'true' || process.env.NODE_ENV !== 'production') {
        return next();
    }
    const appCheckToken = req.header('X-Firebase-AppCheck');
    if (!appCheckToken) {
        return next();
    }
    try {
        await (0, app_check_1.getAppCheck)().verifyToken(appCheckToken);
        return next();
    }
    catch (err) {
        console.warn('[App Check] 憑證驗證提醒 (軟性放行):', err);
        return next();
    }
};
exports.requireAppCheck = requireAppCheck;
const menu_1 = require("./routes/menu");
const bootstrap_1 = require("./routes/bootstrap");
const inventory_1 = require("./routes/inventory");
const tables_1 = require("./routes/tables");
const orders_1 = require("./routes/orders");
const settings_1 = require("./routes/settings");
const printer_1 = require("./routes/printer");
const staff_1 = require("./routes/staff");
const helpers_1 = require("./helpers");
const routeCtx = {
    db,
    storageBucket,
    requireStaffAuth: exports.requireStaffAuth,
    requireAppCheck: exports.requireAppCheck,
    createRateLimiter,
    sendErrorResponse: exports.sendErrorResponse,
};
(0, bootstrap_1.registerBootstrapRoutes)(app, routeCtx);
(0, menu_1.registerMenuRoutes)(app, routeCtx);
(0, orders_1.registerOrdersRoutes)(app, routeCtx);
(0, inventory_1.registerInventoryRoutes)(app, routeCtx);
(0, tables_1.registerTablesRoutes)(app, routeCtx);
(0, settings_1.registerSettingsRoutes)(app, routeCtx);
(0, printer_1.registerPrinterRoutes)(app, routeCtx);
(0, staff_1.registerStaffRoutes)(app, routeCtx);
app.use((req, res) => {
    res.status(404).json({ error: `無效的 API 請求: ${req.method} ${req.path}` });
});
exports.api = (0, https_1.onRequest)({ cors: true, invoker: 'public' }, app);
exports.onMenuItemWritten = (0, firestore_1.onDocumentWritten)({
    document: 'menu/{menuId}',
    database: 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07',
    region: 'asia-east1'
}, async (event) => {
    try {
        const beforeData = event.data?.before.exists ? event.data.before.data() : null;
        const afterData = event.data?.after.exists ? event.data.after.data() : null;
        if (beforeData && !afterData) {
            if (beforeData.image) {
                console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning image: ${beforeData.image}`);
                await (0, helpers_1.cleanupStorageImage)(beforeData.image, storageBucket);
            }
            if (beforeData.thumbnailUrl) {
                console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning thumbnail: ${beforeData.thumbnailUrl}`);
                await (0, helpers_1.cleanupStorageImage)(beforeData.thumbnailUrl, storageBucket);
            }
            if (beforeData.avifUrl) {
                console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning avif: ${beforeData.avifUrl}`);
                await (0, helpers_1.cleanupStorageImage)(beforeData.avifUrl, storageBucket);
            }
            if (beforeData.avifThumbnailUrl) {
                console.log(`[Firestore Trigger] Menu deleted (${event.params.menuId}), cleaning avif thumbnail: ${beforeData.avifThumbnailUrl}`);
                await (0, helpers_1.cleanupStorageImage)(beforeData.avifThumbnailUrl, storageBucket);
            }
            return;
        }
        if (beforeData && afterData) {
            const oldImage = beforeData.image;
            const newImage = afterData.image;
            if (oldImage && oldImage !== newImage) {
                console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new image, cleaning old image: ${oldImage}`);
                await (0, helpers_1.cleanupStorageImage)(oldImage, storageBucket);
            }
            const oldThumb = beforeData.thumbnailUrl;
            const newThumb = afterData.thumbnailUrl;
            if (oldThumb && oldThumb !== newThumb) {
                console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new thumbnail, cleaning old thumb: ${oldThumb}`);
                await (0, helpers_1.cleanupStorageImage)(oldThumb, storageBucket);
            }
            const oldAvif = beforeData.avifUrl;
            const newAvif = afterData.avifUrl;
            if (oldAvif && oldAvif !== newAvif) {
                console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new avif, cleaning old avif: ${oldAvif}`);
                await (0, helpers_1.cleanupStorageImage)(oldAvif, storageBucket);
            }
            const oldAvifThumb = beforeData.avifThumbnailUrl;
            const newAvifThumb = afterData.avifThumbnailUrl;
            if (oldAvifThumb && oldAvifThumb !== newAvifThumb) {
                console.log(`[Firestore Trigger] Menu updated (${event.params.menuId}) with new avif thumb, cleaning old avif thumb: ${oldAvifThumb}`);
                await (0, helpers_1.cleanupStorageImage)(oldAvifThumb, storageBucket);
            }
            return;
        }
    }
    catch (error) {
        console.error(`[Firestore Trigger Error] onMenuItemWritten failed for menuId: ${event.params.menuId}`, error);
    }
});
//# sourceMappingURL=index.js.map