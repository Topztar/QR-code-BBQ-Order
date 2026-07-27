const fs = require('fs');

const state = JSON.parse(fs.readFileSync('persisted_state.json', 'utf8'));

// Format JSON properly
const formatJson = (obj) => JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');

// Update src/data.ts
if (fs.existsSync('src/data.ts')) {
    let content = fs.readFileSync('src/data.ts', 'utf8');
    
    const replaceVar = (varName, data) => {
        const regex = new RegExp(`export const ${varName}(?:\\s*:\\s*.*?)?\\s*=\\s*\\[[\\s\\S]*?\\n\\];`);
        content = content.replace(regex, `export const ${varName}: any[] = ${formatJson(data)};`);
    };
    
    replaceVar('INITIAL_CATEGORIES', state.liveCategories);
    replaceVar('INITIAL_MENU', state.liveMenu);
    replaceVar('INITIAL_INGREDIENTS', state.liveIngredients);
    replaceVar('INITIAL_TABLES', state.liveTables);
    
    fs.writeFileSync('src/data.ts', content);
    console.log('Updated src/data.ts');
}

