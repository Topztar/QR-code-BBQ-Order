import fs from 'fs';
import path from 'path';
import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';

const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
}

const clientConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
};

let clientApp: any;
if (getClientApps().length === 0) {
  clientApp = initializeClientApp(clientConfig);
} else {
  clientApp = getClientApps()[0];
}
const databaseId = firebaseConfig.firestoreDatabaseId;
let firestoreDb: any;
if (databaseId) {
  firestoreDb = getClientFirestore(clientApp, databaseId);
} else {
  firestoreDb = getClientFirestore(clientApp);
}

const PERSISTENCE_FILE_PATH = path.join(process.cwd(), 'persisted_state.json');

async function uploadState() {
  if (!fs.existsSync(PERSISTENCE_FILE_PATH)) {
    console.error('persisted_state.json not found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(PERSISTENCE_FILE_PATH, 'utf-8'));

  const cleanUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(item => cleanUndefined(item));
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val !== undefined) {
          cleaned[key] = cleanUndefined(val);
        }
      }
      return cleaned;
    }
    return obj;
  };

  const syncCollection = async (collName: string, items: any[], idKey: string = 'id', addOrderIndex: boolean = false) => {
    if (!items || !Array.isArray(items)) return;
    const collRef = collection(firestoreDb, collName);
    const snapshot = await getDocs(collRef);
    const liveIds = new Set(items.map(item => item[idKey]));
    
    const batch = writeBatch(firestoreDb);
    
    // Delete items no longer in live state
    snapshot.forEach((snapDoc: any) => {
      if (!liveIds.has(snapDoc.id)) {
        batch.delete(snapDoc.ref);
      }
    });
    
    // Set live items
    items.forEach((item, index) => {
      const payload = addOrderIndex ? { ...item, orderIndex: index } : item;
      batch.set(doc(firestoreDb, collName, String(item[idKey])), cleanUndefined(payload));
    });
    
    await batch.commit();
    console.log(`Synced collection: ${collName} with ${items.length} items.`);
  };

  try {
    await syncCollection('categories', data.liveCategories || [], 'id', true);
    await syncCollection('menu', data.liveMenu || [], 'id', true);
    await syncCollection('ingredients', data.liveIngredients || [], 'id', false);
    await syncCollection('tables', data.liveTables || [], 'id', false);
    await syncCollection('reservations', data.liveReservations || [], 'id', false);

    // Orders
    const orders = data.liveOrders || [];
    const orderCollRef = collection(firestoreDb, 'orders');
    const orderSnapshot = await getDocs(orderCollRef);
    const liveOrderIds = new Set(orders.map((o: any) => o.id));
    
    const deletedDocRefs: any[] = [];
    orderSnapshot.forEach((snapDoc: any) => {
      if (!liveOrderIds.has(snapDoc.id)) {
        deletedDocRefs.push(snapDoc.ref);
      }
    });
    
    for (let i = 0; i < deletedDocRefs.length; i += 400) {
      const batch = writeBatch(firestoreDb);
      const chunk = deletedDocRefs.slice(i, i + 400);
      chunk.forEach(ref => batch.delete(ref));
      await batch.commit();
    }

    const orderChunks: any[][] = [];
    for (let i = 0; i < orders.length; i += 400) {
      orderChunks.push(orders.slice(i, i + 400));
    }
    for (const chunk of orderChunks) {
      const batch = writeBatch(firestoreDb);
      chunk.forEach((order) => {
        batch.set(doc(firestoreDb, 'orders', String(order.id)), cleanUndefined(order));
      });
      await batch.commit();
    }
    console.log(`Synced collection: orders with ${orders.length} items.`);

    // System Settings
    const sysData = {
      liveStaffPin: data.liveStaffPin,
      livePrinterIp: data.livePrinterIp || '192.168.123.100',
      liveTakeoutSeq: data.liveTakeoutSeq,
      lastTakeoutDate: data.lastTakeoutDate,
      liveMinSpendPerPerson: data.liveMinSpendPerPerson,
      liveOperatingHours: data.liveOperatingHours,
      liveRestDays: data.liveRestDays,
      liveCustomerNotice: data.liveCustomerNotice,
      liveServicePaused: data.liveServicePaused,
      liveOptionRules: data.liveOptionRules,
      livePrinterSettings: {
        ...data.livePrinterSettings,
        kitchen: { ...data.livePrinterSettings?.kitchen, ip: '192.168.123.100' },
        bill: { ...data.livePrinterSettings?.bill, ip: '192.168.123.100' }
      },
      livePromoCombo: data.livePromoCombo,
      livePromoCombos: data.livePromoCombos,
      livePopularItemIds: data.livePopularItemIds,
      liveMemberPointsRatio: data.liveMemberPointsRatio,
      liveMemberRewards: data.liveMemberRewards
    };
    await setDoc(doc(firestoreDb, 'settings', 'system'), cleanUndefined(sysData));
    console.log(`Synced system settings.`);

    // Logs
    const logData = {
      inventoryLogs: (data.inventoryLogs || []).slice(-100),
      printLogs: (data.printLogs || []).slice(-100),
      promoNotifications: (data.promoNotifications || []).slice(-100)
    };
    await setDoc(doc(firestoreDb, 'settings', 'logs'), cleanUndefined(logData));
    console.log(`Synced system logs.`);

    console.log('Upload complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error uploading state:', err);
    process.exit(1);
  }
}

uploadState();
