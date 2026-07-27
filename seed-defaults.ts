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
        "zh": "小費及折扣",
        "en": "Tips & Discounts",
        "ko": "팁 및 할인",
        "th": "ทิปและส่วนลด",
        "vi": "Tiền tip & Giảm giá",
        "ja": "チップ・割引"
      },
      "orderIndex": 0,
      "showOnCustomerPage": false,
      "id": "cat-svadcb"
    },
    {
      "orderIndex": 1,
      "name": {
        "zh": "冰櫃酒水 🧊",
        "en": "Refrigerated Drinks & Alcohol 🍺",
        "th": "เครื่องดื่มและสุราแช่เย็น 🍺",
        "ko": "냉장 음료 및 주류 🍺",
        "ja": "冷蔵ドリンク・お酒 🍺",
        "vi": "Đồ uống & Rượu lạnh 🍺"
      },
      "id": "cat-7cvvkq",
      "showOnCustomerPage": false
    },
    {
      "showOnCustomerPage": true,
      "id": "tomyum",
      "name": {
        "en": "Tom Yum Series 🍜",
        "zh": "冬蔭功系列 🍜",
        "vi": "Dòng súp Tom Yum 🍜",
        "ja": "トムヤムシリーズ 🍜",
        "ko": "똠얌 수프 시리즈 🍜",
        "th": "ชุดต้มยำสุดแซ่บ 🍜"
      },
      "orderIndex": 2
    },
    {
      "orderIndex": 3,
      "name": {
        "zh": "熱湯 🥢越南牛肉河粉",
        "en": "Hot Soups & Beef Pho 🥢",
        "vi": "Súp nóng & Phở bò Việt Nam 🥢",
        "ja": "温かいスープ・ベトナム牛肉フォー 🥢",
        "ko": "따뜻한 수프 및 베트남 소고기 쌀국수 🥢",
        "th": "ซุปร้อนและเฝอเนื้อเวียดนาม 🥢"
      },
      "id": "noodles",
      "showOnCustomerPage": true
    },
    {
      "orderIndex": 4,
      "name": {
        "zh": "精選套餐 🍱優惠",
        "en": "Chef's Special Combos 🍱",
        "th": "เซตเมนูสุดคุ้ม 🍱",
        "ko": "셰프 추천 특선 세트 🍱",
        "vi": "Combo đặc biệt 🍱",
        "ja": "主理人厳選お得セット 🍱"
      },
      "id": "combos",
      "showOnCustomerPage": true
    },
    {
      "orderIndex": 5,
      "name": {
        "en": "Signature Thai Seafood 🦐",
        "zh": "招牌泰式海鮮 🦐",
        "vi": "Hải sản nướng Thái Lan 🦐",
        "ja": "本格タイ風炭火焼きシーフード 🦐",
        "th": "อาหารทะเลเผาสูตรเด็ด 🦐",
        "ko": "시그니처 태국식 해산물 🦐"
      },
      "id": "seafood",
      "showOnCustomerPage": true
    },
    {
      "id": "veggies",
      "showOnCustomerPage": true,
      "orderIndex": 6,
      "name": {
        "en": "Farm Fresh Vegetables 🥬",
        "zh": "小農鮮蔬菜 🥬",
        "ko": "신선한 채소 구이 🥬",
        "th": "ผักสดฟาร์มย่าง 🥬",
        "ja": "地元新鮮野菜焼き 🥬",
        "vi": "Rau củ tươi sạch 🥬"
      }
    },
    {
      "id": "skewers",
      "showOnCustomerPage": true,
      "orderIndex": 7,
      "name": {
        "en": "Charcoal BBQ Skewers & Others 🍢",
        "zh": "碳烤肉類 🍢其他",
        "ko": "오리지널 숯불 고기 꼬치 및 기타 🍢",
        "th": "บาร์บีคิวเสียบไม้ย่างและอื่นๆ 🍢",
        "ja": "タイ風肉串炭火焼き・その他 🍢",
        "vi": "Thịt nướng xiên & Khác 🍢"
      }
    },
    {
      "id": "sweets",
      "showOnCustomerPage": true,
      "orderIndex": 8,
      "name": {
        "ja": "タイ風特製デザート 🍰",
        "vi": "Tráng miệng kiểu Thái 🍰",
        "th": "ขนมหวานและพุดดิ้งสูตรพิเศษ 🍰",
        "ko": "태국식 달콤 디저트 🍰",
        "en": "Thai Desserts & Sweets 🍰",
        "zh": "泰式特色甜品 🍰"
      }
    },
    {
      "id": "drinks",
      "showOnCustomerPage": true,
      "orderIndex": 9,
      "name": {
        "th": "เครื่องดื่มดับร้อนรสสดชื่น 🍹",
        "ko": "태국식 청량 음료 🍹",
        "ja": "タイ風さわやかドリンク 🍹",
        "vi": "Đồ uống lạnh kiểu Thái 🍹",
        "zh": "泰特色沁涼飲品 🍹",
        "en": "Refreshing Thai Cold Drinks 🍹"
      }
    },
    {
      "showOnCustomerPage": true,
      "id": "cat-zene8j",
      "name": {
        "vi": "Nước sốt độc quyền 🥫",
        "ja": "秘伝の特製タレ・ソース 🥫",
        "ko": "단독 수제 특제 소스 🥫",
        "th": "ซอสสูตรลับพิเศษ 🥫",
        "zh": "獨家醬料 🥫",
        "en": "Exclusive Secret Sauces 🥫"
      },
      "orderIndex": 10
    },
    {
      "showOnCustomerPage": true,
      "id": "cat-6ovxss",
      "name": {
        "ja": "成人向けお酒エリア (18+) 🔞",
        "vi": "Khu vực đồ uống có cồn cho người lớn (18+) 🔞",
        "th": "โซนเครื่องดื่มแอลกอฮอล์สำหรับผู้ใหญ่ (18+) 🔞",
        "ko": "성인 주류 전용 구역 (18+) 🔞",
        "en": "Adult Alcoholic Beverages (18+) 🔞",
        "zh": "成人酒品專區 🔞"
      },
      "orderIndex": 11
    }
  ];

  const tables: TableConfig[] = [
    {
      "id": "1",
      "status": "available",
      "mergedWith": "",
      "preservedFor": "",
      "positionY": 15,
      "positionX": 10,
      "qrCodeUrl": "/?table=1"
    },
    {
      "preservedFor": "",
      "positionX": 35,
      "positionY": 15,
      "qrCodeUrl": "//?table=2",
      "id": "2",
      "status": "available",
      "mergedWith": ""
    },
    {
      "preservedFor": "",
      "qrCodeUrl": "/?table=3",
      "positionX": 60,
      "positionY": 15,
      "status": "available",
      "mergedWith": "",
      "id": "3"
    },
    {
      "qrCodeUrl": "/?table=4",
      "positionY": 75,
      "positionX": 10,
      "preservedFor": "",
      "mergedWith": "",
      "status": "available",
      "id": "4"
    },
    {
      "positionX": 10,
      "positionY": 45,
      "qrCodeUrl": "/?table=5",
      "preservedFor": "",
      "id": "5",
      "mergedWith": "",
      "status": "in_use"
    },
    {
      "id": "6",
      "status": "available",
      "mergedWith": "",
      "preservedFor": "",
      "qrCodeUrl": "/?table=6",
      "positionY": 45,
      "positionX": 35
    },
    {
      "positionX": 35,
      "qrCodeUrl": "/?table=7",
      "positionY": 75,
      "preservedFor": "",
      "mergedWith": "",
      "status": "available",
      "id": "7"
    },
    {
      "positionY": 45,
      "positionX": 60,
      "qrCodeUrl": "/?table=8",
      "preservedFor": "",
      "mergedWith": "",
      "status": "available",
      "id": "8"
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
        "start": "11:00",
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
