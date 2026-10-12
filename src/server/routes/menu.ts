import express from 'express';
import { MenuItem, Category } from '../../types';

export interface MenuRouteContext {
  getLiveMenu: () => MenuItem[];
  setLiveMenu: (menu: MenuItem[]) => void;
  getLiveCategories: () => Category[];
  setLiveCategories: (cats: Category[]) => void;
  getLiveOptionRules: () => any[];
  setLiveOptionRules: (rules: any[]) => void;
  getLivePromoCombo: () => any;
  setLivePromoCombo: (combo: any) => void;
  getLivePromoCombos: () => any[];
  setLivePromoCombos: (combos: any[]) => void;
  checkAndRestoreSoldOutMenuItems: () => boolean;
  sanitizeMenu: (menu: MenuItem[]) => void;
  saveStateToDisk: () => void;
}

export function toPublicMenuItem(m: MenuItem) {
  return {
    id: m.id,
    category: m.category,
    name: m.name,
    price: m.price,
    image: m.image,
    thumbnailUrl: m.thumbnailUrl,
    avifUrl: m.avifUrl,
    avifThumbnailUrl: m.avifThumbnailUrl,
    description: m.description,
    available: m.available,
    soldOutType: m.soldOutType || (m.available ? 'none' : 'permanent'),
    soldOutDate: m.soldOutDate,
    soldOutAt: m.soldOutAt,
    isSetMeal: m.isSetMeal,
    requiredSaucesOption: m.requiredSaucesOption,
    hasNoodlesOption: m.hasNoodlesOption,
    hasCoconutsMilkOption: m.hasCoconutsMilkOption,
    containsBeef: m.containsBeef,
    containsPork: m.containsPork,
    containsSeafood: m.containsSeafood,
    isNotSpicy: m.isNotSpicy,
    customAddOns: m.customAddOns,
    recipe: m.recipe,
    orderIndex: m.orderIndex,
    isTakeoutAvailable: m.isTakeoutAvailable,
    showOnCustomerPage: m.showOnCustomerPage
  };
}

export function registerMenuRoutes(app: express.Express, ctx: MenuRouteContext) {
  const {
    getLiveMenu,
    setLiveMenu,
    getLiveCategories,
    setLiveCategories,
    getLiveOptionRules,
    setLiveOptionRules,
    getLivePromoCombo,
    setLivePromoCombo,
    getLivePromoCombos,
    setLivePromoCombos,
    checkAndRestoreSoldOutMenuItems,
    sanitizeMenu,
    saveStateToDisk
  } = ctx;

  // 1. Get Live Menu Items
  app.get('/api/menu', (_req, res) => {
    checkAndRestoreSoldOutMenuItems();
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
    res.json(getLiveMenu().map(toPublicMenuItem));
  });

  // Create live menu item
  app.post('/api/menu', (req, res) => {
    const { category, name, price, image, thumbnailUrl, avifUrl, avifThumbnailUrl, description, available, isSetMeal, requiredSaucesOption, hasNoodlesOption, hasCoconutsMilkOption, containsBeef, containsPork, containsSeafood, isNotSpicy, isTakeoutAvailable, customAddOns, recipe, trackInventory, inventoryCount } = req.body;
    
    if (!category || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields (category, name, price)' });
    }

    const liveMenu = getLiveMenu();
    const isAvail = available !== undefined ? !!available : true;
    const cleanImage = typeof image === 'string' ? image.trim() : (image || '');
    const newItem: MenuItem = {
      id: `dish-${Date.now()}`,
      category,
      name: typeof name === 'object' ? name : { zh: name || '', en: name || '', ko: name || '', ja: name || '', th: name || '', vi: name || '', ru: name || '', es: name || '' },
      price: Number(price),
      image: cleanImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
      thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : (thumbnailUrl || undefined),
      avifUrl: typeof avifUrl === 'string' ? avifUrl.trim() : (avifUrl || undefined),
      avifThumbnailUrl: typeof avifThumbnailUrl === 'string' ? avifThumbnailUrl.trim() : (avifThumbnailUrl || undefined),
      description: typeof description === 'object' ? description : { zh: description || '', en: description || '', ko: description || '', ja: description || '', th: description || '', vi: description || '', ru: description || '', es: description || '' },
      available: isAvail,
      soldOutAt: !isAvail ? new Date().toISOString() : null,
      isSetMeal: !!isSetMeal,
      requiredSaucesOption: !!requiredSaucesOption,
      hasNoodlesOption: !!hasNoodlesOption,
      hasCoconutsMilkOption: !!hasCoconutsMilkOption,
      containsBeef: !!containsBeef,
      containsPork: !!containsPork,
      containsSeafood: !!containsSeafood,
      isNotSpicy: !!isNotSpicy,
      isTakeoutAvailable: isTakeoutAvailable !== undefined ? !!isTakeoutAvailable : true,
      trackInventory: trackInventory !== undefined ? !!trackInventory : false,
      inventoryCount: trackInventory ? Number(inventoryCount || 0) : undefined,
      customAddOns: Array.isArray(customAddOns) ? customAddOns : [],
      recipe: Array.isArray(recipe) ? recipe : undefined,
      orderIndex: liveMenu.length
    };

    sanitizeMenu([newItem]);
    liveMenu.push(newItem);
    setLiveMenu(liveMenu);
    saveStateToDisk();
    res.status(201).json(newItem);
  });

  // Reorder menu items (MUST be before PUT /api/menu/:id to avoid Express matching 'reorder' as :id)
  app.put('/api/menu/reorder', (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Invalid order parameter / 排序屬性無效' });
    }
    const liveMenu = getLiveMenu();
    const reordered: MenuItem[] = [];
    order.forEach((id: string) => {
      const item = liveMenu.find(m => m.id === id);
      if (item) {
        reordered.push(item);
      }
    });
    liveMenu.forEach((item) => {
      if (!reordered.find(r => r.id === item.id)) {
        reordered.push(item);
      }
    });
    reordered.forEach((item, index) => {
      item.orderIndex = index;
    });
    setLiveMenu(reordered);
    saveStateToDisk();
    res.json({ success: true, menu: reordered.map(toPublicMenuItem) });
  });

  // Update live menu item
  app.put('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    const { category, name, price, image, thumbnailUrl, avifUrl, avifThumbnailUrl, description, available, soldOutType, soldOutDate, isSetMeal, requiredSaucesOption, hasNoodlesOption, hasCoconutsMilkOption, containsBeef, containsPork, containsSeafood, isNotSpicy, isTakeoutAvailable, customAddOns, recipe, trackInventory, inventoryCount } = req.body;
    
    const liveMenu = getLiveMenu();
    const itemIndex = liveMenu.findIndex(m => m.id === id);
    if (itemIndex > -1) {
      const cleanImage = image !== undefined ? (typeof image === 'string' ? image.trim() : image) : liveMenu[itemIndex].image;
      const cleanThumb = thumbnailUrl !== undefined ? (typeof thumbnailUrl === 'string' ? thumbnailUrl.trim() : thumbnailUrl) : liveMenu[itemIndex].thumbnailUrl;
      const cleanAvif = avifUrl !== undefined ? (typeof avifUrl === 'string' ? avifUrl.trim() : avifUrl) : liveMenu[itemIndex].avifUrl;
      const cleanAvifThumb = avifThumbnailUrl !== undefined ? (typeof avifThumbnailUrl === 'string' ? avifThumbnailUrl.trim() : avifThumbnailUrl) : liveMenu[itemIndex].avifThumbnailUrl;
      const targetAvailable = available !== undefined ? !!available : liveMenu[itemIndex].available;
      let targetSoldOutAt = liveMenu[itemIndex].soldOutAt;
      if (!targetAvailable) {
        if (!targetSoldOutAt) {
          targetSoldOutAt = new Date().toISOString();
        }
      } else {
        targetSoldOutAt = null;
      }

      liveMenu[itemIndex] = {
        ...liveMenu[itemIndex],
        category: category || liveMenu[itemIndex].category,
        name: name !== undefined ? (typeof name === 'object' ? name : { zh: name || '', en: name || '', ko: name || '', ja: name || '', th: name || '', vi: name || '', ru: name || '', es: name || '' }) : liveMenu[itemIndex].name,
        price: price !== undefined ? Number(price) : liveMenu[itemIndex].price,
        image: cleanImage,
        thumbnailUrl: cleanThumb,
        avifUrl: cleanAvif,
        avifThumbnailUrl: cleanAvifThumb,
        description: description !== undefined ? (typeof description === 'object' ? description : { zh: description || '', en: description || '', ko: description || '', ja: description || '', th: description || '', vi: description || '', ru: description || '', es: description || '' }) : liveMenu[itemIndex].description,
        available: targetAvailable,
        soldOutType: soldOutType !== undefined ? soldOutType : (targetAvailable ? 'none' : (liveMenu[itemIndex].soldOutType || 'permanent')),
        soldOutDate: soldOutDate !== undefined ? soldOutDate : liveMenu[itemIndex].soldOutDate,
        soldOutAt: targetSoldOutAt,
        isSetMeal: isSetMeal !== undefined ? !!isSetMeal : liveMenu[itemIndex].isSetMeal,
        requiredSaucesOption: requiredSaucesOption !== undefined ? !!requiredSaucesOption : liveMenu[itemIndex].requiredSaucesOption,
        hasNoodlesOption: hasNoodlesOption !== undefined ? !!hasNoodlesOption : liveMenu[itemIndex].hasNoodlesOption,
        hasCoconutsMilkOption: hasCoconutsMilkOption !== undefined ? !!hasCoconutsMilkOption : liveMenu[itemIndex].hasCoconutsMilkOption,
        containsBeef: containsBeef !== undefined ? !!containsBeef : liveMenu[itemIndex].containsBeef,
        containsPork: containsPork !== undefined ? !!containsPork : liveMenu[itemIndex].containsPork,
        containsSeafood: containsSeafood !== undefined ? !!containsSeafood : liveMenu[itemIndex].containsSeafood,
        isNotSpicy: isNotSpicy !== undefined ? !!isNotSpicy : liveMenu[itemIndex].isNotSpicy,
        isTakeoutAvailable: isTakeoutAvailable !== undefined ? !!isTakeoutAvailable : (liveMenu[itemIndex].isTakeoutAvailable !== undefined ? liveMenu[itemIndex].isTakeoutAvailable : true),
        trackInventory: trackInventory !== undefined ? !!trackInventory : (liveMenu[itemIndex].trackInventory || false),
        inventoryCount: trackInventory ? Number(inventoryCount || 0) : liveMenu[itemIndex].inventoryCount,
        customAddOns: Array.isArray(customAddOns) ? customAddOns : liveMenu[itemIndex].customAddOns,
        recipe: Array.isArray(recipe) ? recipe : liveMenu[itemIndex].recipe
      };
      sanitizeMenu([liveMenu[itemIndex]]);
      saveStateToDisk();
      return res.json(toPublicMenuItem(liveMenu[itemIndex]));
    }
    res.status(404).json({ error: 'Item not found' });
  });

  // Toggle item availability
  app.post('/api/menu/toggle-available', (req, res) => {
    const { id, targetType } = req.body;
    const liveMenu = getLiveMenu();
    const item = liveMenu.find(m => m.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.available) {
      item.available = false;
      item.soldOutType = targetType || 'permanent';
      item.soldOutAt = new Date().toISOString();
      if (item.soldOutType === 'daily') {
        item.soldOutDate = new Date().toISOString().split('T')[0];
      } else {
        item.soldOutDate = undefined;
      }
    } else {
      item.available = true;
      item.soldOutType = 'none';
      item.soldOutAt = null;
      item.soldOutDate = undefined;
    }

    saveStateToDisk();
    res.json({ success: true, item: toPublicMenuItem(item) });
  });

  // Delete live menu item
  app.delete('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    let liveMenu = getLiveMenu();
    const initialLen = liveMenu.length;
    liveMenu = liveMenu.filter(m => m.id !== id);
    if (liveMenu.length !== initialLen) {
      setLiveMenu(liveMenu);
      saveStateToDisk();
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Item not found' });
  });

  // Categories Endpoints
  app.get('/api/categories', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
    res.json(getLiveCategories());
  });

  app.post('/api/categories', (req, res) => {
    const { id, name, showOnCustomerPage } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'Missing required category fields' });
    }
    const liveCategories = getLiveCategories();
    const existing = liveCategories.find(c => c.id === id);
    if (existing) {
      return res.status(400).json({ error: 'Category ID already exists' });
    }
    const newCategory: Category = {
      id,
      name: typeof name === 'object' ? name : { zh: name, en: name },
      showOnCustomerPage: showOnCustomerPage !== undefined ? !!showOnCustomerPage : true
    };
    liveCategories.push(newCategory);
    setLiveCategories(liveCategories);
    saveStateToDisk();
    res.status(201).json(newCategory);
  });

  app.put('/api/categories/reorder', (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Invalid order parameter' });
    }
    const liveCategories = getLiveCategories();
    const reordered: Category[] = [];
    order.forEach((id: string) => {
      const cat = liveCategories.find(c => c.id === id);
      if (cat) reordered.push(cat);
    });
    liveCategories.forEach((cat) => {
      if (!reordered.find(r => r.id === cat.id)) {
        reordered.push(cat);
      }
    });
    setLiveCategories(reordered);
    saveStateToDisk();
    res.json({ success: true, categories: reordered });
  });

  app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const { name, showOnCustomerPage } = req.body;
    const liveCategories = getLiveCategories();
    const cat = liveCategories.find(c => c.id === id);
    if (cat) {
      if (name !== undefined) {
        cat.name = typeof name === 'object' ? name : { zh: name, en: name };
      }
      if (showOnCustomerPage !== undefined) {
        cat.showOnCustomerPage = !!showOnCustomerPage;
      }
      saveStateToDisk();
      return res.json({ success: true, category: cat });
    }
    res.status(404).json({ error: 'Category not found' });
  });

  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    let liveCategories = getLiveCategories();
    const initialLen = liveCategories.length;
    liveCategories = liveCategories.filter(c => c.id !== id);
    if (liveCategories.length !== initialLen) {
      setLiveCategories(liveCategories);
      saveStateToDisk();
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Category not found' });
  });

  // Global Option Rules
  app.get('/api/option-rules', (_req, res) => {
    res.json(getLiveOptionRules());
  });

  app.post('/api/option-rules', (req, res) => {
    const { name, category, price } = req.body;
    if (!name) return res.status(400).json({ error: 'Rule name is required' });
    const liveOptionRules = getLiveOptionRules();
    const newRule = {
      id: `rule-${Date.now()}`,
      name,
      category: category || '其他',
      price: Number(price) || 0
    };
    liveOptionRules.push(newRule);
    saveStateToDisk();
    res.status(201).json(newRule);
  });

  app.delete('/api/option-rules/:id', (req, res) => {
    const { id } = req.params;
    let liveOptionRules = getLiveOptionRules();
    const initLen = liveOptionRules.length;
    liveOptionRules = liveOptionRules.filter((r: any) => r.id !== id);
    if (liveOptionRules.length !== initLen) {
      setLiveOptionRules(liveOptionRules);
      saveStateToDisk();
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Rule not found' });
  });

  // Promo Combo
  app.get('/api/promo-combo', (_req, res) => {
    res.json({
      promoCombo: getLivePromoCombo(),
      promoCombos: getLivePromoCombos()
    });
  });

  app.post('/api/promo-combo', (req, res) => {
    const { enabled, requiredQty, discountAmount, eligibleItemIds, combos } = req.body;
    if (Array.isArray(combos)) {
      setLivePromoCombos(combos);
      if (combos.length > 0) {
        setLivePromoCombo(combos[0]);
      }
    } else {
      const updated = {
        enabled: !!enabled,
        requiredQty: Number(requiredQty) || 10,
        discountAmount: Number(discountAmount) || 20,
        eligibleItemIds: Array.isArray(eligibleItemIds) ? eligibleItemIds : []
      };
      setLivePromoCombo(updated);
      setLivePromoCombos([updated]);
    }
    saveStateToDisk();
    res.json({
      success: true,
      promoCombo: getLivePromoCombo(),
      promoCombos: getLivePromoCombos()
    });
  });
}
