const fs = require('fs');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const distAssetsPath = path.join(__dirname, '../dist/assets');
const mockFilesPath = path.join(__dirname, '../mocks');
const coveragePath = path.join(__dirname, '../coverage');

function cleanDirectory(dirPath, extFilter = null) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const currentPath = path.join(dirPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        cleanDirectory(currentPath, extFilter);
      } else {
        if (!extFilter || file.endsWith(extFilter)) {
          fs.unlinkSync(currentPath);
          console.log(`Deleted artifact: ${currentPath}`);
        }
      }
    });
  }
}

console.log('--- Starting Post-Test Hygiene ---');

// 1. Clean map files in dist/assets
try {
  cleanDirectory(distAssetsPath, '.map');
  console.log('Successfully cleaned .map files from dist/assets');
} catch (err) {
  console.warn('Could not clean .map files:', err.message);
}

// 2. Clean dummy test artifacts or mock folders
try {
  if (fs.existsSync(mockFilesPath)) {
    fs.rmSync(mockFilesPath, { recursive: true, force: true });
    console.log(`Deleted mock directory: ${mockFilesPath}`);
  }
} catch (err) {
  console.warn('Could not remove mocks:', err.message);
}

// 3. Clean Vitest coverage reports
try {
  if (fs.existsSync(coveragePath)) {
    fs.rmSync(coveragePath, { recursive: true, force: true });
    console.log(`Deleted coverage directory: ${coveragePath}`);
  }
} catch (err) {
  console.warn('Could not remove coverage:', err.message);
}

// 4. Clean temporary log files in root
try {
  if (fs.existsSync(rootPath)) {
    fs.readdirSync(rootPath).forEach(file => {
      if (file.endsWith('.log') && file !== 'persisted_state.json') {
        const filePath = path.join(rootPath, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted log artifact: ${filePath}`);
        } catch (_) {}
      }
    });
  }
} catch (err) {
  console.warn('Could not clean log files:', err.message);
}

console.log('--- Post-Test Hygiene Complete ---');
