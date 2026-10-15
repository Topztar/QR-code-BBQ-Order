import axios from 'axios';
import nodemailer from 'nodemailer';

export interface ReservationNotificationData {
  id?: string;
  customerName: string;
  phone: string;
  guestCount: number;
  tableNumber?: string;
  date: string;
  time: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  reservationNo?: string;
  source?: string;
  utm_medium?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: 'LINE' | 'Gmail';
  reason?: string;
  error?: string;
}

export interface NotificationOptions {
  notificationConfig?: {
    lineEnabled?: boolean;
    lineToken?: string;
    lineAdminId?: string;
    gmailEnabled?: boolean;
    gmailUser?: string;
    gmailAppPass?: string;
    [key: string]: any;
  };
  axiosClient?: {
    post: (url: string, data?: any, config?: any) => Promise<any>;
  };
  nodemailerClient?: {
    createTransport: (options: any) => {
      sendMail: (mailOptions: any) => Promise<any>;
    };
  };
}

export interface OrderNotificationData {
  id: string;
  tableNumber: string;
  items: Array<{ name: any; qty: number; price: number }>;
  total: number;
  status?: string;
  customerName?: string;
  customerPhone?: string;
  takeoutInfo?: any;
  source?: string;
  utm_medium?: string;
  createdAt?: string;
}

/**
 * 將任意時間輸入（UTC ISO 字串、Firestore Timestamp、Date、Number）
 * 統一轉換為台灣時區 (Asia/Taipei, UTC+8) 的易讀格式：YYYY-MM-DD HH:mm:ss
 */
export function formatTaiwanDateTime(input?: unknown): string {
  let date: Date;
  if (!input) {
    date = new Date();
  } else if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    // 若已是 YYYY-MM-DD HH:mm(:ss) 格式且無時區後綴，直接保留避免二次偏移
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed;
    }
    date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return trimmed; // 若為自訂非標準字串，安全回傳原字串避免 Invalid Date
    }
  } else if (typeof input === 'number') {
    date = new Date(input);
  } else if (typeof input === 'object' && input !== null) {
    const maybeTs = input as { toDate?: () => Date; _seconds?: number; seconds?: number };
    if (typeof maybeTs.toDate === 'function') {
      date = maybeTs.toDate();
    } else if (typeof maybeTs._seconds === 'number') {
      date = new Date(maybeTs._seconds * 1000);
    } else if (typeof maybeTs.seconds === 'number') {
      date = new Date(maybeTs.seconds * 1000);
    } else {
      date = new Date();
    }
  } else {
    date = new Date();
  }

  if (Number.isNaN(date.getTime())) {
    date = new Date();
  }

  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * 取得台灣時區 (Asia/Taipei) 當前日期字串：YYYY-MM-DD
 */
export function getTaiwanDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * 統一正規化預約欄位預設值，消除 LINE 與 Gmail 模板間的重複計算
 */
function normalizeReservationFields(reservation: ReservationNotificationData) {
  return {
    table: reservation.tableNumber ? `${reservation.tableNumber} 桌` : '未指定 / 待安排',
    notes: reservation.notes?.trim() ? reservation.notes.trim() : '無特殊備註',
    orderId: reservation.reservationNo || reservation.id || 'N/A',
    createdTime: formatTaiwanDateTime(reservation.createdAt),
    isGoogle: reservation.source === 'google_business',
  };
}

/**
 * 內部共用：發送 LINE Push 訊息（消除預約推播與訂單推播的重複邏輯）
 */
async function dispatchLinePushMessage(
  messageText: string,
  logTag: string,
  targetId: string,
  options?: NotificationOptions
): Promise<NotificationResult> {
  const config = options?.notificationConfig;
  if (config?.lineEnabled === false) {
    return { success: false, channel: 'LINE', reason: 'disabled' };
  }

  const token = (config?.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();
  const adminId = (config?.lineAdminId || process.env.LINE_ADMIN_USER_ID || '').trim();

  if (!token || !adminId) {
    console.warn(`[${logTag}] Skipped: LINE channel token or admin user ID is not configured.`);
    return { success: false, channel: 'LINE', reason: 'unconfigured' };
  }

  const client = options?.axiosClient || axios;
  try {
    await client.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: adminId,
        messages: [{ type: 'text', text: messageText }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        timeout: 8000,
      }
    );
    console.log(`[${logTag}] Push sent successfully for ${targetId}`);
    return { success: true, channel: 'LINE' };
  } catch (err: any) {
    const errorDetails = err?.response?.data ? JSON.stringify(err.response.data) : err.message || String(err);
    console.error(`[${logTag}] Failed to send push message: ${errorDetails}`);
    return { success: false, channel: 'LINE', error: errorDetails };
  }
}

/**
 * Escapes HTML characters to prevent XSS / HTML injection in email templates
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a clean, structured text message for LINE Messaging API
 */
export function formatLineReservationMessage(reservation: ReservationNotificationData): string {
  const { table, notes, orderId, createdTime, isGoogle } = normalizeReservationFields(reservation);
  const header = isGoogle
    ? '🔔 【Google 商家新預約訂位】SABAY BBQ 沙貝燒烤'
    : '🔔 【新預約訂位通知】SABAY BBQ 沙貝燒烤';
  const originLine = isGoogle
    ? '🌐 渠道來源：Google 商家檔案 (Google Business Profile)'
    : '📱 渠道來源：現場/官方系統登記';

  return [
    header,
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 顧客姓名：${reservation.customerName}`,
    `📞 聯絡電話：${reservation.phone}`,
    `📅 預約日期：${reservation.date}`,
    `⏰ 預約時間：${reservation.time}`,
    `👥 用餐人數：${reservation.guestCount} 位`,
    `🪑 預約桌號：${table}`,
    `📝 特殊備註：${notes}`,
    originLine,
    `🆔 預約編號：${orderId}`,
    `⏱️ 登記時間：${createdTime}`,
    '━━━━━━━━━━━━━━━━━━━━',
    '💡 請至管理後台【操作面板】確認預約並保留席位。',
  ].join('\n');
}

/**
 * Formats subject, plain-text and HTML content for Gmail SMTP notifications
 */
export function formatGmailReservationContent(reservation: ReservationNotificationData): {
  subject: string;
  text: string;
  html: string;
} {
  const { table, notes, orderId, createdTime } = normalizeReservationFields(reservation);
  const safeName = escapeHtml(reservation.customerName);
  const safePhone = escapeHtml(reservation.phone);
  const safeDate = escapeHtml(reservation.date);
  const safeTime = escapeHtml(reservation.time);
  const safeGuests = escapeHtml(reservation.guestCount);
  const safeTable = escapeHtml(table);
  const safeNotes = escapeHtml(notes);
  const safeOrderId = escapeHtml(orderId);
  const safeCreated = escapeHtml(createdTime);

  const subject = `[New Reservation] ${reservation.date} ${reservation.time} - ${reservation.customerName} (${reservation.guestCount} guests)`;
  const safeSubject = escapeHtml(subject);

  const text = [
    '【SABAY BBQ 沙貝燒烤 - 新預約訂位通知】',
    '',
    `顧客姓名：${reservation.customerName}`,
    `聯絡電話：${reservation.phone}`,
    `預約日期：${reservation.date}`,
    `預約時間：${reservation.time}`,
    `用餐人數：${reservation.guestCount} 位`,
    `預約桌號：${table}`,
    `特殊備註：${notes}`,
    `預約編號：${orderId}`,
    `登記時間：${createdTime}`,
    '',
    '請至管理後台進行預約確認與席位安排。',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 28px 32px; text-align: left;">
              <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                🔥 SABAY BBQ 新預約訂位通知
              </h1>
              <p style="margin: 0; font-size: 14px; color: #ffedd5; font-weight: 500;">
                收到新的顧客預約訂位，請盡速前往操作面板確認
              </p>
            </td>
          </tr>

          <!-- Key Meta Highlights -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; padding: 16px;">
                <tr>
                  <td width="50%" style="padding: 8px 12px;">
                    <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">預約日期 & 時間</div>
                    <div style="font-size: 18px; color: #f97316; font-weight: 700; margin-top: 4px;">${safeDate} ${safeTime}</div>
                  </td>
                  <td width="50%" style="padding: 8px 12px;">
                    <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">用餐人數</div>
                    <div style="font-size: 18px; color: #38bdf8; font-weight: 700; margin-top: 4px;">${safeGuests} 位大人/貴賓</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Detail Fields -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8; width: 100px;">顧客姓名</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #f8fafc; font-weight: 600;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8;">聯絡電話</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #f8fafc; font-weight: 600;">
                    <a href="tel:${safePhone}" style="color: #38bdf8; text-decoration: none;">${safePhone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8;">指定桌號</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #f8fafc; font-weight: 600;">${safeTable}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8;">特殊需求</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #fbbf24; font-weight: 500;">${safeNotes}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8;">預約單號</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8; font-family: monospace;">${safeOrderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8;">登記時間</td>
                  <td style="padding: 10px 0; color: #94a3b8;">${safeCreated}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Action -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 32px; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                此信件由 SABAY BBQ 系統自動發送，請登入管理後台進行確認。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

/**
 * Sends a push message via LINE Messaging API
 */
export async function sendLineReservationNotification(
  reservation: ReservationNotificationData,
  options?: NotificationOptions
): Promise<NotificationResult> {
  const messageText = formatLineReservationMessage(reservation);
  return dispatchLinePushMessage(
    messageText,
    'Notification:LINE',
    `reservation ${reservation.id || reservation.customerName}`,
    options
  );
}

/**
 * Sends an email notification via nodemailer with Gmail SMTP
 */
export async function sendGmailReservationNotification(
  reservation: ReservationNotificationData,
  options?: NotificationOptions
): Promise<NotificationResult> {
  const config = options?.notificationConfig;

  if (config?.gmailEnabled === false) {
    return { success: false, channel: 'Gmail', reason: 'disabled' };
  }

  const gmailUser = (config?.gmailUser || process.env.GMAIL_USER || '').trim();
  const rawPass = config?.gmailAppPass || process.env.GMAIL_APP_PASS || '';
  const gmailPass = rawPass.replace(/\s+/g, '').trim();

  if (!gmailUser || !gmailPass) {
    console.warn('[Notification:Gmail] Skipped: GMAIL_USER or GMAIL_APP_PASS is not configured.');
    return { success: false, channel: 'Gmail', reason: 'unconfigured' };
  }

  const { subject, text, html } = formatGmailReservationContent(reservation);
  const mailer = options?.nodemailerClient || nodemailer;

  try {
    const transporter = mailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    } as any);

    await transporter.sendMail({
      from: `"SABAY BBQ Reservation" <${gmailUser}>`,
      to: gmailUser,
      subject,
      text,
      html,
    });

    console.log(`[Notification:Gmail] Email sent successfully for reservation ${reservation.id || reservation.customerName}`);
    return { success: true, channel: 'Gmail' };
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    console.error(`[Notification:Gmail] Failed to send email: ${errorMsg}`);
    return { success: false, channel: 'Gmail', error: errorMsg };
  }
}

/**
 * Orchestrates sending notifications across LINE and Gmail in parallel using Promise.allSettled.
 * Never throws errors so customer reservation workflow will never be blocked or rolled back.
 */
export async function sendReservationNotifications(
  reservation: ReservationNotificationData,
  options?: NotificationOptions
): Promise<PromiseSettledResult<NotificationResult>[]> {
  console.log(`[Notification] Initiating reservation notification dispatch for ${reservation.customerName} (${reservation.date} ${reservation.time})`);

  const results = await Promise.allSettled([
    sendLineReservationNotification(reservation, options),
    sendGmailReservationNotification(reservation, options),
  ]);

  results.forEach((res) => {
    if (res.status === 'fulfilled') {
      const outcome = res.value;
      if (outcome.success) {
        console.log(`[Notification] Channel ${outcome.channel} delivered successfully.`);
      } else {
        console.log(`[Notification] Channel ${outcome.channel} not delivered: ${outcome.reason || outcome.error}`);
      }
    } else {
      console.error(`[Notification] Channel unexpected rejection:`, res.reason);
    }
  });

  return results;
}

/**
 * Sends a test notification to verify connection and credentials for LINE or Gmail
 */
export async function sendTestNotification(
  channel: 'LINE' | 'Gmail',
  config?: any,
  options?: NotificationOptions
): Promise<NotificationResult> {
  const now = new Date();
  const testReservation: ReservationNotificationData = {
    id: 'TEST-CONN',
    reservationNo: 'RES-TEST-001',
    customerName: '系統管理員 (連線測試)',
    phone: '0912345678',
    guestCount: 2,
    tableNumber: '1',
    date: getTaiwanDateString(now),
    time: '18:00',
    notes: '這是由管理後台發出的即時連線測試訊息，確認通知管道運作正常！',
    createdAt: formatTaiwanDateTime(now),
  };

  const opts: NotificationOptions = {
    ...options,
    notificationConfig: config,
  };

  if (channel === 'LINE') {
    return sendLineReservationNotification(testReservation, opts);
  } else {
    return sendGmailReservationNotification(testReservation, opts);
  }
}

/**
 * Formats a clean, structured text message for Order push notification
 */
export function formatLineOrderMessage(order: OrderNotificationData): string {
  const isGoogle = order.source === 'google_business';
  const header = isGoogle
    ? '🔔 【Google 商家新訂單通知】SABAY BBQ 沙貝燒烤'
    : '🔔 【新點餐訂單通知】SABAY BBQ 沙貝燒烤';

  const rawTableStr = String(order.tableNumber ?? '').trim();
  const isTakeout = Boolean(
    (rawTableStr && (rawTableStr.includes('外帶') || rawTableStr.toLowerCase() === 'takeout')) ||
    order.takeoutInfo
  );
  const tableStr = isTakeout ? `🛍️ 外帶訂單 (${rawTableStr || '外帶'})` : `🪑 桌號：${rawTableStr} 桌`;
  const originStr = isGoogle
    ? '🌐 渠道來源：Google 商家檔案 (Online Ordering)'
    : '📱 渠道來源：現場/官方掃碼';

  const customerStr = order.customerName
    ? `👤 顧客姓名：${order.customerName} (${order.customerPhone || '未留電話'})`
    : '';

  const itemsList = (order.items || [])
    .map((i: any) => {
      const name = typeof i.name === 'object' ? (i.name.zh || i.name.en || JSON.stringify(i.name)) : i.name;
      const q = i.qty || 1;
      return `• ${name} x${q} ($${i.price * q})`;
    })
    .slice(0, 15)
    .join('\n');
  const moreItems = (order.items || []).length > 15 ? `\n...其餘 ${(order.items || []).length - 15} 項餐點` : '';

  const createdTime = formatTaiwanDateTime(order.createdAt);

  const lines = [
    header,
    '━━━━━━━━━━━━━━━━━━━━',
    tableStr,
    `💰 訂單金額：$${order.total} 元`,
    originStr,
    customerStr,
    `🆔 訂單編號：${order.id}`,
    `⏱️ 下單時間：${createdTime}`,
    '📋 餐點明細：',
    itemsList + moreItems,
    '━━━━━━━━━━━━━━━━━━━━',
    '🍳 廚房 KDS 與收銀終端已即時同步，請現場確認接單！',
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Sends an order push message via LINE Messaging API
 */
export async function sendOrderNotification(
  order: OrderNotificationData,
  options?: NotificationOptions
): Promise<NotificationResult> {
  const messageText = formatLineOrderMessage(order);
  return dispatchLinePushMessage(
    messageText,
    'Notification:LINE:Order',
    `order #${order.id}`,
    options
  );
}
