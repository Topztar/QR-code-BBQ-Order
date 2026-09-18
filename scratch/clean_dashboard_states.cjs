const fs = require('fs');

const path = 'c:/Works/QR-code-BBQ-Order/src/components/ManagerDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const toRemove = [
  // 1. Menu Item States
  `  const [isFormOpen, setIsFormOpen] = useState(false);\n  const [editingItem, setEditingItem] = useState<any | null>(null);\n  const [itemNames, setItemNames] = useState<Record<Language, string>>({`,
  `  });\n  const [itemDescs, setItemDescs] = useState<Record<Language, string>>({`,
  `  });\n  const [itemCategory, setItemCategory] = useState('skewers');\n  const [itemPrice, setItemPrice] = useState<number | ''>(100);\n  const [itemImage, setItemImage] = useState('');\n  const [itemThumbnailUrl, setItemThumbnailUrl] = useState('');\n  const [itemAvifUrl, setItemAvifUrl] = useState('');\n  const [itemAvifThumbnailUrl, setItemAvifThumbnailUrl] = useState('');\n  const [hasNoodles, setHasNoodles] = useState(false);\n  const [isNotSpicy, setIsNotSpicy] = useState(false);\n  const [isTakeoutAvailable, setIsTakeoutAvailable] = useState(true);\n  const [customAddOns, setCustomAddOns] = useState<{ id: string, name: string, price: number }[]>([]);\n  const [itemRecipe, setItemRecipe] = useState<{ ingredientId: string, amount: number, unit: string }[]>([]);\n  const [newRecipeIngId, setNewRecipeIngId] = useState('');\n  const [newRecipeAmount, setNewRecipeAmount] = useState('1');`,
  
  // 2. Category States
  `  const [isCatFormOpen, setIsCatFormOpen] = useState(false);\n  const [editingCategory, setEditingCategory] = useState<Category | null>(null);\n  const [catId, setCatId] = useState('');\n  const [catNameZh, setCatNameZh] = useState('');\n  const [catNameEn, setCatNameEn] = useState('');\n  const [catNameTh, setCatNameTh] = useState('');\n  const [catNameJa, setCatNameJa] = useState('');\n  const [catNameKo, setCatNameKo] = useState('');\n  const [catNameVi, setCatNameVi] = useState('');\n  const [catNameRu, setCatNameRu] = useState('');\n  const [catNameEs, setCatNameEs] = useState('');\n  const [catError, setCatError] = useState<string | null>(null);\n  const [catShowOnCustomer, setCatShowOnCustomer] = useState(true);`,

  // 3. Table States
  `  const [isTableFormOpen, setIsTableFormOpen] = useState(false);\n  const [editingTableObj, setEditingTableObj] = useState<TableConfig | null>(null);\n  const [tableIdInput, setTableIdInput] = useState('');\n  const [tableQrUrlInput, setTableQrUrlInput] = useState('');\n  const [tableMaxCapacityInput, setTableMaxCapacityInput] = useState('4');\n  const [tableError, setTableError] = useState<string | null>(null);\n  const [tableSuccess, setTableSuccess] = useState<string | null>(null);`,

  // 4. Other states already in UISlice
  `  const [isResFormOpen, setIsResFormOpen] = useState(false);\n  const [editingResObj, setEditingResObj] = useState<Reservation | null>(null);`,
  `  const [quickRestockItem, setQuickRestockItem] = useState<Ingredient | null>(null);`,
  `  const [confirmActionModal, setConfirmActionModal] = useState<any>(null);`,
  `  const [adjustPointsModal, setAdjustPointsModal] = useState<any>(null);`,
  `  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);`,
  `  const [showBulkDeleteOrdersModal, setShowBulkDeleteOrdersModal] = useState(false);`,
];

toRemove.forEach(str => {
  content = content.replace(str, '');
});

fs.writeFileSync(path, content);
console.log('Removed states.');
