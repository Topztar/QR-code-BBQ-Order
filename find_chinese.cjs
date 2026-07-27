const fs = require('fs');

function findChinese(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (/[\u4e00-\u9fa5]/.test(line)) {
      console.log(`${filepath}:${i + 1}: ${line.trim()}`);
    }
  });
}

findChinese(process.argv[2]);
