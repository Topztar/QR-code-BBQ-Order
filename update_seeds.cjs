const fs = require('fs');

const state = JSON.parse(fs.readFileSync('persisted_state.json', 'utf8'));
const oh = state.liveOperatingHours;

function updateFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    const ohRegex = /"liveOperatingHours": \[\s*\{[\s\S]*?\}\s*\](,|\n)/;
    const replacement = '"liveOperatingHours": ' + JSON.stringify(oh, null, 12).trim() + '$1';
    
    // We might need a better regex, or since the file is a TS file with a big JSON object inside:
    // Let's use a simpler regex
    content = content.replace(/"liveOperatingHours":\s*\[[\s\S]*?\n\s*\](,|\n)/, '"liveOperatingHours": ' + JSON.stringify(oh, null, 10).trim() + '$1');
    fs.writeFileSync(filename, content);
    console.log('Updated', filename);
}

updateFile('seed-defaults.ts');
updateFile('seed-settings.ts');
updateFile('server.ts');
