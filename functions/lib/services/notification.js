"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = escapeHtml;
exports.formatLineReservationMessage = formatLineReservationMessage;
exports.formatGmailReservationContent = formatGmailReservationContent;
exports.sendLineReservationNotification = sendLineReservationNotification;
exports.sendGmailReservationNotification = sendGmailReservationNotification;
exports.sendReservationNotifications = sendReservationNotifications;
exports.sendTestNotification = sendTestNotification;
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
function escapeHtml(str) {
    if (str === null || str === undefined)
        return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function formatLineReservationMessage(reservation) {
    const table = reservation.tableNumber ? `${reservation.tableNumber} 桌` : '未指定 / 待安排';
    const notes = reservation.notes?.trim() ? reservation.notes.trim() : '無特殊備註';
    const orderId = reservation.reservationNo || reservation.id || 'N/A';
    const createdTime = reservation.createdAt || new Date().toISOString();
    return [
        '🔔 【新預約訂位通知】SABAY BBQ 沙貝燒烤',
        '━━━━━━━━━━━━━━━━━━━━',
        `👤 顧客姓名：${reservation.customerName}`,
        `📞 聯絡電話：${reservation.phone}`,
        `📅 預約日期：${reservation.date}`,
        `⏰ 預約時間：${reservation.time}`,
        `👥 用餐人數：${reservation.guestCount} 位`,
        `🪑 預約桌號：${table}`,
        `📝 特殊備註：${notes}`,
        `🆔 預約編號：${orderId}`,
        `⏱️ 登記時間：${createdTime}`,
        '━━━━━━━━━━━━━━━━━━━━',
        '💡 請至管理後台【操作面板】確認預約並保留席位。'
    ].join('\n');
}
function formatGmailReservationContent(reservation) {
    const safeName = escapeHtml(reservation.customerName);
    const safePhone = escapeHtml(reservation.phone);
    const safeDate = escapeHtml(reservation.date);
    const safeTime = escapeHtml(reservation.time);
    const safeGuests = escapeHtml(reservation.guestCount);
    const safeTable = reservation.tableNumber ? `${escapeHtml(reservation.tableNumber)} 桌` : '未指定 / 待安排';
    const safeNotes = reservation.notes?.trim() ? escapeHtml(reservation.notes.trim()) : '無特殊備註';
    const safeOrderId = escapeHtml(reservation.reservationNo || reservation.id || 'N/A');
    const safeCreated = escapeHtml(reservation.createdAt || new Date().toISOString());
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
        `預約桌號：${reservation.tableNumber ? reservation.tableNumber + ' 桌' : '未指定 / 待安排'}`,
        `特殊備註：${reservation.notes?.trim() || '無'}`,
        `預約編號：${reservation.reservationNo || reservation.id || 'N/A'}`,
        `登記時間：${reservation.createdAt || new Date().toISOString()}`,
        '',
        '請至管理後台進行預約確認與席位安排。'
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
async function sendLineReservationNotification(reservation, options) {
    const config = options?.notificationConfig;
    if (config?.lineEnabled === false) {
        return {
            success: false,
            channel: 'LINE',
            reason: 'disabled'
        };
    }
    const token = (config?.lineToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();
    const adminId = (config?.lineAdminId || process.env.LINE_ADMIN_USER_ID || '').trim();
    if (!token || !adminId) {
        console.warn('[Notification:LINE] Skipped: LINE channel token or admin user ID is not configured.');
        return {
            success: false,
            channel: 'LINE',
            reason: 'unconfigured'
        };
    }
    const messageText = formatLineReservationMessage(reservation);
    const client = options?.axiosClient || axios_1.default;
    try {
        await client.post('https://api.line.me/v2/bot/message/push', {
            to: adminId,
            messages: [
                {
                    type: 'text',
                    text: messageText
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            timeout: 8000
        });
        console.log(`[Notification:LINE] Push sent successfully for reservation ${reservation.id || reservation.customerName}`);
        return { success: true, channel: 'LINE' };
    }
    catch (err) {
        const errorDetails = err?.response?.data ? JSON.stringify(err.response.data) : err.message || String(err);
        console.error(`[Notification:LINE] Failed to send push message: ${errorDetails}`);
        return {
            success: false,
            channel: 'LINE',
            error: errorDetails
        };
    }
}
async function sendGmailReservationNotification(reservation, options) {
    const config = options?.notificationConfig;
    if (config?.gmailEnabled === false) {
        return {
            success: false,
            channel: 'Gmail',
            reason: 'disabled'
        };
    }
    const gmailUser = (config?.gmailUser || process.env.GMAIL_USER || '').trim();
    const rawPass = config?.gmailAppPass || process.env.GMAIL_APP_PASS || '';
    const gmailPass = rawPass.replace(/\s+/g, '').trim();
    if (!gmailUser || !gmailPass) {
        console.warn('[Notification:Gmail] Skipped: GMAIL_USER or GMAIL_APP_PASS is not configured.');
        return {
            success: false,
            channel: 'Gmail',
            reason: 'unconfigured'
        };
    }
    const { subject, text, html } = formatGmailReservationContent(reservation);
    const mailer = options?.nodemailerClient || nodemailer_1.default;
    try {
        const transporter = mailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass
            }
        });
        await transporter.sendMail({
            from: `"SABAY BBQ Reservation" <${gmailUser}>`,
            to: gmailUser,
            subject,
            text,
            html
        });
        console.log(`[Notification:Gmail] Email sent successfully for reservation ${reservation.id || reservation.customerName}`);
        return { success: true, channel: 'Gmail' };
    }
    catch (err) {
        const errorMsg = err.message || String(err);
        console.error(`[Notification:Gmail] Failed to send email: ${errorMsg}`);
        return {
            success: false,
            channel: 'Gmail',
            error: errorMsg
        };
    }
}
async function sendReservationNotifications(reservation, options) {
    console.log(`[Notification] Initiating reservation notification dispatch for ${reservation.customerName} (${reservation.date} ${reservation.time})`);
    const results = await Promise.allSettled([
        sendLineReservationNotification(reservation, options),
        sendGmailReservationNotification(reservation, options)
    ]);
    results.forEach((res) => {
        if (res.status === 'fulfilled') {
            const outcome = res.value;
            if (outcome.success) {
                console.log(`[Notification] Channel ${outcome.channel} delivered successfully.`);
            }
            else {
                console.log(`[Notification] Channel ${outcome.channel} not delivered: ${outcome.reason || outcome.error}`);
            }
        }
        else {
            console.error(`[Notification] Channel unexpected rejection:`, res.reason);
        }
    });
    return results;
}
async function sendTestNotification(channel, config, options) {
    const testReservation = {
        id: 'TEST-CONN',
        reservationNo: 'RES-TEST-001',
        customerName: '系統管理員 (連線測試)',
        phone: '0912345678',
        guestCount: 2,
        tableNumber: '1',
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        notes: '這是由管理後台發出的即時連線測試訊息，確認通知管道運作正常！',
        createdAt: new Date().toISOString()
    };
    const opts = {
        ...options,
        notificationConfig: config
    };
    if (channel === 'LINE') {
        return sendLineReservationNotification(testReservation, opts);
    }
    else {
        return sendGmailReservationNotification(testReservation, opts);
    }
}
//# sourceMappingURL=notification.js.map