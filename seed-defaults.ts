import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { INITIAL_MENU, INITIAL_INGREDIENTS } from './src/data';
import { Category, TableConfig } from './src/types';

async function seedDefaults() {
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
      batch.set(doc(db, collName, item[idKey]), cleanUndefined(payload));
    });
    
    await batch.commit();
    console.log(`✓ Collection "${collName}" synced successfully.`);
  };

  // 1. Categories
  const categories: Category[] = [
    {
      "name": {
        "vi": "Tiền tip & Giảm giá",
        "th": "ทิปและส่วนลด",
        "ja": "チップ・割引",
        "zh": "小費及折扣",
        "en": "Tips & Discounts",
        "ko": "팁 및 할인"
      },
      "id": "cat-svadcb",
      "orderIndex": 0,
      "showOnCustomerPage": false
    },
    {
      "showOnCustomerPage": false,
      "orderIndex": 1,
      "id": "cat-7cvvkq",
      "name": {
        "en": "Refrigerated Drinks & Alcohol 🍺",
        "zh": "冰櫃酒水 🧊",
        "th": "เครื่องดื่มและสุราแช่เย็น 🍺",
        "ja": "冷蔵ドリンク・お酒 🍺",
        "vi": "Đồ uống & Rượu lạnh 🍺",
        "ko": "냉장 음료 및 주류 🍺"
      }
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 2,
      "id": "tomyum",
      "name": {
        "en": "Tom Yum Series 🍜",
        "zh": "冬蔭功系列 🍜",
        "th": "ชุดต้มยำสุดแซ่บ 🍜",
        "ja": "トムヤムシリーズ 🍜",
        "vi": "Dòng súp Tom Yum 🍜",
        "ko": "똠얌 수프 시리즈 🍜"
      }
    },
    {
      "name": {
        "ko": "따뜻한 수프 및 베트남 소고기 쌀국수 🥢",
        "vi": "Súp nóng & Phở bò Việt Nam 🥢",
        "ja": "温かいスープ・ベトナム牛肉フォー 🥢",
        "th": "ซุปร้อนและเฝอเนื้อเวียดนาม 🥢",
        "en": "Hot Soups & Beef Pho 🥢",
        "zh": "熱湯 🥢越南牛肉河粉"
      },
      "id": "noodles",
      "orderIndex": 3,
      "showOnCustomerPage": true
    },
    {
      "orderIndex": 4,
      "showOnCustomerPage": true,
      "name": {
        "ko": "셰프 추천 특선 세트 🍱",
        "vi": "Combo đặc biệt 🍱",
        "ja": "主理人厳選お得セット 🍱",
        "th": "เซตเมนูสุดคุ้ม 🍱",
        "zh": "精選套餐 🍱優惠",
        "en": "Chef's Special Combos 🍱"
      },
      "id": "combos"
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 5,
      "id": "seafood",
      "name": {
        "vi": "Hải sản nướng Thái Lan 🦐",
        "ja": "本格タイ風炭火焼きシーフード 🦐",
        "th": "อาหารทะเลเผาสูตรเด็ด 🦐",
        "en": "Signature Thai Seafood 🦐",
        "zh": "招牌泰式海鮮 🦐",
        "ko": "시그니처 태국식 해산물 🦐"
      }
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 6,
      "id": "veggies",
      "name": {
        "vi": "Rau củ tươi sạch 🥬",
        "th": "ผักสดฟาร์มย่าง 🥬",
        "ja": "地元新鮮野菜焼き 🥬",
        "zh": "小農鮮蔬菜 🥬",
        "en": "Farm Fresh Vegetables 🥬",
        "ko": "신선한 채소 구이 🥬"
      }
    },
    {
      "orderIndex": 7,
      "showOnCustomerPage": true,
      "name": {
        "ko": "오리지널 숯불 고기 꼬치 및 기타 🍢",
        "en": "Charcoal BBQ Skewers & Others 🍢",
        "zh": "碳烤肉類 🍢其他",
        "th": "บาร์บีคิวเสียบไม้ย่างและอื่นๆ 🍢",
        "vi": "Thịt nướng xiên & Khác 🍢",
        "ja": "タイ風肉串炭火焼き・その他 🍢"
      },
      "id": "skewers"
    },
    {
      "name": {
        "vi": "Tráng miệng kiểu Thái 🍰",
        "ja": "タイ風特製デザート 🍰",
        "th": "ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰",
        "zh": "泰式特色甜品 🍰",
        "en": "Thai Desserts & Sweets 🍰",
        "ko": "태국식 달콤 디저트 🍰"
      },
      "id": "sweets",
      "orderIndex": 8,
      "showOnCustomerPage": true
    },
    {
      "id": "drinks",
      "name": {
        "zh": "泰特色沁涼飲品 🍹",
        "en": "Refreshing Thai Cold Drinks 🍹",
        "ja": "タイ風さわやかドリンク 🍹",
        "vi": "Đồ uống lạnh kiểu Thái 🍹",
        "th": "เครื่องดื่มดับร้อนรสสดชื่น 🍹",
        "ko": "태국식 청량 음료 🍹"
      },
      "showOnCustomerPage": true,
      "orderIndex": 9
    },
    {
      "orderIndex": 10,
      "showOnCustomerPage": true,
      "name": {
        "en": "Exclusive Secret Sauces 🥫",
        "zh": "獨家醬料 🥫",
        "ja": "秘伝の特製タレ・ソース 🥫",
        "th": "ซอสสูตรลับพิเศษ 🥫",
        "vi": "Nước sốt độc quyền 🥫",
        "ko": "단독 수제 특제 소스 🥫"
      },
      "id": "cat-zene8j"
    },
    {
      "showOnCustomerPage": true,
      "orderIndex": 11,
      "id": "cat-6ovxss",
      "name": {
        "ko": "성인 주류 전용 구역 (18+) 🔞",
        "ja": "成人向けお酒エリア (18+) 🔞",
        "th": "โซนเครื่องดื่มแอลกอฮอล์สำหรับผู้ใหญ่ (18+) 🔞",
        "vi": "Khu vực đồ uống có cồn cho người lớn (18+) 🔞",
        "en": "Adult Alcoholic Beverages (18+) 🔞",
        "zh": "成人酒品專區 🔞"
      }
    }
  ];

  const tables: TableConfig[] = [
    {
      "positionY": 15,
      "positionX": 10,
      "id": "1",
      "preservedFor": "",
      "qrCodeUrl": "/?table=1",
      "status": "available",
      "mergedWith": ""
    },
    {
      "id": "2",
      "preservedFor": "",
      "qrCodeUrl": "//?table=2",
      "mergedWith": "",
      "status": "available",
      "positionY": 15,
      "positionX": 35
    },
    {
      "positionY": 15,
      "positionX": 60,
      "preservedFor": "",
      "id": "3",
      "mergedWith": "",
      "status": "available",
      "qrCodeUrl": "/?table=3"
    },
    {
      "positionY": 75,
      "positionX": 10,
      "preservedFor": "",
      "id": "4",
      "mergedWith": "",
      "status": "available",
      "qrCodeUrl": "/?table=4"
    },
    {
      "positionY": 45,
      "positionX": 10,
      "preservedFor": "",
      "id": "5",
      "mergedWith": "",
      "status": "available",
      "qrCodeUrl": "/?table=5"
    },
    {
      "id": "6",
      "preservedFor": "",
      "qrCodeUrl": "/?table=6",
      "status": "available",
      "mergedWith": "",
      "positionY": 45,
      "positionX": 35
    },
    {
      "mergedWith": "",
      "status": "available",
      "qrCodeUrl": "/?table=7",
      "preservedFor": "",
      "id": "7",
      "positionX": 35,
      "positionY": 75
    },
    {
      "positionY": 45,
      "positionX": 60,
      "preservedFor": "",
      "id": "8",
      "status": "available",
      "mergedWith": "",
      "qrCodeUrl": "/?table=8"
    }
  ];

  try {
    console.log('Checking database status...');
    const forceFlag = process.argv.includes('--force');
    if (!forceFlag) {
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const menuSnap = await getDocs(collection(db, 'menu'));
      if (!categoriesSnap.empty || !menuSnap.empty) {
        console.log('⚠️ [Safety Guard] Firestore database already has data. Skipping seedDefaults to prevent rolling back user edits.');
        console.log('To force override, run with --force flag: e.g., npx tsx seed-defaults.ts --force');
        process.exit(0);
      }
    }

    console.log('Starting seed process using fresh local codebase defaults...');

    // Sync collections
    await syncCollection('categories', categories, 'id', false);
    await syncCollection('menu', INITIAL_MENU, 'id', false);
    await syncCollection('ingredients', INITIAL_INGREDIENTS, 'id', false);
    await syncCollection('tables', tables, 'id', false);
    await syncCollection('reservations', [], 'id', false);
    await syncCollection('orders', [], 'id', false);

    // Sync System Settings
    console.log('Seeding system settings...');
    await setDoc(doc(db, 'settings', 'system'), cleanUndefined({
    "liveStaffPin": "952788",
    "livePrinterIp": "192.168.123.100",
    "liveTakeoutSeq": 0,
    "liveMinSpendPerPerson": 500,
    "liveOperatingHours": [
      {
        "id": "oh-1",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "start": "00:00",
        "end": "23:59",
        "name": "午餐時段 Lunch Session",
        "isActive": false,
        "isReservableOnly": false
      },
      {
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "id": "oh-2",
        "isActive": true,
        "name": "晚餐時段 Dinner Session",
        "end": "23:30",
        "start": "17:30",
        "isReservableOnly": false
      }
    ],
    "liveRestDays": [],
    "liveCustomerNotice": "📣 歡迎來到沙貝泰式炭烤！我們提供正宗的泰南冬蔭功&頂級碳烤串燒。最後點餐為23:30。內用低消每人 500 元，未達低消用餐限時 60 分鐘。祝您用餐愉快！Sabay Thai BBQ wishes you a delicious meal!",
    "liveServicePaused": false,
    "liveOptionRules": [
      {
        "category": "加配料",
        "price": 20,
        "id": "rule-1784360566576",
        "name": "加河粉"
      },
      {
        "category": "加配料",
        "price": 20,
        "id": "rule-1784360574891",
        "name": "加米線"
      },
      {
        "category": "加配料",
        "price": 140,
        "id": "rule-1784360613823",
        "name": "升級套餐(烤蔬菜+泰奶一杯)"
      }
    ],
    "livePrinterSettings": {
      "bill": {
        "usbPort": "LPT1",
        "cashDrawerEnabled": true,
        "printAddress": "桃園市大園區高鐵北路二段198號1樓",
        "restaurantName": "沙貝燒烤 SABAY BBQ",
        "printTelephone": "0966626408",
        "width": "58mm",
        "cashDrawerDriver": "ESC_POS_RAW",
        "ip": "192.168.123.100",
        "cashDrawerEscPosCommand": "1B700119FA",
        "headerPrefix": "★★★ 顧客結帳明細單 ★★★",
        "footerSuffix": "謝謝光臨，歡迎再度光臨！",
        "connectionType": "LPT",
        "printTimeEnabled": true,
        "fontSizeFactor": 0.8,
        "cashDrawerOposName": "CashDrawer1"
      },
      "kitchen": {
        "restaurantName": "沙貝燒烤",
        "printTelephone": "0966626408",
        "footerSuffix": "請主廚盡速配餐出餐！",
        "width": "80mm",
        "headerPrefix": "★★★ 廚房工作備餐單 ★★★",
        "printAddress": "桃園市大園區高鐵北路二段198號1樓",
        "usbPort": "USB001",
        "ip": "192.168.123.100",
        "fontSizeFactor": 1,
        "printTimeEnabled": true,
        "connectionType": "IP"
      }
    },
    "livePromoCombo": {
      "enabled": true,
      "eligibleItemIds": [],
      "requiredQty": 10,
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
        "enabled": false,
        "id": "rew-01",
        "fallbackPrice": 10,
        "cost": 900,
        "menuItemId": "sk-02"
      },
      {
        "id": "rew-02",
        "fallbackPrice": 10,
        "enabled": false,
        "menuItemId": "vg-01",
        "cost": 800
      },
      {
        "cost": 1800,
        "menuItemId": "dr-01",
        "enabled": false,
        "fallbackPrice": 10,
        "id": "rew-03"
      },
      {
        "enabled": false,
        "fallbackPrice": 10,
        "id": "rew-04",
        "cost": 900,
        "menuItemId": "sw-01"
      },
      {
        "cost": 2600,
        "menuItemId": "ty-01",
        "fallbackPrice": 10,
        "id": "rew-05",
        "enabled": false
      }
    ]
  }));
    console.log('✓ System settings seeded.');

    // Sync Logs
    console.log('Seeding system logs...');
    await setDoc(doc(db, 'settings', 'logs'), cleanUndefined({
      inventoryLogs: [],
      printLogs: [],
      promoNotifications: []
    }));
    console.log('✓ System logs seeded.');

    console.log('🎉 Fresh codebase defaults successfully force-uploaded to Cloud Firestore!');
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  }
}

seedDefaults();
