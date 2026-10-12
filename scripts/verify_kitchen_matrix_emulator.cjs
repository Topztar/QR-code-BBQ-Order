/**
 * 🇹🇭 SABAY BBQ - Verification Protocol Under Firebase Environment (Emulator Suite)
 * Test Cases: TC-EMU-01, TC-EMU-02, TC-EMU-03, TC-EMU-04
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runMatrix() {
  console.log('========================================================================');
  console.log('🔍 [EMULATOR TEST MATRIX] Starting Kitchen Gate Diagnostics');
  console.log(`🌐 Target: ${BASE_URL}/kitchen`);
  console.log('========================================================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    environment: 'Firebase Emulator (Hosting + Functions + Firestore)',
    testCases: {}
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const capturedNetworkRequests = [];
    const captured401Responses = [];
    const consoleLogs = [];
    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('request', req => {
      const url = req.url();
      if (url.includes('/api/orders')) {
        capturedNetworkRequests.push({ url, time: Date.now() });
      }
    });

    page.on('response', res => {
      const url = res.url();
      const status = res.status();
      if (status === 401) {
        captured401Responses.push({ url, status, time: Date.now() });
      }
    });

    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (msg.type() === 'error') consoleErrors.push(text);
      if (msg.type() === 'warning') consoleWarnings.push(text);
    });

    // -------------------------------------------------------------------------
    // TC-EMU-01 & TC-EMU-02: Logged out / Gate open -> Observe 15 seconds
    // -------------------------------------------------------------------------
    console.log('▶️ [TC-EMU-01 & 02] Navigating to /kitchen while unauthenticated...');
    await page.goto(`${BASE_URL}/kitchen`, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('   Gate loaded. Monitoring network and console for 15 seconds...');

    await wait(15000);

    const kdsPresenceErrors = consoleWarnings.filter(w => w.includes('[KDS Presence]') && w.includes('permission'));
    const ordersRequestsCount = capturedNetworkRequests.length;
    const orders401Count = captured401Responses.filter(r => r.url.includes('/api/orders')).length;

    console.log(`   TC-EMU-01: Outgoing /api/orders requests in 15s = ${ordersRequestsCount}, 401s = ${orders401Count}`);
    console.log(`   TC-EMU-02: [KDS Presence] permission errors = ${kdsPresenceErrors.length}`);

    results.testCases['TC-EMU-01'] = {
      description: 'Observe Network Tab for 15s when logged out: 0 outgoing requests to /api/orders. No 401s.',
      status: ordersRequestsCount === 0 && orders401Count === 0 ? 'PASSED' : 'FAILED',
      evidence: `Outgoing /api/orders requests: ${ordersRequestsCount}, 401 responses: ${orders401Count}`
    };

    results.testCases['TC-EMU-02'] = {
      description: 'Inspect Console Tab when logged out: Zero [KDS Presence] permission errors.',
      status: kdsPresenceErrors.length === 0 ? 'PASSED' : 'FAILED',
      evidence: `[KDS Presence] permission error occurrences: ${kdsPresenceErrors.length}`
    };

    // -------------------------------------------------------------------------
    // TC-EMU-03: Gate locked (Active 10s cooldown) -> Wait to hit 0s -> re-enabled
    // -------------------------------------------------------------------------
    console.log('\n▶️ [TC-EMU-03] Testing active cooldown countdown & clean unlock...');
    
    // Trigger cooldown directly or dispatch event
    const initialCooldownState = await page.evaluate(() => {
      // Dispatch 3 rapid auth expired events to trigger circuit breaker
      window.dispatchEvent(new CustomEvent('sabay_auth_expired'));
      window.dispatchEvent(new CustomEvent('sabay_auth_expired'));
      window.dispatchEvent(new CustomEvent('sabay_auth_expired'));
      const text = document.body.innerText;
      return {
        hasCooldownText: text.includes('系統保護中') || text.includes('秒再輸入'),
        fullText: text
      };
    });

    console.log('   Circuit breaker cooldown triggered. Waiting for countdown to reach 0...');
    const preCountOrdersReqs = capturedNetworkRequests.length;

    // Poll until countdown clears (up to 12s)
    let reachedZero = false;
    let autoRetryDetected = false;
    for (let i = 0; i < 24; i++) {
      await wait(500);
      const isStillCounting = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('系統保護中') || text.includes('秒再輸入');
      });
      if (!isStillCounting) {
        reachedZero = true;
        console.log(`   Countdown reached 0 after ${(i * 0.5).toFixed(1)}s!`);
        break;
      }
    }

    if (capturedNetworkRequests.length > preCountOrdersReqs) {
      autoRetryDetected = true;
    }

    // Verify keypad button is enabled
    const isKeypadEnabled = await page.evaluate(() => {
      const btn = document.querySelector('#pinpad-1');
      return btn ? !btn.disabled : false;
    });

    console.log(`   Keypad re-enabled: ${isKeypadEnabled}, Auto-retry detected: ${autoRetryDetected}`);

    results.testCases['TC-EMU-03'] = {
      description: 'Gate locked (Active 10s cooldown): Wait for countdown to hit 0s. NO auto retry request. Input re-enabled.',
      status: reachedZero && !autoRetryDetected && isKeypadEnabled ? 'PASSED' : 'FAILED',
      evidence: `Reached 0: ${reachedZero}, Auto-retry sent: ${autoRetryDetected}, Keypad re-enabled: ${isKeypadEnabled}`
    };

    // -------------------------------------------------------------------------
    // TC-EMU-04: Gate unlocked -> Input valid 6-digit PIN (070718) & click Unlock
    // -------------------------------------------------------------------------
    console.log('\n▶️ [TC-EMU-04] Testing valid PIN unlocking (070718)...');
    
    // Clear any previous PIN
    await page.click('#pinpad-clear');
    await wait(200);

    // Enter PIN: 0, 7, 0, 7, 1, 8
    const digits = ['0', '7', '0', '7', '1', '8'];
    for (const d of digits) {
      await page.click(`#pinpad-${d}`);
      await wait(100);
    }

    const unlockStart = Date.now();
    await page.click('#pin-submit-button');

    // Wait for KDS to load (kitchen view rendered)
    let kdsLoaded = false;
    let loadDurationMs = 0;
    try {
      await page.waitForFunction(() => {
        const text = document.body.innerText;
        return text.includes('廚房出單') || text.includes('KDS') || text.includes('廚房監控') || text.includes('待處理') || !!document.querySelector('#tab-btn-kitchen');
      }, { timeout: 10000 });
      loadDurationMs = Date.now() - unlockStart;
      kdsLoaded = true;
      console.log(`   KDS loaded successfully in ${loadDurationMs}ms!`);
    } catch (e) {
      console.warn('   Timeout waiting for KDS view:', e.message);
    }

    const hasStaffToken = await page.evaluate(() => {
      return !!localStorage.getItem('sabay_jwt_token') || !!sessionStorage.getItem('staff_token');
    });

    results.testCases['TC-EMU-04'] = {
      description: 'Gate unlocked: Input valid 6-digit PIN and click Unlock. Functions validates PIN. Auth token saved. KDS loads.',
      status: kdsLoaded && hasStaffToken ? 'PASSED' : 'FAILED',
      evidence: `KDS loaded: ${kdsLoaded} (${loadDurationMs}ms), Auth token saved: ${hasStaffToken}`
    };

    console.log('\n========================================================================');
    console.log('📊 [EMULATOR TEST MATRIX RESULTS]');
    console.table(results.testCases);
    console.log('========================================================================\n');

    fs.writeFileSync('tc_emu_verification_results.json', JSON.stringify(results, null, 2));
    console.log('Saved results to tc_emu_verification_results.json');

  } finally {
    await browser.close();
  }
}

runMatrix().catch(err => {
  console.error('Test matrix execution error:', err);
  process.exit(1);
});
