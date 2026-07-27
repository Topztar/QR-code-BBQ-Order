const fs = require('fs');

const state = JSON.parse(fs.readFileSync('persisted_state.json', 'utf8'));
const oh = state.liveOperatingHours;
const ohJson = JSON.stringify(oh, null, 2).replace(/\n/g, '\n  ');

function updateServer() {
    let content = fs.readFileSync('server.ts', 'utf8');
    const regex = /let liveOperatingHours: OperatingHourSlot\[\] = \[\s*[\s\S]*?\s*\];/;
    content = content.replace(regex, `let liveOperatingHours: OperatingHourSlot[] = ${ohJson};`);
    fs.writeFileSync('server.ts', content);
    console.log('Updated server.ts');
}

function updateSeedDefaults() {
    let content = fs.readFileSync('seed-defaults.ts', 'utf8');
    const regex = /"liveOperatingHours": \[\s*[\s\S]*?\s*\],/g;
    content = content.replace(regex, `"liveOperatingHours": ${ohJson},`);
    fs.writeFileSync('seed-defaults.ts', content);
    console.log('Updated seed-defaults.ts');
}

function updateSeedSettings() {
    let content = fs.readFileSync('seed-settings.ts', 'utf8');
    const regex = /"liveOperatingHours": \[\s*[\s\S]*?\s*\],/g;
    content = content.replace(regex, `"liveOperatingHours": ${ohJson},`);
    fs.writeFileSync('seed-settings.ts', content);
    console.log('Updated seed-settings.ts');
}

updateServer();
updateSeedDefaults();
updateSeedSettings();
