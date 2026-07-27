const fs = require('fs');

const state = JSON.parse(fs.readFileSync('persisted_state.json', 'utf8'));
const formatJson = (obj) => JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');

function extractAndReplace(file, regexStr, newData) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    const regex = new RegExp(regexStr);
    content = content.replace(regex, newData);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
}

// Ensure isReservableOnly is set in operating hours
if (state.liveOperatingHours) {
    state.liveOperatingHours.forEach(oh => {
        if (oh.isReservableOnly === undefined) {
            oh.isReservableOnly = false;
        }
    });
}

// 1. Update src/data.ts
// Already updated earlier, but let's re-do it just in case
let contentData = fs.readFileSync('src/data.ts', 'utf8');
const replaceVar = (varName, data) => {
    const regex = new RegExp(`export const ${varName}(?:\\s*:\\s*.*?)?\\s*=\\s*\\[[\\s\\S]*?\\n\\];`);
    contentData = contentData.replace(regex, `export const ${varName}: any[] = ${formatJson(data)};`);
};
replaceVar('INITIAL_CATEGORIES', state.liveCategories);
replaceVar('INITIAL_MENU', state.liveMenu);
replaceVar('INITIAL_INGREDIENTS', state.liveIngredients);
replaceVar('INITIAL_TABLES', state.liveTables);
fs.writeFileSync('src/data.ts', contentData);

// 2. Update seed-defaults.ts
let contentDefaults = fs.readFileSync('seed-defaults.ts', 'utf8');
contentDefaults = contentDefaults.replace(/const categories: Category\[\] = \[[^;]+;/m, `const categories: Category[] = ${formatJson(state.liveCategories)};`);
contentDefaults = contentDefaults.replace(/const tables: TableConfig\[\] = \[[^;]+;/m, `const tables: TableConfig[] = ${formatJson(state.liveTables)};`);

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
contentDefaults = contentDefaults.replace(/await setDoc\(doc\(db, 'settings', 'system'\), cleanUndefined\({\s*"liveStaffPin"[\s\S]*?}\)\);/m, `await setDoc(doc(db, 'settings', 'system'), cleanUndefined(${formatJson(sysSettings)}));`);
fs.writeFileSync('seed-defaults.ts', contentDefaults);

// 3. Update seed-settings.ts
let contentSettings = fs.readFileSync('seed-settings.ts', 'utf8');
const sysSettingsFull = { ...sysSettings, lastTakeoutDate: state.lastTakeoutDate };
contentSettings = contentSettings.replace(/const seedSettingsData = {\s*"liveStaffPin"[\s\S]*?};\n\n  try/m, `const seedSettingsData = ${formatJson(sysSettingsFull)};\n\n  try`);
fs.writeFileSync('seed-settings.ts', contentSettings);

