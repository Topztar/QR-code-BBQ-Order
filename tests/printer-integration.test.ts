import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printCustomerReceipt, triggerRealCashDrawer } from '../hardware/printerDriver';
import fs from 'fs';
import net from 'net';
import { SerialPort } from 'serialport';

vi.mock('fs');
vi.mock('net');
vi.mock('serialport', () => {
  const MockSerialPort = vi.fn().mockImplementation(function (config: any) {
    return {
      config,
      open: vi.fn((cb: any) => { if (cb) cb(null); }),
      on: vi.fn(),
      write: vi.fn((data: any, cb: any) => { if (cb) cb(null); }),
      drain: vi.fn((cb: any) => { if (cb) cb(null); }),
      close: vi.fn()
    };
  });
  return {
    SerialPort: MockSerialPort,
    default: { SerialPort: MockSerialPort }
  };
});

describe('Printer Integration and Cash Drawer Trigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly trigger ESC_POS_RAW over IP only once during receipt printing', async () => {
    const mockSockets: any[] = [];
    (net.Socket as any).mockImplementation(function() {
      const mockSocket = {
        connect: vi.fn(),
        write: vi.fn((data, cb) => { if (cb) cb(null); }),
        end: vi.fn((cb) => { if (typeof cb === 'function') cb(); }),
        on: vi.fn(),
        setTimeout: vi.fn(),
        destroy: vi.fn(),
        removeAllListeners: vi.fn()
      };
      
      mockSocket.connect.mockImplementation((port, ip) => {
         const onConnect = mockSocket.on.mock.calls.find(call => call[0] === 'connect');
         if (onConnect) onConnect[1]();
      });

      mockSockets.push(mockSocket);
      return mockSocket;
    });

    const settings = {
      ip: '192.168.1.100',
      connectionType: 'IP' as const,
      cashDrawerEnabled: true,
      cashDrawerDriver: 'ESC_POS_RAW' as const,
      cashDrawerEscPosCommand: '1B700119FA'
    };

    const res = await printCustomerReceipt('Test Receipt', settings);
    
    expect(res.success).toBe(true);
    // Over network, printCustomerReceipt calls sendToNetworkPrinter.
    // It should also call triggerRealCashDrawer internally which calls sendToNetworkPrinter again.
    // Meaning net.Socket.write should be called twice: once for receipt, once for drawer pulse.
    expect(mockSockets[0].write).toHaveBeenCalledTimes(1);
    expect(mockSockets[1].write).toHaveBeenCalledTimes(1);
    
    // First write is receipt
    expect(mockSockets[0].write.mock.calls[0][0].toString('utf8')).toContain('Test Receipt');
    
    // Second write is cash drawer command
    const hexPulse = mockSockets[1].write.mock.calls[0][0].toString('hex').toUpperCase();
    expect(hexPulse).toContain('1B700119FA');
  });

  it('should pass drawer settings to sendToSerialPrinter and trigger it on LPT success', async () => {
    vi.mocked(fs.writeFile).mockImplementation(((path: any, data: any, cb: any) => {
      cb(null);
    }) as any);

    const settings = {
      connectionType: 'LPT' as const,
      usbPort: 'LPT1:',
      cashDrawerEnabled: true,
      cashDrawerDriver: 'ESC_POS_RAW' as const,
      cashDrawerEscPosCommand: '1B700019FA'
    };

    const res = await printCustomerReceipt('LPT Receipt', settings);
    expect(res.success).toBe(true);
    
    // It should call fs.writeFile twice: once for the receipt, once for the drawer pulse.
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fs.writeFile).mock.calls[0][0]).toBe('LPT1:');
    expect(Buffer.from(vi.mocked(fs.writeFile).mock.calls[0][1] as any).toString('utf8')).toContain('LPT Receipt');

    // Second write is cash drawer command
    const hexPulse = Buffer.from(vi.mocked(fs.writeFile).mock.calls[1][1] as any).toString('hex').toUpperCase();
    expect(hexPulse).toContain('1B700019FA');
  });
  
  it('should respect custom cash drawer pulse command', async () => {
     let mockSocket: any;
     (net.Socket as any).mockImplementation(function() {
      mockSocket = {
        connect: vi.fn(),
        write: vi.fn((data, cb) => { if (cb) cb(null); }),
        end: vi.fn((cb) => { if (typeof cb === 'function') cb(); }),
        on: vi.fn(),
        setTimeout: vi.fn(),
        destroy: vi.fn(),
        removeAllListeners: vi.fn()
      };
      
      mockSocket.connect.mockImplementation((port: any, ip: any) => {
         const onConnect = mockSocket.on.mock.calls.find((call: any) => call[0] === 'connect');
         if (onConnect) onConnect[1]();
      });

      return mockSocket;
    });

    await triggerRealCashDrawer({
       cashDrawerDriver: 'ESC_POS_RAW',
       cashDrawerEscPosCommand: '1B700220AA',
       ip: '10.0.0.1',
       connectionType: 'IP'
    });

    expect(mockSocket.write).toHaveBeenCalledTimes(1);
    const hexPulse = mockSocket.write.mock.calls[0][0].toString('hex').toUpperCase();
    expect(hexPulse).toBe('1B700220AA');
  });

  it('should NOT trigger cash drawer when cashDrawerEnabled is false', async () => {
    const mockSockets: any[] = [];
    (net.Socket as any).mockImplementation(function() {
      const mockSocket = {
        connect: vi.fn(),
        write: vi.fn((data, cb) => { if (cb) cb(null); }),
        end: vi.fn((cb) => { if (typeof cb === 'function') cb(); }),
        on: vi.fn(),
        setTimeout: vi.fn(),
        destroy: vi.fn(),
        removeAllListeners: vi.fn()
      };
      
      mockSocket.connect.mockImplementation((port, ip) => {
         const onConnect = mockSocket.on.mock.calls.find(call => call[0] === 'connect');
         if (onConnect) onConnect[1]();
      });

      mockSockets.push(mockSocket);
      return mockSocket;
    });

    const settings = {
      ip: '192.168.1.100',
      connectionType: 'IP' as const,
      cashDrawerEnabled: false,
      cashDrawerDriver: 'ESC_POS_RAW' as const,
      cashDrawerEscPosCommand: '1B700119FA'
    };

    const res = await printCustomerReceipt('No Drawer Receipt', settings);
    expect(res.success).toBe(true);
    // Over network, only 1 write should occur (receipt only, no cash drawer pulse)
    expect(mockSockets).toHaveLength(1);
    expect(mockSockets[0].write).toHaveBeenCalledTimes(1);
    expect(mockSockets[0].write.mock.calls[0][0].toString('utf8')).toContain('No Drawer Receipt');
  });

  it('should dispatch receipt and pulse via SerialPort when connectionType is USB', async () => {
    const mockWrite = vi.fn((data: any, cb: any) => { if (cb) cb(null); });
    const mockDrain = vi.fn((cb: any) => { if (cb) cb(null); });
    const mockClose = vi.fn();
    const mockOpen = vi.fn((cb: any) => { if (cb) cb(null); });
    
    vi.mocked(SerialPort).mockImplementation(function(this: any, config: any) {
      this.config = config;
      this.open = mockOpen;
      this.on = vi.fn();
      this.write = mockWrite;
      this.drain = mockDrain;
      this.close = mockClose;
      return this;
    } as any);

    const settings = {
      connectionType: 'USB' as const,
      usbPort: 'COM3',
      cashDrawerEnabled: true,
      cashDrawerDriver: 'ESC_POS_RAW' as const,
      cashDrawerEscPosCommand: '1B700019FA'
    };

    const res = await printCustomerReceipt('Serial Receipt', settings);
    expect(res.success).toBe(true);
    expect(SerialPort).toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalled();
    expect(mockWrite).toHaveBeenCalled();
  });
});
