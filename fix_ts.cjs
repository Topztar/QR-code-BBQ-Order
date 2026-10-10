const { Project, SyntaxKind } = require("ts-morph");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const diagnostics = project.getPreEmitDiagnostics();
let fixCount = 0;

for (const diagnostic of diagnostics) {
  if (diagnostic.getCode() === 6133 || diagnostic.getCode() === 6192 || diagnostic.getCode() === 6198) {
    const file = diagnostic.getSourceFile();
    if (!file) continue;
    const start = diagnostic.getStart();
    if (start == null) continue;

    const node = file.getDescendantAtPos(start);
    if (!node) continue;

    try {
        if (node.getKind() === SyntaxKind.Identifier) {
            const parent = node.getParent();
            
            // 1. Unused Import Specifier: `import { unused } from 'x'`
            if (parent.getKind() === SyntaxKind.ImportSpecifier) {
                parent.remove();
                fixCount++;
            }
            // 2. Unused Default Import: `import React from 'react'`
            else if (parent.getKind() === SyntaxKind.ImportClause) {
                // If the entire import clause is just this identifier
                const importDecl = parent.getParent();
                if (importDecl.getKind() === SyntaxKind.ImportDeclaration) {
                    importDecl.remove();
                    fixCount++;
                }
            }
            // 3. Unused Variable/Parameter declaration
            else if (
                parent.getKind() === SyntaxKind.Parameter ||
                parent.getKind() === SyntaxKind.VariableDeclaration ||
                parent.getKind() === SyntaxKind.BindingElement
            ) {
                const nameNode = parent.getNameNode();
                if (nameNode && nameNode.getKind() === SyntaxKind.Identifier) {
                    const name = nameNode.getText();
                    if (!name.startsWith('_')) {
                        nameNode.replaceWithText('_' + name);
                        fixCount++;
                    }
                }
            }
        }
    } catch(e) {
        // ignore errors during replacement
    }
  }
}

project.saveSync();
console.log(`Fixed ${fixCount} unused variables/imports.`);
