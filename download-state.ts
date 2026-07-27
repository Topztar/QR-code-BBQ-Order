import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function downloadState() {
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

  console.log(`Connecting to Firebase project: ${config.projectId}, Database ID: ${config.firestoreDatabaseId || 'default'}`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const fetchCollection = async (collName: string, idKey: string = 'id', sortByOrder: boolean = false) => {
    console.log(`Fetching collection "${collName}"...`);
    const collRef = collection(db, collName);
    const snapshot = await getDocs(collRef);
    let items: any[] = [];
    snapshot.forEach((snapDoc) => {
      items.push(snapDoc.data());
    });
    
    if (sortByOrder) {
      items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }
    console.log(`✓ Fetched ${items.length} items from "${collName}".`);
    return items;
  };

  try {
    const newState: any = {};

    // 1. Categories
    newState.liveCategories = await fetchCollection('categories', 'id', true);

    // 2. Menu Items
    newState.liveMenu = await fetchCollection('menu', 'id', true);

    // 3. Ingredients
    newState.liveIngredients = await fetchCollection('ingredients', 'id', false);

    // 4. Tables
    newState.liveTables = await fetchCollection('tables', 'id', false);

    // 5. Reservations
    newState.liveReservations = await fetchCollection('reservations', 'id', false);

    // 6. Orders
    newState.liveOrders = await fetchCollection('orders', 'id', false);

    // 7. System Settings
    console.log('Fetching system settings...');
    const sysSettingsSnap = await getDoc(doc(db, 'settings', 'system'));
    if (sysSettingsSnap.exists()) {
      const sysData = sysSettingsSnap.data();
      Object.assign(newState, sysData);
    }
    console.log('✓ System settings fetched.');

    // 8. Logs
    console.log('Fetching system logs...');
    const logsSnap = await getDoc(doc(db, 'settings', 'logs'));
    if (logsSnap.exists()) {
      const logsData = logsSnap.data();
      Object.assign(newState, logsData);
    }
    console.log('✓ System logs fetched.');

    // Write to persisted_state.json
    fs.writeFileSync(statePath, JSON.stringify(newState, null, 2), 'utf8');
    
    console.log('🎉 State successfully downloaded from Cloud Firestore and saved to persisted_state.json!');
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Download failed:', error);
    process.exit(1);
  }
}

downloadState();
