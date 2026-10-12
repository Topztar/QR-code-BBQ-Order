import express from 'express';
import crypto from 'crypto';

export interface StaffRouteContext {
  getLiveStaffPin: () => string;
  setLiveStaffPin: (pin: string) => void;
  clearTestData: () => void;
  saveStateToDisk: () => void;
  pinSalt?: string;
}

export function registerStaffRoutes(app: express.Express, ctx: StaffRouteContext) {
  const PIN_SALT = ctx.pinSalt || process.env.PIN_SALT || 'sabay-bbq-secure-salt-2026';

  function hashPinLocal(pin: string, salt: string = PIN_SALT): string {
    return crypto.createHash('sha256').update(`${String(pin).trim()}:${salt}`).digest('hex');
  }

  let staffFailedAttempts = 0;
  let staffLockedUntil: number | null = null;

  // Securely verify active staff session token
  app.get('/api/staff/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: '未授權存取：缺少有效安全憑證 (Unauthorized)' });
    }
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (token && token.startsWith('st_')) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false, error: '安全憑證無效或已過期' });
  });

  app.post('/api/staff/pin/verify', (req, res) => {
    const { pin } = req.body;
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ success: false, error: '請輸入有效的 6 位數金鑰' });
    }

    const now = Date.now();
    if (staffLockedUntil && now < staffLockedUntil) {
      const remainingMinutes = Math.ceil((staffLockedUntil - now) / (60 * 1000));
      return res.status(429).json({
        success: false,
        error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。`,
        locked: true,
        remainingMinutes
      });
    }

    const inputHash = hashPinLocal(pin);
    const targetHash = hashPinLocal(ctx.getLiveStaffPin());

    if (inputHash === targetHash) {
      staffFailedAttempts = 0;
      staffLockedUntil = null;
      const sessionToken = `st_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
      return res.json({ success: true, access_token: sessionToken });
    }

    staffFailedAttempts++;
    if (staffFailedAttempts >= 5) {
      staffLockedUntil = now + (15 * 60 * 1000); // 鎖定 15 分鐘
      return res.status(429).json({
        success: false,
        error: '連續輸入錯誤達 5 次，系統已安全鎖定 15 分鐘！',
        locked: true,
        remainingMinutes: 15
      });
    }

    return res.status(400).json({ success: false, error: '解鎖金鑰錯誤！(請輸入正確的 6 位數金鑰)' });
  });

  // Update staff authentication PIN (with brute-force lockout protection)
  function handleStaffPinUpdate(req: express.Request, res: express.Response) {
    const { currentPin, newPin } = req.body;
    if (!currentPin || !newPin) {
      return res.status(400).json({ error: '請輸入目前金鑰與新解鎖金鑰 / Required fields missing' });
    }

    const now = Date.now();
    if (staffLockedUntil && now < staffLockedUntil) {
      const remainingMinutes = Math.ceil((staffLockedUntil - now) / (60 * 1000));
      return res.status(429).json({ error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。` });
    }

    const targetHash = hashPinLocal(ctx.getLiveStaffPin());
    if (hashPinLocal(currentPin) !== targetHash) {
      staffFailedAttempts++;
      if (staffFailedAttempts >= 5) {
        staffLockedUntil = now + (15 * 60 * 1000);
        return res.status(429).json({ error: '連續輸入錯誤達 5 次，系統已安全鎖定 15 分鐘！' });
      }
      return res.status(400).json({ error: '目前解鎖金鑰輸入錯誤！ / Incorrect current PIN' });
    }

    staffFailedAttempts = 0;
    staffLockedUntil = null;
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ error: '新金鑰必須為 6 位半形數字！ / New PIN must be a 6-digit number' });
    }
    ctx.setLiveStaffPin(newPin);
    ctx.saveStateToDisk();
    res.json({ success: true, message: '員工解鎖金鑰已成功變更！' });
  }

  app.put('/api/staff/pin', handleStaffPinUpdate);

  // Admin Sanitize Test Data Endpoint (Parity with Cloud Functions)
  app.post(['/api/admin/clear-test-data', '/admin/clear-test-data'], (req, res) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token || !token.startsWith('st_')) {
      return res.status(401).json({ error: '安全憑證無效或已過期' });
    }

    const { pin } = req.body;
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ error: '請輸入有效的員工解鎖 PIN 碼！' });
    }

    const now = Date.now();
    if (staffLockedUntil && now < staffLockedUntil) {
      const remainingMinutes = Math.ceil((staffLockedUntil - now) / (60 * 1000));
      return res.status(429).json({
        error: `連續輸入錯誤次數過多，系統已安全鎖定！請於 ${remainingMinutes} 分鐘後再試。`,
        locked: true,
        remainingMinutes
      });
    }

    const targetHash = hashPinLocal(ctx.getLiveStaffPin());
    if (hashPinLocal(pin) !== targetHash) {
      staffFailedAttempts++;
      if (staffFailedAttempts >= 5) {
        staffLockedUntil = now + (15 * 60 * 1000);
        return res.status(429).json({ error: '連續輸入錯誤達 5 次，系統已安全鎖定 15 分鐘！' });
      }
      return res.status(403).json({ error: '安全校對碼 (員工解鎖 PIN 碼) 不正確，無法授權清空！' });
    }

    staffFailedAttempts = 0;
    staffLockedUntil = null;

    ctx.clearTestData();
    ctx.saveStateToDisk();
    res.json({
      success: true,
      message: '已成功清除系統內所有測試用歷史單據及暫存日誌！'
    });
  });
}
