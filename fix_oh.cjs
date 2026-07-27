const fs = require('fs');
const files = ['seed-defaults.ts', 'seed-settings.ts', 'server.ts'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Using a regex to add isReservableOnly: false to any object inside liveOperatingHours that doesn't have it
    // But since it's just JSON, it's safer to extract it, parse, add, stringify, replace.
    // It's a bit complex with regex. Let's just do a simple replacement if it's missing.
    content = content.replace(/"isActive": (true|false)(?!,\s*"isReservableOnly")/g, '"isActive": $1,\n      "isReservableOnly": false');
    
    fs.writeFileSync(file, content);
});
console.log('Fixed isReservableOnly in all files');
