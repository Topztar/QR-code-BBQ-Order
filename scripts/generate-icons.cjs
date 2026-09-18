const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svg192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="36" fill="#1a1512"/>
  <circle cx="96" cy="96" r="70" fill="#2a201b" stroke="#e5b453" stroke-width="4"/>
  <path d="M56 80h80M56 96h80M56 112h80" stroke="#8a704c" stroke-width="3" stroke-linecap="round"/>
  <path d="M96 46c10 16 26 26 26 44 0 14-11 26-26 26s-26-12-26-26c0-18 16-28 26-44z" fill="#f97316" opacity="0.9"/>
  <path d="M96 66c5 8 13 13 13 22 0 7-6 13-13 13s-13-6-13-13c0-9 8-14 13-22z" fill="#fde047"/>
  <text x="96" y="152" font-family="sans-serif" font-size="14" font-weight="bold" fill="#e5b453" text-anchor="middle" letter-spacing="1">SABAY</text>
</svg>`;

const svg512 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#1a1512"/>
  <circle cx="256" cy="256" r="190" fill="#2a201b" stroke="#e5b453" stroke-width="10"/>
  <path d="M150 210h212M150 256h212M150 302h212" stroke="#8a704c" stroke-width="8" stroke-linecap="round"/>
  <path d="M256 120c27 44 70 70 70 120 0 38-31 70-70 70s-70-32-70-70c0-50 43-76 70-120z" fill="#f97316" opacity="0.9"/>
  <path d="M256 175c14 22 36 36 36 60 0 20-16 36-36 36s-36-16-36-36c0-24 22-38 36-60z" fill="#fde047"/>
  <text x="256" y="410" font-family="sans-serif" font-size="38" font-weight="bold" fill="#e5b453" text-anchor="middle" letter-spacing="3">SABAY BBQ</text>
</svg>`;

async function main() {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  await sharp(Buffer.from(svg192)).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(Buffer.from(svg512)).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(Buffer.from(svg192)).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(Buffer.from(svg192)).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.ico'));

  const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#1a1512"/>
    <circle cx="600" cy="280" r="160" fill="#2a201b" stroke="#e5b453" stroke-width="6"/>
    <path d="M510 240h180M510 280h180M510 320h180" stroke="#8a704c" stroke-width="6" stroke-linecap="round"/>
    <path d="M600 170c20 32 52 52 52 88 0 28-23 52-52 52s-52-24-52-52c0-36 32-56 52-88z" fill="#f97316" opacity="0.9"/>
    <text x="600" y="500" font-family="sans-serif" font-size="48" font-weight="bold" fill="#e5b453" text-anchor="middle" letter-spacing="4">SABAY BBQ 沙貝燒烤</text>
    <text x="600" y="550" font-family="sans-serif" font-size="24" fill="#d4af37" text-anchor="middle">線上預約訂位與點餐系統</text>
  </svg>`;
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 80 }).toFile(path.join(publicDir, 'og-preview.jpg'));

  console.log('✅ Generated public/favicon.ico, pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png, og-preview.jpg');
}

main().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
