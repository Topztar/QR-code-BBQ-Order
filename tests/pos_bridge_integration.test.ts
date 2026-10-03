import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkPOSBridgeHealth,
  openCashDrawerViaBridge,
  printViaBridge,
  normalizePort,
  cleanPrintTextForWindows,
  DEFAULT_POS_BRIDGE_URL
} from '../src/lib/posBridgeClient';

describe('POS Bridge Client Integration Tests', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Utility Functions', () => {
    it('normalizes port strings correctly', () => {
      expect(normalizePort('lpt1')).toBe('LPT1:');
      expect(normalizePort('LPT2')).toBe('LPT2:');
      expect(normalizePort('COM1')).toBe('COM1'); // non-LPT remains unchanged except trim
      expect(normalizePort(' LPT3: ')).toBe('LPT3:');
      expect(normalizePort('')).toBe('LPT1:');
    });

    it('cleans print text for Windows safely (Emoji stripping)', () => {
      const rawText = 'Hello 🌍! Order 123 🍔 [TEST]';
      const clean = cleanPrintTextForWindows(rawText);
      expect(clean).toBe('Hello ! Order 123  [TEST]');
    });
  });

  describe('Server Lifecycle & Health', () => {
    it('checks health successfully when bridge is online', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'online', success: true, service: 'LOCAL-PRINTER-POS-BRIDGE (Node.js)' })
      });

      const promise = checkPOSBridgeHealth();
      const res = await promise;
      
      expect(res.online).toBe(true);
      expect(res.data.service).toContain('LOCAL-PRINTER-POS-BRIDGE');
      expect(mockFetch).toHaveBeenCalledWith(`${DEFAULT_POS_BRIDGE_URL}/health`, expect.objectContaining({
        method: 'GET'
      }));
    });

    it('handles offline or timeout scenarios gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const res = await checkPOSBridgeHealth();
      expect(res.online).toBe(false);
      expect(res.error).toContain('Network error');
    });
  });

  describe('Cash Drawer Pulse', () => {
    it('dispatches open_drawer command with correct payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Pulse sent', port: 'LPT1:' })
      });

      const res = await openCashDrawerViaBridge('lpt1');
      expect(res.success).toBe(true);
      
      // Verify payload
      const fetchCall = mockFetch.mock.calls[0];
      const reqInit = fetchCall[1];
      const body = JSON.parse(reqInit.body);
      
      expect(body.action).toBe('open_drawer');
      expect(body.port).toBe('LPT1:');
    });
  });

  describe('Network TCP Socket Forwarding & Printing', () => {
    it('dispatches print command to an IP printer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, bytesSent: 1024, drawerOpened: false })
      });

      const res = await printViaBridge({
        text: 'Test receipt',
        ip: '192.168.1.100',
        connectionType: 'IP',
        autoOpenDrawer: false
      });

      expect(res.success).toBe(true);
      
      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      
      expect(body.ip).toBe('192.168.1.100');
      expect(body.connectionType).toBe('IP');
      expect(body.text).toBe('Test receipt');
      expect(body.autoOpenDrawer).toBe(false);
    });

    it('dispatches hex/base64 buffer to LPT1: with drawer open flag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, drawerOpened: true })
      });

      const res = await printViaBridge({
        base64: 'SGVsbG8=',
        port: 'LPT1',
        autoOpenDrawer: true
      });

      expect(res.success).toBe(true);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.base64).toBe('SGVsbG8=');
      expect(body.port).toBe('LPT1:');
      expect(body.autoOpenDrawer).toBe(true);
    });
  });
});
