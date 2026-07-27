const fs = require('fs');

const state = JSON.parse(fs.readFileSync('persisted_state.json', 'utf8'));
const formatJson = (obj) => JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');

function updateSeedDefaults() {
    if (!fs.existsSync('seed-defaults.ts')) return;
    let content = fs.readFileSync('seed-defaults.ts', 'utf8');

    // Replace categories array
    content = content.replace(/const categories: Category\[\] = \[[^;]+;/m, `const categories: Category[] = ${formatJson(state.liveCategories)};`);
    
    // Replace tables array
    content = content.replace(/const tables: TableConfig\[\] = \[[^;]+;/m, `const tables: TableConfig[] = ${formatJson(state.liveTables)};`);

    // Replace system settings payload
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
    console.log('Updated seed-defaults.ts completely');
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
    console.log('Updated seed-settings.ts completely');
}

updateSeedDefaults();
updateSeedSettings();
