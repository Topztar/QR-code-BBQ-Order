const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = process.env.TARGET_URL || 'https://sabay-bbq-order.web.app/kitchen';

async function main() {
  console.log(`🔍 Launching Chrome to inspect: ${TARGET_URL}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const response = await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`Response HTTP Status: ${response.status()}`);

    // Wait for the gate to settle
    await new Promise(r => setTimeout(r, 2000));

    const pageData = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const title = document.title;
      
      const pinContainer = document.querySelector('#secure-gate-container');
      const submitBtn = document.querySelector('#pin-submit-button');
      const dots = document.querySelectorAll('[role="status"] > div');
      const returnBtn = document.querySelector('#staff-gate-return-btn');
      const pinButtons = Array.from(document.querySelectorAll('[id^="pinpad-"]')).map(b => b.id);

      return {
        title,
        bodyText,
        hasPinContainer: !!pinContainer,
        pinDotsCount: dots.length,
        hasSubmitBtn: !!submitBtn,
        submitBtnDisabled: submitBtn ? submitBtn.disabled : null,
        submitBtnText: submitBtn ? submitBtn.innerText : null,
        hasReturnBtn: !!returnBtn,
        pinButtons,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5')).map(h => h.innerText),
        spans: Array.from(document.querySelectorAll('span')).map(s => s.innerText.trim()).filter(Boolean)
      };
    });

    console.log('\n--- Live Inspection Results ---');
    console.log('Title:', pageData.title);
    console.log('Headings:', pageData.headings);
    console.log('Has PIN Container:', pageData.hasPinContainer);
    console.log('PIN Dots Count:', pageData.pinDotsCount);
    console.log('Pin Buttons detected:', pageData.pinButtons.length);
    console.log('Submit button:', pageData.submitBtnText, '(disabled:', pageData.submitBtnDisabled, ')');
    
    // Check specific strings from fact-checking report
    const checks = {
      'C-01 Title/Header': pageData.bodyText.includes('沙貝泰式燒烤 經營管理中心') || pageData.bodyText.includes('經營管理後台登入'),
      'C-02 6-digit PIN instruction': pageData.bodyText.includes('請輸入 6 位數員工金鑰'),
      'C-03 Cooldown/Protection': pageData.bodyText.includes('系統保護中') || pageData.bodyText.includes('驗證重試過於頻繁'),
      'C-04 Scope text': pageData.bodyText.includes('此區域為餐飲管理、廚房配單及數據庫存後端'),
      'C-05 Engine Attribution': pageData.bodyText.includes('A.S.R. Cloud Engine') || pageData.bodyText.includes('A.S.R. CLOUD ENGINE'),
      'C-06 Vendor Signature': pageData.bodyText.includes('FlyShine A.S.R. System Technology') || pageData.bodyText.includes('FLYSHINE A.S.R. SYSTEM TECHNOLOGY'),
      'Portal Isolation Copy': pageData.bodyText.includes('本頁面為管理階層專屬之獨立防護選單')
    };

    console.log('\n--- Cross-Reference Matrix Live Verification ---');
    console.table(checks);

    fs.writeFileSync('live_kitchen_verification.json', JSON.stringify({ pageData, checks }, null, 2));
    console.log('\nSaved verification to live_kitchen_verification.json');

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});
