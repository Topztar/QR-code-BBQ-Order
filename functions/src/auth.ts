import express from 'express';
import * as crypto from 'crypto';
import { getFirestore } from 'firebase-admin/firestore';

// 🔐 安全雜湊輔助函式 (PIN Hash with Salt)
export const PIN_SALT = process.env.PIN_SALT || 'sabay-bbq-secure-salt-2026';

export function hashPin(pin: string, salt: string = PIN_SALT): string {
  return crypto.createHash('sha256').update(`${String(pin).trim()}:${salt}`).digest('hex');
}

// 🛡️ Token 記憶體快取 (減少每次 Staff API 請求重複讀取 Firestore)
let cachedAuthCredentials: { token: string; expiresAt: number; cachedAt: number } | null = null;
const AUTH_CACHE_TTL_MS = 30 * 1000; // 30 秒記憶體快取

export async function getStoredActiveToken(db: ReturnType<typeof getFirestore>): Promise<{ token: string; expiresAt: number } | null> {
  const now = Date.now();
  if (cachedAuthCredentials && (now - cachedAuthCredentials.cachedAt < AUTH_CACHE_TTL_MS)) {
    return { token: cachedAuthCredentials.token, expiresAt: cachedAuthCredentials.expiresAt };
  }
  const credsDoc = await db.collection('secrets').doc('credentials').get();
  const data = credsDoc.data();
  if (!data?.activeSessionToken) return null;
  const token = data.activeSessionToken;
  const expiresAt = data.tokenExpiresAt
    ? (typeof data.tokenExpiresAt === 'number' ? data.tokenExpiresAt : new Date(data.tokenExpiresAt).getTime())
    : (now + 8 * 60 * 60 * 1000);
  cachedAuthCredentials = { token, expiresAt, cachedAt: now };
  return { token, expiresAt };
}

export function invalidateAuthCache() {
  cachedAuthCredentials = null;
}

/**
 * 員工授權驗證 Middleware 工廠函式
 */
export function createStaffAuthMiddleware(db: ReturnType<typeof getFirestore>): express.RequestHandler {
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
    } catch (error) {
      console.error('[Auth Error] Token verification failed:', error);
      return res.status(500).json({ error: '認證服務暫時無法使用，請稍後重試' });
    }
  };
}
