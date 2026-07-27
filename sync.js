import fs from 'fs';

const state = JSON.parse(fs.readFileSync('persisted_state.json', 'utf8'));
const formatJson = (obj) => JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');

function updateDataTs() {
  if (!fs.existsSync('src/data.ts')) return;
  let content = fs.readFileSync('src/data.ts', 'utf8');
  
  // Try matching various type signatures
  content = content.replace(/export const INITIAL_CATEGORIES.*?\= \[[^;]+;/m, `export const INITIAL_CATEGORIES: any[] = ${formatJson(state.liveCategories)};`);
  content = content.replace(/export const INITIAL_MENU.*?\= \[[^;]+;/m, `export const INITIAL_MENU: any[] = ${formatJson(state.liveMenu)};`);
  content = content.replace(/export const INITIAL_INGREDIENTS.*?\= \[[^;]+;/m, `export const INITIAL_INGREDIENTS: any[] = ${formatJson(state.liveIngredients)};`);
  
  fs.writeFileSync('src/data.ts', content);
  console.log('Updated src/data.ts');
}

function updateSeedDefaults() {
  if (!fs.existsSync('seed-defaults.ts')) return;
  let content = fs.readFileSync('seed-defaults.ts', 'utf8');
  content = content.replace(/const categories: Category\[\] = \[[^;]+;/m, `const categories: Category[] = ${formatJson(state.liveCategories)};`);
  content = content.replace(/const tables: TableConfig\[\] = \[[^;]+;/m, `const tables: TableConfig[] = ${formatJson(state.liveTables)};`);
  const settingsRegex = /await setDoc\(doc\(db, 'settings', 'system'\), cleanUndefined\({\s*"liveStaffPin"[\s\S]*?}\)\);/m;
  const sysSettings = {
      liveStaffPin: state.liveStaffPin,
      livePrinterIp: state.livePrinterIp,
      liveTakeoutSeq: state.liveTakeoutSeq,
      liveMinSpendPerPerson: state.liveMinSpendPerPerson,
      liveOperatingHours: state.liveOperatingHours,
      liveRestDays: state.liveRestDays,
      liveCustomerNotice: state.liveCustomerNotice,
      liveServicePaused: state.liveServicePaused,
      liveOptionRules: state.liveOptionRules,
      livePrinterSettings: state.livePrinterSettings,
      livePromoCombo: state.livePromoCombo,
      livePromoCombos: state.livePromoCombos,
      livePopularItemIds: state.livePopularItemIds,
      liveMemberPointsRatio: state.liveMemberPointsRatio,
      liveMemberRewards: state.liveMemberRewards,
  };
  content = content.replace(settingsRegex, `await setDoc(doc(db, 'settings', 'system'), cleanUndefined(${formatJson(sysSettings)}));`);
  fs.writeFileSync('seed-defaults.ts', content);
  console.log('Updated seed-defaults.ts');
}

function updateSeedSettings() {
  if (!fs.existsSync('seed-settings.ts')) return;
  let content = fs.readFileSync('seed-settings.ts', 'utf8');
  const sysSettings = {
      liveStaffPin: state.liveStaffPin,
      livePrinterIp: state.livePrinterIp,
      liveTakeoutSeq: state.liveTakeoutSeq,
      lastTakeoutDate: state.lastTakeoutDate,
      liveMinSpendPerPerson: state.liveMinSpendPerPerson,
      liveOperatingHours: state.liveOperatingHours,
      liveRestDays: state.liveRestDays,
      liveCustomerNotice: state.liveCustomerNotice,
      liveServicePaused: state.liveServicePaused,
      liveOptionRules: state.liveOptionRules,
      livePrinterSettings: state.livePrinterSettings,
      livePromoCombo: state.livePromoCombo,
      livePromoCombos: state.livePromoCombos,
      livePopularItemIds: state.livePopularItemIds,
      liveMemberPointsRatio: state.liveMemberPointsRatio,
      liveMemberRewards: state.liveMemberRewards,
  };
  const settingsRegex = /const seedSettingsData = {\s*"liveStaffPin"[\s\S]*?};/m;
  content = content.replace(settingsRegex, `const seedSettingsData = ${formatJson(sysSettings)};`);
  fs.writeFileSync('seed-settings.ts', content);
  console.log('Updated seed-settings.ts');
}

updateDataTs();
updateSeedDefaults();
updateSeedSettings();
