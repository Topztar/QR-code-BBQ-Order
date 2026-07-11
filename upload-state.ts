import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function uploadState() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: firebase-applet-config.json not found!');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const firebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
  };

  const statePath = path.join(process.cwd(), 'persisted_state.json');
  if (!fs.existsSync(statePath)) {
    console.error('Error: persisted_state.json not found!');
    process.exit(1);
  }
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

  console.log(`Connecting to Firebase project: ${config.projectId}, Database ID: ${config.firestoreDatabaseId || 'default'}`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const syncCollection = async (collName: string, items: any[], idKey: string = 'id', addOrderIndex: boolean = false) => {
    if (!items || !Array.isArray(items)) {
      console.log(`Skipping empty/missing collection: ${collName}`);
      return;
    }
    console.log(`Syncing collection "${collName}" with ${items.length} items...`);
    const collRef = collection(db, collName);
    const snapshot = await getDocs(collRef);
    const liveIds = new Set(items.map(item => item[idKey]));
    
    const batch = writeBatch(db);
    
    // Delete items no longer in live state
    snapshot.forEach((snapDoc: any) => {
      if (!liveIds.has(snapDoc.id)) {
        batch.delete(snapDoc.ref);
      }
    });
    
    // Set live items
    items.forEach((item, index) => {
      const payload = addOrderIndex ? { ...item, orderIndex: index } : item;
      batch.set(doc(db, collName, item[idKey]), payload);
    });
    
    await batch.commit();
    console.log(`✓ Collection "${collName}" synced successfully.`);
  };

  try {
    // 1. Categories
    await syncCollection('categories', state.liveCategories, 'id', true);

    // 2. Menu Items
    await syncCollection('menu', state.liveMenu, 'id', true);

    // 3. Ingredients
    await syncCollection('ingredients', state.liveIngredients, 'id', false);

    // 4. Tables
    await syncCollection('tables', state.liveTables, 'id', false);

    // 5. Reservations
    await syncCollection('reservations', state.liveReservations, 'id', false);

    // 6. Orders
    if (Array.isArray(state.liveOrders)) {
      console.log(`Syncing orders collection with ${state.liveOrders.length} items...`);
      const orderChunks: any[][] = [];
      for (let i = 0; i < state.liveOrders.length; i += 400) {
        orderChunks.push(state.liveOrders.slice(i, i + 400));
      }
      for (const chunk of orderChunks) {
        const batch = writeBatch(db);
        chunk.forEach((order) => {
          batch.set(doc(db, 'orders', order.id), order);
        });
        await batch.commit();
      }
      console.log('✓ Orders synced successfully.');
    }

    // 7. System Settings
    console.log('Syncing system settings...');
    await setDoc(doc(db, 'settings', 'system'), {
      liveStaffPin: state.liveStaffPin,
      livePrinterIp: state.livePrinterIp,
      liveTakeoutSeq: state.liveTakeoutSeq,
      lastTakeoutDate: state.lastTakeoutDate,
      liveMinSpendPerPerson: state.liveMinSpendPerPerson,
      liveOperatingHours: state.liveOperatingHours,
      liveRestDays: state.liveRestDays,
      liveCustomerNotice: state.liveCustomerNotice,
      liveServicePaused: state.liveServicePaused,
      liveOptionRules: state.liveOptionRules,
      livePrinterSettings: state.livePrinterSettings,
      livePromoCombo: state.livePromoCombo,
      livePromoCombos: state.livePromoCombos,
      livePopularItemIds: state.livePopularItemIds,
      liveMemberPointsRatio: state.liveMemberPointsRatio,
      liveMemberRewards: state.liveMemberRewards
    });
    console.log('✓ System settings synced.');

    // 8. Logs
    console.log('Syncing system logs...');
    await setDoc(doc(db, 'settings', 'logs'), {
      inventoryLogs: (state.inventoryLogs || []).slice(-100),
      printLogs: (state.printLogs || []).slice(-100),
      promoNotifications: (state.promoNotifications || []).slice(-100)
    });
    console.log('✓ System logs synced.');

    console.log('🎉 State successfully force-uploaded to Cloud Firestore!');
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Upload failed:', error);
    process.exit(1);
  }
}

uploadState();
