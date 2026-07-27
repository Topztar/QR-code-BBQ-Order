// @ts-nocheck
import { Project, SyntaxKind, JsxText, StringLiteral, JsxExpression } from "ts-morph";
import * as fs from "fs";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const files = [
  "src/App.tsx",
  "src/components/KitchenDisplaySystem.tsx",
  "src/components/CustomerOrderView.tsx",
  "src/components/ManagerDashboard.tsx"
];

let dataContent = fs.readFileSync('src/data.ts', 'utf8');
const match = dataContent.match(/export const TRANSLATIONS:.*?\{([\s\S]*?)\n};\n/m);
let newTranslationsBody = match ? match[1] : "";
let idCounter = 4000;

const chineseRegex = /[\u4e00-\u9fa5]/;

const processedTexts = new Set<string>();

for (const file of files) {
  const sourceFile = project.getSourceFile(file);
  if (!sourceFile) {
    console.error(`File not found: ${file}`);
    continue;
  }

  // Find JsxText
  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const text of jsxTexts) {
    const textValue = text.getLiteralText();
    if (chineseRegex.test(textValue) && textValue.trim() !== '') {
      const trimmed = textValue.trim();
      let key = `app_text_auto_${idCounter++}`;
      let line = `\n  ${key}: { zh: '${trimmed.replace(/'/g, "\\'")}', en: '${trimmed.replace(/'/g, "\\'")}', ko: '${trimmed.replace(/'/g, "\\'")}', ja: '${trimmed.replace(/'/g, "\\'")}', th: '${trimmed.replace(/'/g, "\\'")}', vi: '${trimmed.replace(/'/g, "\\'")}' },`;
      newTranslationsBody += line;
      
      const langVar = file.includes('App') ? 'lang' : 'currentLang';
      
      // Replace JSX text with expression {TRANSLATIONS.key?.[lang] || '...'}
      // We need to keep leading/trailing whitespaces
      const leadingSpace = textValue.match(/^\s*/)?.[0] || '';
      const trailingSpace = textValue.match(/\s*$/)?.[0] || '';
      text.replaceWithText(`${leadingSpace}{TRANSLATIONS.${key}?.[${langVar}] || '${trimmed.replace(/'/g, "\\'")}'}${trailingSpace}`);
    }
  }
  
  // Find StringLiterals in JSX Attributes (e.g. placeholder="...", title="...")
  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  for (const attr of jsxAttributes) {
    const name = attr.getName();
    if (name === 'placeholder' || name === 'title') {
      const init = attr.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        const textValue = (init as StringLiteral).getLiteralValue();
        if (chineseRegex.test(textValue)) {
          let key = `app_text_auto_${idCounter++}`;
          let line = `\n  ${key}: { zh: '${textValue.replace(/'/g, "\\'")}', en: '${textValue.replace(/'/g, "\\'")}', ko: '${textValue.replace(/'/g, "\\'")}', ja: '${textValue.replace(/'/g, "\\'")}', th: '${textValue.replace(/'/g, "\\'")}', vi: '${textValue.replace(/'/g, "\\'")}' },`;
          newTranslationsBody += line;
          
          const langVar = file.includes('App') ? 'lang' : 'currentLang';
          attr.setInitializer(`{TRANSLATIONS.${key}?.[${langVar}] || '${textValue.replace(/'/g, "\\'")}'}`);
        }
      }
    }
  }

  // Add import if needed
  const imports = sourceFile.getImportDeclarations();
  const hasTranslationsImport = imports.some(i => !!i.getNamedImports().find(n => n.getName() === 'TRANSLATIONS'));
  if (!hasTranslationsImport) {
    sourceFile.addImportDeclaration({
      namedImports: ['TRANSLATIONS'],
      moduleSpecifier: file.includes('components') ? '../data' : './data'
    });
  }

  sourceFile.saveSync();
  console.log(`Processed ${file}`);
}

if (match) {
  dataContent = dataContent.replace(match[1], newTranslationsBody);
  fs.writeFileSync('src/data.ts', dataContent);
  console.log('Updated src/data.ts');
}

