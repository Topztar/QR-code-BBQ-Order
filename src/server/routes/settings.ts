import express from 'express';
import { MenuItem, Category, TableConfig, Ingredient, Reservation, Order, OperatingHourSlot } from '../../types';
import { toPublicMenuItem } from './menu';
import { sendTestNotification as sendCloudTestNotification } from '../../../functions/src/services/notification';

export interface SettingsRouteContext {
  getLiveMinSpendPerPerson: () => number;
  setLiveMinSpendPerPerson: (val: number) => void;
  getLiveOperatingHours: () => OperatingHourSlot[];
  setLiveOperatingHours: (slots: OperatingHourSlot[]) => void;
  getLiveRestDays: () => string[];
  setLiveRestDays: (days: string[]) => void;
  isStoreOpen: () => boolean;
  getLiveCustomerNotice: () => string;
  setLiveCustomerNotice: (notice: string) => void;
  getLiveServicePaused: () => boolean;
  setLiveServicePaused: (paused: boolean) => void;
  getPromoNotifications: () => any[];
  getLiveSystemVersion: () => string;
  setLiveSystemVersion: (ver: string) => void;
  getLivePopularItemIds: () => string[];
  setLivePopularItemIds: (ids: string[]) => void;
  getLiveMemberConfig: () => {
    pointsRatio: number;
    vipThreshold: number;
    vipDiscountRate: number;
    enablePointsDiscount: boolean;
    pointsRedeemRate: number;
    rewards: any[];
  };
  setLiveMemberConfig: (cfg: {
    pointsRatio?: number;
    vipThreshold?: number;
    vipDiscountRate?: number;
    enablePointsDiscount?: boolean;
    pointsRedeemRate?: number;
    rewards?: any[];
  }) => void;
  getLiveNotificationSettings: () => any;
  setLiveNotificationSettings: (settings: any) => void;
  getLiveMenu: () => MenuItem[];
  getLiveCategories: () => Category[];
  getLiveTables: () => TableConfig[];
  getLivePromoCombo: () => any;
  getLiveIngredients: () => Ingredient[];
  getLiveReservations: () => Reservation[];
  getLiveOrders: () => Order[];
  getPrinterIp: () => string;
  checkAndRestoreSoldOutMenuItems: () => boolean;
  syncTableStatusesWithTodayReservations: () => void;
  getTaiwanDateString: () => string;
  saveStateToDisk: () => void;
  isFirebaseSyncEnabled?: () => boolean;
  sendTestNotification?: (channel: string, config: any) => Promise<any>;
}

export function registerSettingsRoutes(app: express.Express, ctx: SettingsRouteContext) {
  // 0. Consolidated Bootstrap endpoint for fast initial load
  app.get('/api/bootstrap', (_req, res) => {
    ctx.checkAndRestoreSoldOutMenuItems();
    ctx.syncTableStatusesWithTodayReservations();
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
    
    const memberCfg = ctx.getLiveMemberConfig();
    res.json({
      isFirebaseSyncEnabled: ctx.isFirebaseSyncEnabled ? ctx.isFirebaseSyncEnabled() : true,
      menu: ctx.getLiveMenu().map(toPublicMenuItem),
      categories: ctx.getLiveCategories(),
      tables: ctx.getLiveTables(),
      operatingHours: {
        slots: ctx.getLiveOperatingHours(),
        restDays: ctx.getLiveRestDays(),
        isOpen: ctx.isStoreOpen(),
        currentTime: new Date().toISOString()
      },
      customerNotice: { notice: ctx.getLiveCustomerNotice() },
      promoCombo: ctx.getLivePromoCombo(),
      popularItemIds: ctx.getLivePopularItemIds(),
      minSpend: { minSpend: ctx.getLiveMinSpendPerPerson() },
      membersConfig: {
        pointsRatio: memberCfg.pointsRatio,
        vipThreshold: memberCfg.vipThreshold,
        vipDiscountRate: memberCfg.vipDiscountRate,
        enablePointsDiscount: memberCfg.enablePointsDiscount,
        pointsRedeemRate: memberCfg.pointsRedeemRate,
        rewards: memberCfg.rewards
      },
      servicePaused: { servicePaused: ctx.getLiveServicePaused() },
      printerConfig: { ip: ctx.getPrinterIp() },
      ingredients: ctx.getLiveIngredients(),
      reservations: ctx.getLiveReservations()
    });
  });

  // Minimum Spend Settings Endpoints
  app.get('/api/settings/min-spend', (_req, res) => {
    res.json({ minSpend: ctx.getLiveMinSpendPerPerson() });
  });

  app.post('/api/settings/min-spend', (req, res) => {
    const { minSpend } = req.body;
    if (minSpend !== undefined && !isNaN(parseInt(minSpend, 10))) {
      const val = Math.max(0, parseInt(minSpend, 10));
      ctx.setLiveMinSpendPerPerson(val);
      ctx.saveStateToDisk();
      return res.json({ success: true, minSpend: val });
    }
    res.status(400).json({ error: 'Invalid minimum spend / 無效低消金額' });
  });

  // Operating Hours Settings Endpoints
  app.get('/api/settings/operating-hours', (_req, res) => {
    res.json({
      slots: ctx.getLiveOperatingHours(),
      restDays: ctx.getLiveRestDays(),
      isOpen: ctx.isStoreOpen(),
      currentTime: new Date().toISOString()
    });
  });

  app.post('/api/settings/operating-hours', (req, res) => {
    const { slots, restDays } = req.body;
    if (slots && Array.isArray(slots)) {
      const sanitized = slots.map((s: any, idx: number) => ({
        id: s.id || `oh-manual-${idx}-${Date.now()}`,
        name: s.name || `時段 ${idx + 1}`,
        start: s.start || '11:00',
        end: s.end || '14:30',
        days: Array.isArray(s.days) ? s.days.map(Number) : [0, 1, 2, 3, 4, 5, 6],
        isActive: s.isActive !== undefined ? !!s.isActive : true,
        isReservableOnly: !!s.isReservableOnly
      }));
      ctx.setLiveOperatingHours(sanitized);
    }
    if (restDays && Array.isArray(restDays)) {
      const sanitizedRestDays = restDays.map(String).map(d => d.trim()).filter(Boolean);
      ctx.setLiveRestDays(sanitizedRestDays);
    }
    ctx.saveStateToDisk();
    return res.json({
      success: true,
      slots: ctx.getLiveOperatingHours(),
      restDays: ctx.getLiveRestDays(),
      isOpen: ctx.isStoreOpen()
    });
  });

  // Customer Notice Settings Endpoints
  app.get('/api/settings/customer-notice', (_req, res) => {
    res.json({ notice: ctx.getLiveCustomerNotice() });
  });

  app.post('/api/settings/customer-notice', (req, res) => {
    const { notice } = req.body;
    if (notice !== undefined) {
      const cleanNotice = String(notice).trim();
      ctx.setLiveCustomerNotice(cleanNotice);
      ctx.saveStateToDisk();
      return res.json({ success: true, notice: cleanNotice });
    }
    res.status(400).json({ error: 'Invalid customer notice / 顧客注意事項無效' });
  });

  // Service Pause Settings Endpoints
  app.get('/api/settings/service-pause', (_req, res) => {
    res.json({ servicePaused: ctx.getLiveServicePaused() });
  });

  app.post('/api/settings/service-pause', (req, res) => {
    const { servicePaused } = req.body;
    if (servicePaused !== undefined) {
      const nextVal = !!servicePaused;
      const currentVal = ctx.getLiveServicePaused();
      if (currentVal !== nextVal) {
        ctx.setLiveServicePaused(nextVal);
        const promoNotifs = ctx.getPromoNotifications();
        const newNotif = {
          id: `notif-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          title: nextVal
            ? '⚠️ 廚房暫停接單通知 (Kitchen Service Paused)'
            : '🟢 廚房恢復正常接單 (Kitchen Service Resumed)',
          message: nextVal
            ? '親愛的顧客您好，由於目前現場與線上訂單量極大，為了保障餐點品質，廚房已暫停新訂單製作與下單服務。您仍可自由流覽菜單，暫停期間「送出訂單」功能將自動鎖定，敬請稍等或向現場服務人員諮詢，感謝您的體諒與配合！'
            : '感謝您的耐心等待！廚房目前的訂單高峰已順利消化，點餐與結帳權限現已全面解鎖恢復正常！您可以直接挑選餐點並加入購物車送出訂單，期待為您送上美味的碳烤！',
          badge: nextVal ? 'PAUSED' : 'ONLINE',
          isRead: false
        };
        promoNotifs.push(newNotif);
      }
      ctx.saveStateToDisk();
      return res.json({ success: true, servicePaused: ctx.getLiveServicePaused() });
    }
    res.status(400).json({ error: 'Invalid servicePaused value / 暫停服務值無效' });
  });

  // System Version Settings Endpoints
  app.get('/api/settings/version', (_req, res) => {
    res.json({ version: ctx.getLiveSystemVersion() });
  });

  app.post('/api/settings/version', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未授權存取：憑證格式不正確' });
      }
      const token = authHeader.split('Bearer ')[1]?.trim();
      if (token && !token.startsWith('st_') && token !== 'authenticated') {
        return res.status(403).json({ error: '安全憑證無效或已過期，請確認管理員權限' });
      }
    }

    const { version } = req.body;
    if (!version || typeof version !== 'string' || !version.trim()) {
      return res.status(400).json({ error: '版本號必須為非空字串' });
    }
    const semver = /^v?\d+\.\d+\.\d+$/;
    if (!semver.test(version.trim())) {
      return res.status(400).json({ error: '版本號格式不正確，應為 X.Y.Z 或 vX.Y.Z (例如 1.0.0)' });
    }
    const cleanVer = version.trim();
    ctx.setLiveSystemVersion(cleanVer);
    ctx.saveStateToDisk();
    return res.json({ success: true, version: cleanVer });
  });

  // Popular items Settings Endpoints
  app.get('/api/settings/popular-item-ids', (_req, res) => {
    res.json(ctx.getLivePopularItemIds());
  });

  app.post('/api/settings/popular-item-ids', (req, res) => {
    const { popularItemIds } = req.body;
    if (popularItemIds && Array.isArray(popularItemIds)) {
      const sanitized = popularItemIds.map(String).map(s => s.trim()).filter(Boolean);
      ctx.setLivePopularItemIds(sanitized);
      ctx.saveStateToDisk();
      return res.json({ success: true, popularItemIds: sanitized });
    }
    res.status(400).json({ error: 'Invalid popularItemIds format / 今日熱銷設定資料格式錯誤' });
  });

  // Member Points and Reward Config Settings Endpoints
  app.get('/api/settings/members-config', (_req, res) => {
    const cfg = ctx.getLiveMemberConfig();
    res.json(cfg);
  });

  app.post('/api/settings/members-config', (req, res) => {
    const { pointsRatio, vipThreshold, vipDiscountRate, enablePointsDiscount, pointsRedeemRate, rewards } = req.body;
    const patch: any = {};
    if (pointsRatio !== undefined && !isNaN(parseInt(pointsRatio, 10))) {
      patch.pointsRatio = Math.max(1, parseInt(pointsRatio, 10));
    }
    if (vipThreshold !== undefined && !isNaN(parseInt(vipThreshold, 10))) {
      patch.vipThreshold = Math.max(1, parseInt(vipThreshold, 10));
    }
    if (vipDiscountRate !== undefined && !isNaN(parseFloat(vipDiscountRate))) {
      patch.vipDiscountRate = Math.min(1, Math.max(0.1, parseFloat(vipDiscountRate)));
    }
    if (enablePointsDiscount !== undefined) {
      patch.enablePointsDiscount = !!enablePointsDiscount;
    }
    if (pointsRedeemRate !== undefined && !isNaN(parseFloat(pointsRedeemRate))) {
      patch.pointsRedeemRate = Math.max(0.01, parseFloat(pointsRedeemRate));
    }
    if (rewards && Array.isArray(rewards)) {
      patch.rewards = rewards.map((r: any) => ({
        id: r.id || `rew-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        menuItemId: r.menuItemId,
        cost: r.cost !== undefined ? Number(r.cost) : 100,
        fallbackPrice: r.fallbackPrice !== undefined ? Number(r.fallbackPrice) : 10,
        enabled: r.enabled !== undefined ? !!r.enabled : true
      }));
    }
    ctx.setLiveMemberConfig(patch);
    ctx.saveStateToDisk();
    const updatedCfg = ctx.getLiveMemberConfig();
    res.json({
      success: true,
      ...updatedCfg
    });
  });

  // Notification Settings Endpoints
  app.get('/api/settings/notifications', (_req, res) => {
    const notifSettings = ctx.getLiveNotificationSettings();
    const lineToken = notifSettings.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    const lineAdminId = notifSettings.lineAdminId || process.env.LINE_ADMIN_USER_ID || '';
    const gmailUser = notifSettings.gmailUser || process.env.GMAIL_USER || '';
    const gmailAppPass = notifSettings.gmailAppPass || process.env.GMAIL_APP_PASS || '';

    res.json({
      lineEnabled: notifSettings.lineEnabled !== false,
      isLineConfigured: Boolean(lineToken && lineAdminId),
      lineAdminId,
      hasLineToken: Boolean(lineToken),
      gmailEnabled: notifSettings.gmailEnabled !== false,
      isGmailConfigured: Boolean(gmailUser && gmailAppPass),
      gmailUser,
      hasGmailAppPass: Boolean(gmailAppPass),
      source: {
        line: notifSettings.lineToken ? 'database' : (process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'env' : 'none'),
        gmail: notifSettings.gmailAppPass ? 'database' : (process.env.GMAIL_APP_PASS ? 'env' : 'none')
      }
    });
  });

  app.post('/api/settings/notifications', (req, res) => {
    const { lineEnabled, lineToken, lineAdminId, gmailEnabled, gmailUser, gmailAppPass } = req.body;
    const notifSettings = ctx.getLiveNotificationSettings();

    if (lineEnabled !== undefined) notifSettings.lineEnabled = Boolean(lineEnabled);
    if (lineAdminId !== undefined) notifSettings.lineAdminId = String(lineAdminId).trim();
    if (typeof lineToken === 'string' && lineToken.trim()) {
      notifSettings.lineToken = lineToken.trim();
    }

    if (gmailEnabled !== undefined) notifSettings.gmailEnabled = Boolean(gmailEnabled);
    if (gmailUser !== undefined) notifSettings.gmailUser = String(gmailUser).trim();
    if (typeof gmailAppPass === 'string' && gmailAppPass.trim()) {
      notifSettings.gmailAppPass = gmailAppPass.replace(/\s+/g, '').trim();
    }

    ctx.setLiveNotificationSettings(notifSettings);
    ctx.saveStateToDisk();
    return res.json({ success: true, message: '通知設定已成功更新！' });
  });

  app.post('/api/settings/notifications/test', async (req, res) => {
    const { channel, config } = req.body;
    if (channel !== 'LINE' && channel !== 'Gmail') {
      return res.status(400).json({ success: false, error: '未知的通知管道 (僅支援 LINE 或 Gmail)' });
    }

    const notifSettings = ctx.getLiveNotificationSettings();
    const effectiveConfig = {
      lineEnabled: config?.lineEnabled ?? notifSettings.lineEnabled ?? true,
      lineToken: (config?.lineToken && config.lineToken.trim()) ? config.lineToken.trim() : (notifSettings.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN),
      lineAdminId: (config?.lineAdminId !== undefined && config.lineAdminId.trim()) ? config.lineAdminId.trim() : (notifSettings.lineAdminId || process.env.LINE_ADMIN_USER_ID),
      gmailEnabled: config?.gmailEnabled ?? notifSettings.gmailEnabled ?? true,
      gmailUser: (config?.gmailUser !== undefined && config.gmailUser.trim()) ? config.gmailUser.trim() : (notifSettings.gmailUser || process.env.GMAIL_USER),
      gmailAppPass: (config?.gmailAppPass && config.gmailAppPass.trim()) ? config.gmailAppPass.replace(/\s+/g, '').trim() : (notifSettings.gmailAppPass || process.env.GMAIL_APP_PASS)
    };

    const tester = ctx.sendTestNotification || sendCloudTestNotification;
    const result = await tester(channel, effectiveConfig);
    if (result.success) {
      res.json({ success: true, message: `${channel} 連線測試成功！已發送測試訊息。` });
    } else {
      res.json({
        success: false,
        error: result.error || (result.reason === 'unconfigured' ? '尚未設定必要的 Token 或帳號密碼' : (result.reason === 'disabled' ? '該通知管道目前已設為關閉停用' : '發送失敗'))
      });
    }
  });

  // 8. Management Analytical Insights Data
  app.get('/api/analytics', (_req, res) => {
    const liveOrders = ctx.getLiveOrders();
    const liveCategories = ctx.getLiveCategories();
    const liveMenu = ctx.getLiveMenu();
    const liveIngredients = ctx.getLiveIngredients();

    const completedOrders = liveOrders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const ordersCount = liveOrders.length;

    // Compute category sales distribution
    const categorySalesMap: { [cat: string]: number } = {};
    liveCategories.forEach(cat => {
      categorySalesMap[cat.id] = 0;
    });

    completedOrders.forEach(order => {
      order.items.forEach(it => {
        const item = liveMenu.find(m => m.id === it.menuItemId);
        if (item && categorySalesMap[item.category] !== undefined) {
          categorySalesMap[item.category] += it.price * it.qty;
        }
      });
    });

    const categorySales = Object.keys(categorySalesMap).map(catId => ({
      category: catId,
      revenue: categorySalesMap[catId]
    }));

    // Hourly distribution: last 24 hours or fixed hourly slots for last orders
    const hourlyMap: { [slot: string]: number } = {};
    for (let i = 0; i < 24; i++) {
      const slot = `${String(i).padStart(2, '0')}:00`;
      hourlyMap[slot] = 0;
    }
    liveOrders.forEach(order => {
      try {
        const hour = new Date(order.createdAt).getHours();
        const slot = `${String(hour).padStart(2, '0')}:00`;
        hourlyMap[slot] = (hourlyMap[slot] || 0) + 1;
      } catch (_e) {}
    });
    const hourlyDistribution = Object.keys(hourlyMap).map(slot => ({
      timeSlot: slot,
      orders: hourlyMap[slot]
    })).sort((a,b) => a.timeSlot.localeCompare(b.timeSlot));

    // Top dishes
    const dishSalesMap: { [name: string]: number } = {};
    completedOrders.forEach(order => {
      order.items.forEach(it => {
        const nameKey = it.name ? (typeof it.name === 'object' ? (it.name.zh || it.name.en || '未命名商品') : it.name) : '未命名商品';
        dishSalesMap[nameKey] = (dishSalesMap[nameKey] || 0) + it.qty;
      });
    });
    const topDishes = Object.keys(dishSalesMap).map(name => ({
      name,
      qty: dishSalesMap[name]
    })).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Stock warnings: stock <= minThreshold
    const stockWarnings = liveIngredients.filter(ig => ig.stock <= ig.minThreshold);

    res.json({
      totalRevenue,
      ordersCount,
      categorySales,
      hourlyDistribution,
      topDishes,
      stockWarnings
    });
  });

  // 0b. Real-time store status endpoint
  app.get('/api/store-status', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const todayStr = ctx.getTaiwanDateString();
    const liveMenu = ctx.getLiveMenu();
    const soldOutItemIds = liveMenu
      .filter(dish => {
        if (dish.available === false) return true;
        if (dish.soldOutType === 'permanent') return true;
        if (dish.soldOutType === 'daily' && dish.soldOutDate === todayStr) return true;
        return false;
      })
      .map(dish => dish.id);

    res.json({
      isOpen: ctx.isStoreOpen(),
      servicePaused: ctx.getLiveServicePaused(),
      soldOutItemIds,
      timestamp: Date.now()
    });
  });
}
