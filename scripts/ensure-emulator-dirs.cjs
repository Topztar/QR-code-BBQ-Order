const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(process.cwd(), 'emulator-data');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`[Emulator Prep] Created emulator data directory at: ${targetDir}`);
} else {
  console.log(`[Emulator Prep] Emulator data directory exists at: ${targetDir}`);
}
