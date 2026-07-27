import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function seedSettingsOnly() {
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

  const cleanUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }
    if (obj instanceof Date) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => cleanUndefined(item));
    }
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

  try {
    console.log('Checking settings status...');
    const forceFlag = process.argv.includes('--force');
    if (!forceFlag) {
      const systemDoc = await getDoc(doc(db, 'settings', 'system'));
      if (systemDoc.exists()) {
        console.log('⚠️ [Safety Guard] Firestore settings already exist. Skipping seedSettingsOnly to prevent rolling back user edits.');
        console.log('To force override, run with --force flag: e.g., npx tsx seed-settings.ts --force');
        process.exit(0);
      }
    }

    console.log('Replacing SETTINGS in Cloud Firestore with edited system settings...');

    // Sync System Settings
    await setDoc(doc(db, 'settings', 'system'), cleanUndefined({
        "liveStaffPin": "952788",
        "livePrinterIp": "192.168.123.100",
        "liveTakeoutSeq": 0,
        "lastTakeoutDate": "Mon Jul 27 2026",
        "liveMinSpendPerPerson": 500,
        "liveOperatingHours": [
          {
            "id": "oh-1",
            "name": "午餐時段 Lunch Session",
            "start": "11:00",
            "end": "14:30",
            "days": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "isActive": false,
            "isReservableOnly": false
          },
          {
            "id": "oh-2",
            "name": "晚餐時段 Dinner Session",
            "start": "17:30",
            "end": "23:30",
            "days": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "isActive": true,
            "isReservableOnly": false
          },
          {
            "id": "oh-manual-1785135298026",
            "name": "調整用",
            "start": "00:00",
            "end": "23:59",
            "days": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "isActive": false,
            "isReservableOnly": false
          },
          {
            "id": "oh-res-1785135317557",
            "name": "預約專用",
            "start": "11:30",
            "end": "12:30",
            "days": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "isActive": true,
            "isReservableOnly": true
          }
        ],
        "liveRestDays": [],
        "liveCustomerNotice": "📣 歡迎來到沙貝泰式炭烤！我們提供正宗的泰南冬蔭功&頂級碳烤串燒。最後點餐為23:30。內用低消每人 500 元，未達低消用餐限時 60 分鐘。祝您用餐愉快！Sabay Thai BBQ wishes you a delicious meal!",
        "liveServicePaused": false,
        "liveOptionRules": [
          {
            "id": "rule-1784360566576",
            "price": 20,
            "category": "加配料",
            "name": "加河粉"
          },
          {
            "price": 20,
            "id": "rule-1784360574891",
            "name": "加米線",
            "category": "加配料"
          },
          {
            "name": "升級套餐(烤蔬菜+泰奶一杯)",
            "category": "加配料",
            "price": 140,
            "id": "rule-1784360613823"
          }
        ],
        "livePrinterSettings": {
          "bill": {
            "printTelephone": "0966626408",
            "fontSizeFactor": 0.8,
            "cashDrawerEnabled": true,
            "restaurantName": "沙貝燒烤 SABAY BBQ",
            "width": "58mm",
            "cashDrawerEscPosCommand": "1B700119FA",
            "printTimeEnabled": true,
            "printAddress": "桃園市大園區高鐵北路二段198號1樓",
            "footerSuffix": "謝謝光臨，歡迎再度光臨！",
            "usbPort": "LPT1",
            "cashDrawerDriver": "ESC_POS_RAW",
            "connectionType": "LPT",
            "headerPrefix": "★★★ 顧客結帳明細單 ★★★",
            "cashDrawerOposName": "CashDrawer1",
            "ip": "192.168.123.100"
          },
          "kitchen": {
            "ip": "192.168.123.100",
            "headerPrefix": "★★★ 廚房工作備餐單 ★★★",
            "fontSizeFactor": 1,
            "connectionType": "IP",
            "restaurantName": "沙貝燒烤",
            "width": "80mm",
            "usbPort": "USB001",
            "printTelephone": "0966626408",
            "footerSuffix": "請主廚盡速配餐出餐！",
            "printAddress": "桃園市大園區高鐵北路二段198號1樓",
            "printTimeEnabled": true
          }
        },
        "livePromoCombo": {
          "enabled": true,
          "requiredQty": 10,
          "eligibleItemIds": [],
          "discountAmount": 20
        },
        "livePromoCombos": [],
        "livePopularItemIds": [
          "dish-2605122152569",
          "dish-2696007842576",
          "dish-1909192003211",
          "dish-2207122058577"
        ],
        "liveMemberPointsRatio": 20,
        "liveMemberRewards": [
          {
            "fallbackPrice": 10,
            "cost": 900,
            "id": "rew-01",
            "enabled": false,
            "menuItemId": "sk-02"
          },
          {
            "cost": 800,
            "fallbackPrice": 10,
            "menuItemId": "vg-01",
            "enabled": false,
            "id": "rew-02"
          },
          {
            "fallbackPrice": 10,
            "cost": 1800,
            "id": "rew-03",
            "enabled": false,
            "menuItemId": "dr-01"
          },
          {
            "cost": 900,
            "fallbackPrice": 10,
            "menuItemId": "sw-01",
            "enabled": false,
            "id": "rew-04"
          },
          {
            "fallbackPrice": 10,
            "cost": 2600,
            "enabled": false,
            "id": "rew-05",
            "menuItemId": "ty-01"
          }
        ]
      }));
    console.log('✓ settings/system document successfully updated.');

    // Sync Logs
    console.log('Syncing system logs...');
    await setDoc(doc(db, 'settings', 'logs'), cleanUndefined({
      inventoryLogs: [],
      printLogs: [],
      promoNotifications: []
    }));
    console.log('✓ settings/logs document successfully updated.');

    console.log('🎉 SETTINGS successfully replaced in Cloud Firestore!');
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Replacement failed:', error);
    process.exit(1);
  }
}

seedSettingsOnly();
