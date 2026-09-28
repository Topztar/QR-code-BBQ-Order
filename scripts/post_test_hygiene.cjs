const fs = require('fs');
const path = require('path');

const distAssetsPath = path.join(__dirname, '../dist/assets');
const mockFilesPath = path.join(__dirname, '../mocks');

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
try {
  cleanDirectory(distAssetsPath, '.map');
  console.log('Successfully cleaned .map files from dist/assets');
} catch (err) {
  console.warn('Could not clean .map files:', err.message);
}

// Clean any dummy test artifacts or mock folders
try {
  if (fs.existsSync(mockFilesPath)) {
    fs.rmSync(mockFilesPath, { recursive: true, force: true });
    console.log(`Deleted mock directory: ${mockFilesPath}`);
  }
} catch (err) {
  console.warn('Could not remove mocks:', err.message);
}

console.log('--- Post-Test Hygiene Complete ---');
