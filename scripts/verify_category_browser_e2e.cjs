const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const STAFF_PIN = '070718';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function unlockStaffGateIfNeeded(page) {
  const hasGate = await page.evaluate(() => !!document.querySelector('#secure-gate-container'));
  if (hasGate) {
    console.log('    [Auth Gate] Staff PIN gate detected, entering PIN...');
    for (const char of STAFF_PIN) {
      await page.click(`#pinpad-${char}`);
      await wait(50);
    }
    await page.click('#pin-submit-button');
    await wait(1500);
    console.log('    [Auth Gate] Staff gate unlocked.');
  }
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 SABAY BBQ - BROWSER INTERACTIVE E2E: CATEGORY MANAGEMENT AUDIT');
  console.log(`🌐 Target Server: ${BASE_URL}`);
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const testResults = {
    step1_adminMenuPageLoad: false,
    step2_openCreateCategoryModal: false,
    step3_autoFillMultilingualFromZh: false,
    step4_autoGenCatRandomIdWhenBlank: false,
    step5_editCategoryWithValidIdIsLocked: false,
    errors: []
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 950 });

    page.on('console', msg => {
      const t = msg.text();
      if (msg.type() === 'error' && !t.includes('Failed to load resource') && !t.includes('Image Error') && !t.includes('favicon')) {
        console.warn('  ⚠️ [Browser Console Error]:', t);
      }
    });

    // -------------------------------------------------------------------------
    // Step 1: Open Admin Menu Tab
    // -------------------------------------------------------------------------
    console.log('▶️ Step 1: Navigating to Admin Menu Tab in Chrome Browser...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await wait(1500);
    await unlockStaffGateIfNeeded(page);
    await wait(2000);

    const menuTabBtn = await page.waitForSelector('#tab-btn-menu', { timeout: 15000 });
    await menuTabBtn.click();
    console.log('  ✓ Switched to Menu Editor sub-tab');
    await wait(2000);

    testResults.step1_adminMenuPageLoad = true;

    // -------------------------------------------------------------------------
    // Step 2: Open Create Category Modal
    // -------------------------------------------------------------------------
    console.log('\n▶️ Step 2: Opening Create Category Modal in Browser...');
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('新增菜色分類標籤'));
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('新增菜色分類標籤'));
      if (btn) {
        btn.scrollIntoView();
        btn.click();
      }
    });

    const modal = await page.waitForSelector('div[role="dialog"] form', { timeout: 10000 });
    console.log('  ✓ Create Category Modal opened');
    testResults.step2_openCreateCategoryModal = true;

    // -------------------------------------------------------------------------
    // Step 3: Enter Chinese Name using Real Keyboard Input
    // -------------------------------------------------------------------------
    console.log('\n▶️ Step 3: Typing Traditional Chinese Name "下酒必點小食" and Verifying 7 Multilingual Translations...');
    const inputs = await modal.$$('input[type="text"]');
    // inputs[0]: id, inputs[1]: zh, inputs[2]: en, inputs[3]: th, inputs[4]: ja, inputs[5]: ko, inputs[6]: vi, inputs[7]: ru, inputs[8]: es
    const zhInput = inputs[1];
    await zhInput.click();
    await page.keyboard.type('下酒必點小食', { delay: 50 });
    await page.keyboard.press('Tab');
    await wait(1000);

    const translations = await page.evaluate(() => {
      const form = document.querySelector('div[role="dialog"] form');
      const textInputs = Array.from(form ? form.querySelectorAll('input[type="text"]') : []);
      return {
        id: textInputs[0]?.value || '',
        zh: textInputs[1]?.value || '',
        en: textInputs[2]?.value || '',
        th: textInputs[3]?.value || '',
        ja: textInputs[4]?.value || '',
        ko: textInputs[5]?.value || '',
        vi: textInputs[6]?.value || '',
        ru: textInputs[7]?.value || '',
        es: textInputs[8]?.value || '',
      };
    });

    console.log('  Extracted Translations from Browser Inputs:', JSON.stringify(translations, null, 2));

    if (
      translations.zh === '下酒必點小食' &&
      translations.en === 'Must-Order Bar Snacks' &&
      translations.th === 'กับแกล้มต้องสั่ง' &&
      translations.ja === 'お酒のおつまみ' &&
      translations.ko === '필수 안주 스낵' &&
      translations.vi === 'Món nhắm bắt buộc' &&
      translations.ru === 'Закуски к напиткам' &&
      translations.es === 'Aperitivos para acompañar'
    ) {
      console.log('  ✓ All 7 multilingual fields correctly auto-populated without paid LLM keys!');
      testResults.step3_autoFillMultilingualFromZh = true;
    } else {
      throw new Error(`Multilingual translations not fully populated: ${JSON.stringify(translations)}`);
    }

    // -------------------------------------------------------------------------
    // Step 4: Leave ID Blank and Submit: Verify cat-xxxxxx Auto-Generation
    // -------------------------------------------------------------------------
    console.log('\n▶️ Step 4: Leaving ID input blank and saving category to test auto-generation...');
    const [createCatRes] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/categories') && (res.status() === 200 || res.status() === 201), { timeout: 10000 }),
      page.evaluate(() => {
        const form = document.querySelector('div[role="dialog"] form');
        const submitBtn = form?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })
    ]);

    const createdCatJson = await createCatRes.json();
    console.log('  Response from Category Creation API:', createdCatJson);
    const assignedId = createdCatJson.id || createdCatJson.category?.id;
    if (!assignedId || !assignedId.startsWith('cat-')) {
      throw new Error(`Expected auto-generated cat-xxxxxx ID, got: ${assignedId}`);
    }
    console.log(`  ✓ Successfully auto-generated random category ID: ${assignedId}`);
    testResults.step4_autoGenCatRandomIdWhenBlank = true;

    await wait(2500);

    // -------------------------------------------------------------------------
    // Step 5: Edit the Category with Valid ID: Verify ID is Locked
    // -------------------------------------------------------------------------
    console.log('\n▶️ Step 5: Clicking Edit on the created category and verifying ID locking...');
    const openedEdit = await page.evaluate((targetId) => {
      const cards = Array.from(document.querySelectorAll('div.grid > div'));
      for (const card of cards) {
        if (card.innerText.includes(targetId) || card.innerText.includes('下酒必點小食')) {
          const editBtn = card.querySelector('button[title*="編輯"]');
          if (editBtn) {
            editBtn.scrollIntoView();
            editBtn.click();
            return true;
          }
        }
      }
      return false;
    }, assignedId);

    if (!openedEdit) throw new Error('Could not find created category card to click Edit');
    await wait(1000);

    const isIdDisabled = await page.evaluate(() => {
      const form = document.querySelector('div[role="dialog"] form');
      const textInputs = Array.from(form ? form.querySelectorAll('input[type="text"]') : []);
      return textInputs[0]?.disabled;
    });

    console.log(`  ✓ Category Tag ID input is disabled in edit mode for category with valid ID: ${isIdDisabled}`);
    if (!isIdDisabled) {
      throw new Error('Category Tag ID should be disabled when editing a category that already has a valid ID');
    }
    testResults.step5_editCategoryWithValidIdIsLocked = true;

    // Close the modal
    await page.evaluate(() => {
      const form = document.querySelector('div[role="dialog"] form');
      const cancelBtn = Array.from(form ? form.querySelectorAll('button') : []).find(b => b.innerText.includes('取消'));
      if (cancelBtn) cancelBtn.click();
    });
    await wait(1000);

  } catch (err) {
    console.error('  ✗ Category Browser E2E Error:', err.message);
    testResults.errors.push(err.message);
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  console.log('📊 CATEGORY BROWSER E2E TEST SUMMARY');
  console.table(testResults);
  console.log('========================================================================\n');

  if (testResults.errors.length > 0) {
    console.error('❌ Category Browser E2E encountered errors!');
    process.exit(1);
  } else {
    console.log('🎉 ALL CATEGORY BROWSER E2E STEPS PASSED WITH 100% SUCCESS!');
  }
}

main().catch(err => {
  console.error('FATAL CATEGORY TEST ERROR:', err);
  process.exit(1);
});
