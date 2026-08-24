const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../public/data.json');
const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

const constantsDir = path.join(__dirname, '../src/constants');
if (!fs.existsSync(constantsDir)) {
  fs.mkdirSync(constantsDir, { recursive: true });
}

const tsContent = `// Auto-generated Master Translations & Category Names Store
import { Language } from '../types';

export const INITIAL_TRANSLATIONS: { [key: string]: { [lang in Language]?: string } } = ${JSON.stringify(data.TRANSLATIONS, null, 2)};

export const INITIAL_CAT_NAMES: { [key: string]: { [lang in Language]?: string } } = ${JSON.stringify(data.CAT_NAMES, null, 2)};
`;

fs.writeFileSync(path.join(constantsDir, 'translations.ts'), tsContent, 'utf8');
console.log('✅ Generated src/constants/translations.ts with synchronous translations');
