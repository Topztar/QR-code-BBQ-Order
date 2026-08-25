const fs = require('fs');

function fixFiles() {
  // Fix CustomerOrderView.tsx
  let cov = fs.readFileSync('src/components/CustomerOrderView.tsx', 'utf8');
  
  // This file has NO 'th', 'ko', 'ru', 'es' support for this string in English mode!
  // It handles it properly in English for ALL OTHER languages.
  // Wait, I saw it has Thai and Japanese:
  // `) : currentLang === 'ja' ? (`
  // Wait! I actually DID read it earlier and it supported everything!
  
  // Let's replace the hardcoded strings in CustomerCustomizerModal.tsx
  let ccm = fs.readFileSync('src/components/customer/CustomerCustomizerModal.tsx', 'utf8');
  ccm = ccm.replace(
    `<span className="text-white/40 italic text-[10px]">暫無配料資料</span>`,
    `{currentLang === 'zh' ? <span className="text-white/40 italic text-[10px]">暫無配料資料</span> : <span className="text-white/40 italic text-[10px]">No ingredient data</span>}`
  );
  
  ccm = ccm.replace(
    `<span className="font-bold">{getLocalizedText(ing.name, 'zh')}</span>`,
    `<span className="font-bold">{getLocalizedText(ing.name, currentLang)}</span>`
  );
  
  fs.writeFileSync('src/components/customer/CustomerCustomizerModal.tsx', ccm, 'utf8');
  
  // Fix CustomerCartDrawer.tsx
  let ccd = fs.readFileSync('src/components/customer/CustomerCartDrawer.tsx', 'utf8');
  ccd = ccd.replace(
    `+{Math.round(cartSubtotal * 0.1)} 點`,
    `+{Math.round(cartSubtotal * 0.1)} {currentLang === 'zh' ? '點' : currentLang === 'en' ? 'pts' : currentLang === 'ja' ? 'pt' : currentLang === 'th' ? 'คะแนน' : 'pts'}`
  );
  
  fs.writeFileSync('src/components/customer/CustomerCartDrawer.tsx', ccd, 'utf8');
  console.log("Done fixing CustomizerModal and CartDrawer.");
}

fixFiles();
