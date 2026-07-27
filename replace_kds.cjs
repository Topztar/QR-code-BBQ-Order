const fs = require('fs');

let content = fs.readFileSync('src/components/KitchenDisplaySystem.tsx', 'utf8');

const replacements = [
  ["'語音合成廣播已開啟，收到新訂單時將自動朗讀'", "TRANSLATIONS.app_text_2000?.[currentLang] || '語音合成廣播已開啟，收到新訂單時將自動朗讀'"],
  ["'語音合成廣播已關閉'", "TRANSLATIONS.app_text_2001?.[currentLang] || '語音合成廣播已關閉'"],
  ["speak(`收到新訂單，桌號 ${tableStr}`)", "speak(`${TRANSLATIONS.app_text_2002?.[currentLang] || '收到新訂單，桌號 '}${tableStr}`)"],
  ["> 時段運載<", ">{TRANSLATIONS.app_text_2003?.[currentLang] || ' 時段運載'}<"],
  [">🎯 今日實際單量:<", ">{TRANSLATIONS.app_text_2004?.[currentLang] || '🎯 今日實際單量:'}<"],
  ["> 筆<", ">{TRANSLATIONS.app_text_2005?.[currentLang] || ' 筆'}<"],
  [">📈 預期期望單量:<", ">{TRANSLATIONS.app_text_2006?.[currentLang] || '📈 預期期望單量:'}<"],
  [">🗓️ 7日歷史均值:<", ">{TRANSLATIONS.app_text_2007?.[currentLang] || '🗓️ 7日歷史均值:'}<"],
  [">預期波動區間:<", ">{TRANSLATIONS.app_text_2008?.[currentLang] || '預期波動區間:'}<"],
  ["drinks: '飲料'", "drinks: TRANSLATIONS.app_text_2009?.[currentLang] || '飲料'"],
  ["skewers: '烤肉'", "skewers: TRANSLATIONS.app_text_2010?.[currentLang] || '烤肉'"],
  ["sides: '炸物'", "sides: TRANSLATIONS.app_text_2011?.[currentLang] || '炸物'"],
  ["noodles: '特色主食'", "noodles: TRANSLATIONS.app_text_2012?.[currentLang] || '特色主食'"],
  ["combos: '精選套餐'", "combos: TRANSLATIONS.app_text_2013?.[currentLang] || '精選套餐'"],
  ["'此瀏覽器或外掛環境暫不支援 Web Speech API。但您可在下方手動輸入快速備註。'", "TRANSLATIONS.app_text_2014?.[currentLang] || '此瀏覽器或外掛環境暫不支援 Web Speech API。但您可在下方手動輸入快速備註。'"],
  ["'麥克風授權失敗，請確認已核准瀏覽器麥克風使用權限'", "TRANSLATIONS.app_text_2015?.[currentLang] || '麥克風授權失敗，請確認已核准瀏覽器麥克風使用權限'"],
  ["'備註內容不可為空白'", "TRANSLATIONS.app_text_2016?.[currentLang] || '備註內容不可為空白'"],
  ["'請輸入需要特別關注的具體原因 / Please enter a reason'", "TRANSLATIONS.app_text_2017?.[currentLang] || '請輸入需要特別關注的具體原因 / Please enter a reason'"],
  [">🔊 [逼逼！廚房票據機已列印全新工作單]<", ">{TRANSLATIONS.app_text_2018?.[currentLang] || '🔊 [逼逼！廚房票據機已列印全新工作單]'}<"],
  [">沙貝廚房備餐顯示屏 (KDS Monitor)<", ">{TRANSLATIONS.app_text_2019?.[currentLang] || '沙貝廚房備餐顯示屏 (KDS Monitor)'}<"],
  [">即時同步桌席點單 · 最新 1 秒連線正常<", ">{TRANSLATIONS.app_text_2020?.[currentLang] || '即時同步桌席點單 · 最新 1 秒連線正常'}<"],
  ["placeholder=\"搜尋桌號或訂單編號...\"", "placeholder={TRANSLATIONS.app_text_2021?.[currentLang] || '搜尋桌號或訂單編號...'}"],
  ["站點分類篩選 (Kitchen Prep Station Filter):", "{TRANSLATIONS.app_text_2022?.[currentLang] || '站點分類篩選 (Kitchen Prep Station Filter):'}"],
  [">全部品項 (All Stations)<", ">{TRANSLATIONS.app_text_2023?.[currentLang] || '全部品項 (All Stations)'}<"],
  [">找不到符合「", ">{TRANSLATIONS.app_text_2024?.[currentLang] || '找不到符合「'}"],
  ["」的待備訂單 🔍<", ">{TRANSLATIONS.app_text_2025?.[currentLang] || '」的待備訂單 🔍'}<"],
  [">目前沒有任何待備餐點，大家辛苦了！✨<", ">{TRANSLATIONS.app_text_2026?.[currentLang] || '目前沒有任何待備餐點，大家辛苦了！✨'}<"]
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
}

// ensure TRANSLATIONS is imported in KitchenDisplaySystem if it's not
if (!content.includes('import { TRANSLATIONS }')) {
  content = content.replace("import { Order, OrderItem, Language } from '../types';", "import { Order, OrderItem, Language } from '../types';\nimport { TRANSLATIONS } from '../data';");
}

fs.writeFileSync('src/components/KitchenDisplaySystem.tsx', content);
console.log('KitchenDisplaySystem.tsx updated');
