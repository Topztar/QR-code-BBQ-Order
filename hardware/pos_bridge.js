/**
 * LOCAL-PRINTER-POS-BRIDGE (Node.js 版本)
 * =========================================
 * 具備完整 CORS、Firefox PNA 標頭、二進位寫入及 TCP Socket 轉發功能
 */

const http = require('http');
const fs = require('fs');
const net = require('net');

const PORT = process.env.PORT || 8060;
const ESC_POS_INIT = Buffer.from([0x1B, 0x40, 0x1C, 0x26, 0x1C, 0x43, 0x01]);
const ESC_POS_CUT = Buffer.from([0x1D, 0x56, 0x00]);
const ESC_POS_DRAWER_PULSE = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]);

let iconv;
try {
  iconv = require('iconv-lite');
} catch {
  iconv = null;
}

function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
}

function encodeText(text) {
  const clean = sanitizeText(text);
  if (iconv) {
    try {
      return iconv.encode(clean, 'big5');
    } catch {
      try {
        return iconv.encode(clean, 'gb18030');
      } catch {
        return Buffer.from(clean, 'utf-8');
      }
    }
  }
  return Buffer.from(clean, 'utf-8');
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Access-Control-Request-Private-Network');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sendToNetwork(ip, port, data, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);
    socket.on('connect', () => {
      socket.write(data, (err) => {
        if (settled) return;
        settled = true;
        if (err) {
          cleanup();
          resolve({ success: false, log: `Socket 寫入失敗: ${err.message}` });
        } else {
          socket.end();
          cleanup();
          resolve({ success: true, log: `成功傳送 ${data.length} 位元組至 ${ip}:${port}` });
        }
      });
    });

    socket.on('timeout', () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ success: false, log: `連線至 ${ip}:${port} 逾時 (${timeoutMs}ms)` });
    });

    socket.on('error', (err) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ success: false, log: `Socket 錯誤: ${err.message}` });
    });

    socket.connect(port, ip);
  });
}

function writeToLocalPort(port, data) {
  return new Promise((resolve) => {
    let cleanPort = (port || 'LPT1:').trim();
    if (cleanPort.toUpperCase().startsWith('LPT') && !cleanPort.includes(':')) {
      cleanPort = `${cleanPort.toUpperCase()}:`;
    }

    fs.open(cleanPort, 'w', (openErr, fd) => {
      if (openErr) {
        return resolve({ success: false, log: `開啟埠口 ${cleanPort} 失敗: ${openErr.message}` });
      }
      fs.write(fd, data, 0, data.length, null, (writeErr) => {
        fs.close(fd, () => {});
        if (writeErr) {
          return resolve({ success: false, log: `寫入埠口 ${cleanPort} 失敗: ${writeErr.message}` });
        }
        resolve({ success: true, log: `成功以二進位模式寫入 ${data.length} 位元組至 ${cleanPort}` });
      });
    });
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url.replace(/\/+$/, '') || '/';

  if (req.method === 'GET' && (url === '/' || url === '/health' || url === '/status')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'online',
      success: true,
      service: 'LOCAL-PRINTER-POS-BRIDGE (Node.js)',
      version: '2.1.0'
    }));
  }

  if (req.method === 'POST') {
    let bodyStr = '';
    req.on('data', (chunk) => { bodyStr += chunk; });
    req.on('end', async () => {
      let payload = {};
      try { payload = JSON.parse(bodyStr); } catch {}

      if (url === '/open-drawer' || url === '/api/printer/open-drawer') {
        const port = payload.port || 'LPT1:';
        const ip = payload.ip;
        let result;
        if (payload.connectionType === 'IP' && ip) {
          result = await sendToNetwork(ip, payload.netPort || 9100, ESC_POS_DRAWER_PULSE);
        } else {
          result = await writeToLocalPort(port, ESC_POS_DRAWER_PULSE);
        }
        res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
          success: result.success,
          message: result.success ? '收銀抽屜開箱脈衝已發送' : result.log,
          port,
          drawerOpened: result.success
        }));
      }

      if (url === '/print' || url === '/api/printer/test' || url === '/api/printer/print') {
        const port = payload.port || 'LPT1:';
        const ip = payload.ip;
        const connType = payload.connectionType || (ip ? 'IP' : 'LPT');
        const autoOpen = !!payload.autoOpenDrawer;

        let buffer;
        if (payload.base64) {
          buffer = Buffer.from(payload.base64, 'base64');
        } else if (payload.hex) {
          buffer = Buffer.from(payload.hex.replace(/[^0-9A-Fa-f]/g, ''), 'hex');
        } else if (payload.text) {
          buffer = Buffer.concat([
            ESC_POS_INIT,
            encodeText(payload.text),
            Buffer.from('\n\n\n'),
            ESC_POS_CUT
          ]);
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: '缺少列印內容 (text/base64/hex)' }));
        }

        if (autoOpen) {
          buffer = Buffer.concat([buffer, ESC_POS_DRAWER_PULSE]);
        }

        let result;
        if (connType === 'IP' && ip) {
          result = await sendToNetwork(ip, payload.netPort || 9100, buffer);
        } else {
          result = await writeToLocalPort(port, buffer);
        }

        res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
          success: result.success,
          message: result.success ? '列印指令已成功寫入' : result.log,
          bytesSent: buffer.length,
          port,
          drawerOpened: autoOpen && result.success
        }));
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[POS-Bridge Node] Listening on http://127.0.0.1:${PORT}`);
});
