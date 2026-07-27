import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function importFromFirestore() {
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

  console.log(`Connecting to Firebase project: ${config.projectId}, Database ID: ${config.firestoreDatabaseId || 'default'}`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, config.firestoreDatabaseId);

  try {
    console.log('Fetching latest data from Cloud Firestore to replace local data...');

    // 1. Categories
    const liveCategories: any[] = [];
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    categoriesSnapshot.forEach((snapDoc) => {
      liveCategories.push(snapDoc.data());
    });
    liveCategories.sort((a, b) => {
      const idxA = a.orderIndex !== undefined ? a.orderIndex : 9999;
      const idxB = b.orderIndex !== undefined ? b.orderIndex : 9999;
      return idxA - idxB;
    });
    console.log(`- Fetched ${liveCategories.length} categories.`);

    // 2. Menu Items
    const liveMenu: any[] = [];
    const menuSnapshot = await getDocs(collection(db, 'menu'));
    menuSnapshot.forEach((snapDoc) => {
      liveMenu.push(snapDoc.data());
    });
    liveMenu.sort((a, b) => {
      const idxA = a.orderIndex !== undefined ? a.orderIndex : 9999;
      const idxB = b.orderIndex !== undefined ? b.orderIndex : 9999;
      return idxA - idxB;
    });
    console.log(`- Fetched ${liveMenu.length} menu items.`);

    // 3. Ingredients
    const liveIngredients: any[] = [];
    const ingredientsSnapshot = await getDocs(collection(db, 'ingredients'));
    ingredientsSnapshot.forEach((snapDoc) => {
      liveIngredients.push(snapDoc.data());
    });
    console.log(`- Fetched ${liveIngredients.length} ingredients.`);

    // 4. Tables
    const liveTables: any[] = [];
    const tablesSnapshot = await getDocs(collection(db, 'tables'));
    tablesSnapshot.forEach((snapDoc) => {
      liveTables.push(snapDoc.data());
    });
    console.log(`- Fetched ${liveTables.length} tables.`);

    // 5. Reservations
    const liveReservations: any[] = [];
    const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
    reservationsSnapshot.forEach((snapDoc) => {
      liveReservations.push(snapDoc.data());
    });
    console.log(`- Fetched ${liveReservations.length} reservations.`);

    // 6. Orders
    const liveOrders: any[] = [];
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    ordersSnapshot.forEach((snapDoc) => {
      const orderData = snapDoc.data();
      if (!orderData.id) {
        orderData.id = snapDoc.id;
      }
      liveOrders.push(orderData);
    });
    liveOrders.sort((a, b) => {
      const idA = String(a && a.id ? a.id : '');
      const idB = String(b && b.id ? b.id : '');
      const numA = parseInt(idA.replace(/\D/g, '')) || 0;
      const numB = parseInt(idB.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    console.log(`- Fetched ${liveOrders.length} orders.`);

    // Defaults for System Settings
    let liveStaffPin = '888888';
    let livePrinterIp = '10.0.0.124';
    let liveTakeoutSeq = 0;
    let lastTakeoutDate = new Date().toDateString();
    let liveMinSpendPerPerson = 200;
    let liveOperatingHours: any[] = [];
    let liveRestDays: any[] = [];
    let liveCustomerNotice = '';
    let liveServicePaused = false;
    let liveOptionRules: any[] = [];
    let livePrinterSettings: any = {};
    let livePromoCombo: any = {};
    let livePromoCombos: any[] = [];
    let livePopularItemIds: any[] = [];
    let liveMemberPointsRatio = 20;
    let liveMemberRewards: any[] = [];

    // 7. System Settings
    const systemDoc = await getDoc(doc(db, 'settings', 'system'));
    if (systemDoc.exists()) {
      const sys = systemDoc.data();
      if (sys.liveStaffPin !== undefined) liveStaffPin = String(sys.liveStaffPin);
      if (sys.livePrinterIp !== undefined) livePrinterIp = String(sys.livePrinterIp);
      if (sys.liveTakeoutSeq !== undefined) liveTakeoutSeq = Number(sys.liveTakeoutSeq);
      if (sys.lastTakeoutDate !== undefined) lastTakeoutDate = String(sys.lastTakeoutDate);
      if (sys.liveMinSpendPerPerson !== undefined) liveMinSpendPerPerson = Number(sys.liveMinSpendPerPerson);
      if (sys.liveOperatingHours !== undefined) liveOperatingHours = sys.liveOperatingHours;
      if (sys.liveRestDays !== undefined) liveRestDays = sys.liveRestDays;
      if (sys.liveCustomerNotice !== undefined) liveCustomerNotice = String(sys.liveCustomerNotice);
      if (sys.liveServicePaused !== undefined) liveServicePaused = !!sys.liveServicePaused;
      if (sys.liveOptionRules !== undefined) liveOptionRules = sys.liveOptionRules;
      if (sys.livePrinterSettings !== undefined) livePrinterSettings = sys.livePrinterSettings;
      if (sys.livePromoCombo !== undefined) livePromoCombo = sys.livePromoCombo;
      if (sys.livePromoCombos !== undefined) livePromoCombos = sys.livePromoCombos;
      if (sys.livePopularItemIds !== undefined) livePopularItemIds = sys.livePopularItemIds;
      if (sys.liveMemberPointsRatio !== undefined) liveMemberPointsRatio = Number(sys.liveMemberPointsRatio);
      if (sys.liveMemberRewards !== undefined) liveMemberRewards = sys.liveMemberRewards;
      console.log('- Fetched system settings.');
    } else {
      console.log('- System settings doc not found. Using local/defaults.');
    }

    // Defaults for logs
    let inventoryLogs: any[] = [];
    let printLogs: any[] = [];
    let promoNotifications: any[] = [];

    // 8. Logs
    const logsDoc = await getDoc(doc(db, 'settings', 'logs'));
    if (logsDoc.exists()) {
      const logs = logsDoc.data();
      if (Array.isArray(logs.inventoryLogs)) inventoryLogs = logs.inventoryLogs;
      if (Array.isArray(logs.printLogs)) printLogs = logs.printLogs;
      if (Array.isArray(logs.promoNotifications)) promoNotifications = logs.promoNotifications;
      console.log('- Fetched system logs.');
    } else {
      console.log('- System logs doc not found. Using local/defaults.');
    }

    const dataToSave = {
      liveMenu,
      liveIngredients,
      liveCategories,
      liveStaffPin,
      livePrinterIp,
      liveTables,
      liveReservations,
      liveTakeoutSeq,
      lastTakeoutDate,
      liveMinSpendPerPerson,
      liveOperatingHours,
      liveRestDays,
      liveCustomerNotice,
      liveServicePaused,
      liveOrders,
      inventoryLogs,
      printLogs,
      promoNotifications,
      liveOptionRules,
      livePrinterSettings,
      livePromoCombo,
      livePromoCombos,
      livePopularItemIds,
      liveMemberPointsRatio,
      liveMemberRewards,
    };

    const persistencePath = path.join(process.cwd(), 'persisted_state.json');
    fs.writeFileSync(persistencePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    console.log(`🎉 Success! All Cloud Firestore data successfully imported and written to: ${persistencePath}`);
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Import failed:', error);
    process.exit(1);
  }
}

importFromFirestore();
