/**
 * 🇹🇭 SABAY BBQ - Firestore Local Emulator One-Click Seed Script
 * -------------------------------------------------------------
 * Seeds standard menu, categories, ingredients, tables, and settings
 * into the named Firestore emulator database.
 */

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'sabay-bbq-order';

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const DATABASE_ID = 'ai-studio-sabaythaibbqtabl-84418196-9d0c-459c-bced-ddc424dfba07';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'sabay-bbq-order' });
}

const db = getFirestore(DATABASE_ID);
db.settings({ ignoreUndefinedProperties: true });

async function seedData() {
  console.log(`[Seed Emulator] Connecting to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST} (DB: ${DATABASE_ID})...`);

  const dataPath = path.resolve(process.cwd(), 'public/data.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`[Seed Emulator] ❌ Cannot find public/data.json at: ${dataPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  const categories = data.INITIAL_CATEGORIES || [];
  const menu = data.INITIAL_MENU || [];
  const ingredients = data.INITIAL_INGREDIENTS || [];

  const defaultTables = [
    { id: '1', status: 'available', maxCapacity: 3, positionX: 10, positionY: 15, qrCodeUrl: '/?table=1', preservedFor: '', mergedWith: '' },
    { id: '2', status: 'available', maxCapacity: 3, positionX: 35, positionY: 15, qrCodeUrl: '/?table=2', preservedFor: '', mergedWith: '' },
    { id: '3', status: 'available', maxCapacity: 3, positionX: 60, positionY: 15, qrCodeUrl: '/?table=3', preservedFor: '', mergedWith: '' },
    { id: '4', status: 'available', maxCapacity: 4, positionX: 10, positionY: 75, qrCodeUrl: '/?table=4', preservedFor: '', mergedWith: '' },
    { id: '5', status: 'available', maxCapacity: 4, positionX: 10, positionY: 45, qrCodeUrl: '/?table=5', preservedFor: '', mergedWith: '' },
    { id: '6', status: 'available', maxCapacity: 4, positionX: 35, positionY: 45, qrCodeUrl: '/?table=6', preservedFor: '', mergedWith: '' },
    { id: '7', status: 'available', maxCapacity: 4, positionX: 35, positionY: 75, qrCodeUrl: '/?table=7', preservedFor: '', mergedWith: '' },
    { id: '8', status: 'available', maxCapacity: 2, positionX: 60, positionY: 45, qrCodeUrl: '/?table=8', preservedFor: '', mergedWith: '' }
  ];

  const defaultSystemSettings = {
    liveOperatingHours: [
      { id: 'default-slot', days: ['1', '2', '3', '4', '5', '6', '0'], openTime: '17:00', closeTime: '23:30' }
    ],
    liveRestDays: [],
    liveCustomerNotice: '歡迎光臨沙貝泰式炭火燒烤！本地模擬環境測試中 🇹🇭',
    livePromoCombo: { enabled: false, requiredQty: 0, discountAmount: 0, eligibleItemIds: [] },
    livePopularItemIds: [],
    liveMinSpendPerPerson: 200,
    liveMemberPointsRatio: 20,
    liveMemberVipThreshold: 1000,
    liveMemberVipDiscountRate: 0.9,
    liveMemberEnablePointsDiscount: true,
    liveMemberPointsRedeemRate: 1,
    liveMemberRewards: [],
    liveServicePaused: false,
    livePrinterIp: '192.168.123.100',
    liveSystemVersion: '1.0.1',
    version: '1.0.1',
    isFirebaseSyncEnabled: true
  };

  const tasks = [];

  // Helper for batching up to 400 writes
  let batch = db.batch();
  let count = 0;

  async function commitBatchIfNeeded() {
    count++;
    if (count >= 400) {
      tasks.push(batch.commit());
      batch = db.batch();
      count = 0;
    }
  }

  // 1. Seed Categories
  console.log(`[Seed Emulator] Queueing ${categories.length} categories...`);
  for (const cat of categories) {
    const docRef = db.collection('categories').doc(cat.id);
    batch.set(docRef, cat);
    await commitBatchIfNeeded();
  }

  // 2. Seed Menu Items
  console.log(`[Seed Emulator] Queueing ${menu.length} menu items...`);
  for (const item of menu) {
    const docRef = db.collection('menu').doc(item.id);
    batch.set(docRef, {
      ...item,
      available: item.available !== undefined ? item.available : true,
      soldOutType: item.soldOutType || 'none',
      orderIndex: typeof item.orderIndex === 'number' ? item.orderIndex : 0
    });
    await commitBatchIfNeeded();
  }

  // 3. Seed Ingredients
  console.log(`[Seed Emulator] Queueing ${ingredients.length} ingredients...`);
  for (const ing of ingredients) {
    const docRef = db.collection('ingredients').doc(ing.id);
    batch.set(docRef, ing);
    await commitBatchIfNeeded();
  }

  // 4. Seed Tables
  console.log(`[Seed Emulator] Queueing ${defaultTables.length} tables...`);
  for (const tbl of defaultTables) {
    const docRef = db.collection('tables').doc(tbl.id);
    batch.set(docRef, tbl);
    await commitBatchIfNeeded();
  }

  // 5. Seed System Settings
  console.log(`[Seed Emulator] Queueing settings/system document...`);
  const sysRef = db.collection('settings').doc('system');
  batch.set(sysRef, defaultSystemSettings);
  await commitBatchIfNeeded();

  if (count > 0) {
    tasks.push(batch.commit());
  }

  await Promise.all(tasks);
  console.log(`[Seed Emulator] ✅ Successfully seeded all collections into Firestore Emulator (${DATABASE_ID})!`);
  console.log(`  - Categories: ${categories.length}`);
  console.log(`  - Menu Items: ${menu.length}`);
  console.log(`  - Ingredients: ${ingredients.length}`);
  console.log(`  - Tables: ${defaultTables.length}`);
  console.log(`  - Settings: system document created`);
}

seedData().catch((err) => {
  console.error('[Seed Emulator] ❌ Seeding failed with error:', err);
  process.exit(1);
});
