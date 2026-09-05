import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  escapeHtml,
  formatLineReservationMessage,
  formatGmailReservationContent,
  sendLineReservationNotification,
  sendGmailReservationNotification,
  sendReservationNotifications,
  sendTestNotification,
  type ReservationNotificationData,
  type NotificationOptions
} from '../../../functions/src/services/notification';

const mockSendMail = vi.fn();
const mockCreateTransport = vi.fn(() => ({
  sendMail: mockSendMail
}));
const mockPost = vi.fn();

const testOptions: NotificationOptions = {
  axiosClient: {
    post: mockPost
  },
  nodemailerClient: {
    createTransport: mockCreateTransport
  }
};

describe('Notification Service', () => {
  const sampleReservation: ReservationNotificationData = {
    id: 'res-test-123',
    customerName: '陳大明 <script>alert("xss")</script>',
    phone: '0912345678',
    guestCount: 4,
    tableNumber: 'A1, A2',
    date: '2026-09-10',
    time: '18:30',
    status: 'pending',
    notes: '需要兒童椅 & 靠窗座位',
    createdAt: '2026-09-05T12:00:00.000Z',
    reservationNo: 'R20260910-001'
  };

  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('escapeHtml', () => {
    it('should correctly escape special HTML characters', () => {
      expect(escapeHtml('<script>alert("hello & bye")</script>')).toBe(
        '&lt;script&gt;alert(&quot;hello &amp; bye&quot;)&lt;/script&gt;'
      );
      expect(escapeHtml("it's dangerous")).toBe('it&#39;s dangerous');
    });

    it('should handle null and undefined safely', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('formatLineReservationMessage', () => {
    it('should format all reservation details into a structured LINE push message', () => {
      const msg = formatLineReservationMessage(sampleReservation);
      expect(msg).toContain('🔔 【新預約訂位通知】SABAY BBQ 沙貝燒烤');
      expect(msg).toContain('👤 顧客姓名：陳大明 <script>alert("xss")</script>');
      expect(msg).toContain('📞 聯絡電話：0912345678');
      expect(msg).toContain('📅 預約日期：2026-09-10');
      expect(msg).toContain('⏰ 預約時間：18:30');
      expect(msg).toContain('👥 用餐人數：4 位');
      expect(msg).toContain('🪑 預約桌號：A1, A2 桌');
      expect(msg).toContain('📝 特殊備註：需要兒童椅 & 靠窗座位');
      expect(msg).toContain('🆔 預約編號：R20260910-001');
    });

    it('should provide sensible fallbacks when optional fields are empty', () => {
      const minimalReservation: ReservationNotificationData = {
        customerName: '李小美',
        phone: '0987654321',
        guestCount: 2,
        date: '2026-09-12',
        time: '19:00'
      };
      const msg = formatLineReservationMessage(minimalReservation);
      expect(msg).toContain('🪑 預約桌號：未指定 / 待安排');
      expect(msg).toContain('📝 特殊備註：無特殊備註');
      expect(msg).toContain('🆔 預約編號：N/A');
    });
  });

  describe('formatGmailReservationContent', () => {
    it('should format the subject line accurately according to specs', () => {
      const { subject } = formatGmailReservationContent(sampleReservation);
      expect(subject).toBe('[New Reservation] 2026-09-10 18:30 - 陳大明 <script>alert("xss")</script> (4 guests)');
    });

    it('should escape HTML in the email body and title to prevent injection attacks', () => {
      const { html } = formatGmailReservationContent(sampleReservation);
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(html).toContain('2026-09-10 18:30');
      expect(html).toContain('4 位大人/貴賓');
      expect(html).toContain('A1, A2 桌');
      expect(html).toContain('需要兒童椅 &amp; 靠窗座位');
    });

    it('should generate a complete plain text fallback', () => {
      const { text } = formatGmailReservationContent(sampleReservation);
      expect(text).toContain('顧客姓名：陳大明 <script>alert("xss")</script>');
      expect(text).toContain('聯絡電話：0912345678');
      expect(text).toContain('預約日期：2026-09-10');
      expect(text).toContain('預約時間：18:30');
      expect(text).toContain('用餐人數：4 位');
    });
  });

  describe('sendLineReservationNotification', () => {
    it('should skip gracefully when environment variables are missing', async () => {
      delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
      delete process.env.LINE_ADMIN_USER_ID;

      const result = await sendLineReservationNotification(sampleReservation, testOptions);
      expect(result.success).toBe(false);
      expect(result.channel).toBe('LINE');
      expect(result.reason).toBe('unconfigured');
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('should send push message when credentials are provided', async () => {
      process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test-token-123';
      process.env.LINE_ADMIN_USER_ID = 'U1234567890';
      mockPost.mockResolvedValueOnce({ data: {} });

      const result = await sendLineReservationNotification(sampleReservation, testOptions);
      expect(result.success).toBe(true);
      expect(result.channel).toBe('LINE');
      expect(mockPost).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        expect.objectContaining({
          to: 'U1234567890',
          messages: [
            expect.objectContaining({
              type: 'text'
            })
          ]
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123'
          })
        })
      );
    });

    it('should handle API errors without throwing', async () => {
      process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test-token-123';
      process.env.LINE_ADMIN_USER_ID = 'U1234567890';
      mockPost.mockRejectedValueOnce({
        response: { data: { message: 'Invalid token' } }
      });

      const result = await sendLineReservationNotification(sampleReservation, testOptions);
      expect(result.success).toBe(false);
      expect(result.channel).toBe('LINE');
      expect(result.error).toContain('Invalid token');
    });
  });

  describe('sendGmailReservationNotification', () => {
    it('should skip gracefully when Gmail credentials are missing', async () => {
      delete process.env.GMAIL_USER;
      delete process.env.GMAIL_APP_PASS;

      const result = await sendGmailReservationNotification(sampleReservation, testOptions);
      expect(result.success).toBe(false);
      expect(result.channel).toBe('Gmail');
      expect(result.reason).toBe('unconfigured');
      expect(mockCreateTransport).not.toHaveBeenCalled();
    });

    it('should send email when credentials are provided', async () => {
      process.env.GMAIL_USER = 'sabay.bbq@gmail.com';
      process.env.GMAIL_APP_PASS = 'abcd efgh ijkl mnop';
      mockSendMail.mockResolvedValueOnce({ messageId: 'msg-123' });

      const result = await sendGmailReservationNotification(sampleReservation, testOptions);
      expect(result.success).toBe(true);
      expect(result.channel).toBe('Gmail');
      expect(mockCreateTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'sabay.bbq@gmail.com',
          pass: 'abcdefghijklmnop'
        }
      });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"SABAY BBQ Reservation" <sabay.bbq@gmail.com>',
          to: 'sabay.bbq@gmail.com',
          subject: expect.stringContaining('[New Reservation]')
        })
      );
    });

    it('should catch sendMail errors and return failure without throwing', async () => {
      process.env.GMAIL_USER = 'sabay.bbq@gmail.com';
      process.env.GMAIL_APP_PASS = 'abcd efgh ijkl mnop';
      mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));

      const result = await sendGmailReservationNotification(sampleReservation, testOptions);
      expect(result.success).toBe(false);
      expect(result.channel).toBe('Gmail');
      expect(result.error).toBe('SMTP connection failed');
    });
  });

  describe('sendReservationNotifications orchestrator', () => {
    it('should execute both channels and return settled results safely', async () => {
      process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test-token';
      process.env.LINE_ADMIN_USER_ID = 'user-123';
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASS = 'pass-123';

      mockPost.mockResolvedValueOnce({ data: {} });
      mockSendMail.mockResolvedValueOnce({});

      const results = await sendReservationNotifications(sampleReservation, testOptions);
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');

      if (results[0].status === 'fulfilled') {
        expect(results[0].value.success).toBe(true);
      }
      if (results[1].status === 'fulfilled') {
        expect(results[1].value.success).toBe(true);
      }
    });

    it('should not throw even when one or both notifications fail', async () => {
      delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
      delete process.env.GMAIL_USER;

      const results = await sendReservationNotifications(sampleReservation, testOptions);
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      if (results[0].status === 'fulfilled') {
        expect(results[0].value.reason).toBe('unconfigured');
      }
    });

    it('should respect dynamic notificationConfig over environment variables', async () => {
      process.env.LINE_CHANNEL_ACCESS_TOKEN = 'env-token';
      process.env.LINE_ADMIN_USER_ID = 'env-admin';

      const customOptions: NotificationOptions = {
        ...testOptions,
        notificationConfig: {
          lineToken: 'firestore-token',
          lineAdminId: 'firestore-admin'
        }
      };

      mockPost.mockResolvedValueOnce({ status: 200, data: {} });

      const result = await sendLineReservationNotification(sampleReservation, customOptions);
      expect(result.success).toBe(true);
      expect(mockPost).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        expect.objectContaining({ to: 'firestore-admin' }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer firestore-token'
          })
        })
      );
    });

    it('should skip notification when channel toggle is set to false', async () => {
      process.env.LINE_CHANNEL_ACCESS_TOKEN = 'token';
      process.env.LINE_ADMIN_USER_ID = 'admin';

      const disabledOptions: NotificationOptions = {
        ...testOptions,
        notificationConfig: {
          lineEnabled: false
        }
      };

      const result = await sendLineReservationNotification(sampleReservation, disabledOptions);
      expect(result.success).toBe(false);
      expect(result.reason).toBe('disabled');
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('sendTestNotification', () => {
    it('should send test push message for LINE channel', async () => {
      mockPost.mockResolvedValueOnce({ status: 200, data: {} });
      const result = await sendTestNotification(
        'LINE',
        { lineToken: 'test-token', lineAdminId: 'test-admin' },
        testOptions
      );
      expect(result.success).toBe(true);
      expect(result.channel).toBe('LINE');
    });

    it('should send test email for Gmail channel', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: 'msg-test' });
      const result = await sendTestNotification(
        'Gmail',
        { gmailUser: 'admin@gmail.com', gmailAppPass: '1234 5678 9012 3456' },
        testOptions
      );
      expect(result.success).toBe(true);
      expect(result.channel).toBe('Gmail');
      expect(mockCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: {
            user: 'admin@gmail.com',
            pass: '1234567890123456'
          }
        })
      );
    });
  });
});
