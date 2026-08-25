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
exports.PIN_SALT = void 0;
exports.hashPin = hashPin;
exports.getStoredActiveToken = getStoredActiveToken;
exports.invalidateAuthCache = invalidateAuthCache;
exports.createStaffAuthMiddleware = createStaffAuthMiddleware;
const crypto = __importStar(require("crypto"));
exports.PIN_SALT = process.env.PIN_SALT || 'sabay-bbq-secure-salt-2026';
if (!process.env.PIN_SALT && process.env.NODE_ENV === 'production') {
    console.warn('[Security Warning] PIN_SALT is not explicitly defined in environment variables! Using configured fallback salt.');
}
function hashPin(pin, salt = exports.PIN_SALT) {
    return crypto.createHash('sha256').update(`${String(pin).trim()}:${salt}`).digest('hex');
}
let cachedAuthCredentials = null;
const AUTH_CACHE_TTL_MS = 30 * 1000;
async function getStoredActiveToken(db) {
    const now = Date.now();
    if (cachedAuthCredentials && (now - cachedAuthCredentials.cachedAt < AUTH_CACHE_TTL_MS)) {
        return { token: cachedAuthCredentials.token, expiresAt: cachedAuthCredentials.expiresAt };
    }
    const credsDoc = await db.collection('secrets').doc('credentials').get();
    const data = credsDoc.data();
    if (!data?.activeSessionToken)
        return null;
    const token = data.activeSessionToken;
    const expiresAt = data.tokenExpiresAt
        ? (typeof data.tokenExpiresAt === 'number' ? data.tokenExpiresAt : new Date(data.tokenExpiresAt).getTime())
        : (now + 8 * 60 * 60 * 1000);
    cachedAuthCredentials = { token, expiresAt, cachedAt: now };
    return { token, expiresAt };
}
function invalidateAuthCache() {
    cachedAuthCredentials = null;
}
function createStaffAuthMiddleware(db) {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: '未授權存取：缺少有效安全憑證 (Unauthorized)' });
        }
        const token = authHeader.split('Bearer ')[1]?.trim();
        if (!token) {
            return res.status(401).json({ error: '未授權存取：Token 為空 (Unauthorized)' });
        }
        try {
            const storedAuth = await getStoredActiveToken(db);
            const now = Date.now();
            if (storedAuth && storedAuth.token === token) {
                if (storedAuth.expiresAt && now > storedAuth.expiresAt) {
                    invalidateAuthCache();
                    return res.status(403).json({ error: '安全憑證已過期，請重新輸入 PIN 碼 (Token Expired)' });
                }
                return next();
            }
            return res.status(403).json({ error: '安全憑證無效或已過期，請重新輸入 PIN 碼' });
        }
        catch (error) {
            console.error('[Auth Error] Token verification failed:', error);
            return res.status(500).json({ error: '認證服務暫時無法使用，請稍後重試' });
        }
    };
}
//# sourceMappingURL=auth.js.map