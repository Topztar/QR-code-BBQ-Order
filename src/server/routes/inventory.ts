import express from 'express';
import { Ingredient } from '../../types';

export interface InventoryLog {
  id: string;
  timestamp: string;
  ingredientId: string;
  ingredientName: string;
  type: 'incoming' | 'outgoing' | 'adjustment';
  quantityChanged: number;
  remainingStock: number;
  note?: string;
}

export interface InventoryRouteContext {
  getLiveIngredients: () => Ingredient[];
  setLiveIngredients: (ings: Ingredient[]) => void;
  getInventoryLogs: () => InventoryLog[];
  setInventoryLogs: (logs: InventoryLog[]) => void;
  saveStateToDisk: () => void;
}

export function registerInventoryRoutes(app: express.Express, ctx: InventoryRouteContext) {
  const {
    getLiveIngredients,
    getInventoryLogs,
    saveStateToDisk
  } = ctx;

  // 2. Get Live Ingredients Inventory
  app.get('/api/ingredients', (_req, res) => {
    res.json(getLiveIngredients());
  });

  // Restock Raw Materials
  app.post('/api/ingredients/restock', (req, res) => {
    const id = req.body.id || req.body.ingredientId;
    const numAmount = Number(req.body.amount !== undefined ? req.body.amount : req.body.quantityAdded);
    
    if (!id) {
      return res.status(400).json({ error: 'Missing ingredient id' });
    }
    if (isNaN(numAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const liveIngredients = getLiveIngredients();
    const inventoryLogs = getInventoryLogs();
    const ingredient = liveIngredients.find(i => i.id === id);
    if (ingredient) {
      ingredient.stock = Math.round((ingredient.stock + numAmount) * 100) / 100;
      inventoryLogs.push({
        id: `ir-restock-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ingredientId: id,
        ingredientName: ingredient.name.zh,
        type: 'incoming',
        quantityChanged: numAmount,
        remainingStock: ingredient.stock,
        note: '後台手動原料大批進貨'
      });
      saveStateToDisk();
      return res.json({ success: true, ingredient });
    }
    res.status(404).json({ error: 'Ingredient not found' });
  });

  // Create a New Ingredient
  app.post('/api/ingredients', (req, res) => {
    const { id, name, stock, minThreshold, unit } = req.body;
    if (!id || !name || !name.zh) {
      return res.status(400).json({ error: '缺少識別碼或中文名稱 / Missing required ID or Name' });
    }
    const liveIngredients = getLiveIngredients();
    const exists = liveIngredients.some(ig => ig.id === id);
    if (exists) {
      return res.status(400).json({ error: '該原料識別碼已存在 / Ingredient ID already exists' });
    }

    const finalName = {
      zh: name.zh,
      en: name.en || name.zh,
      ko: name.ko || name.zh,
      ja: name.ja || name.zh,
      th: name.th || name.zh,
    };

    const stockNum = Number(stock) || 0;
    const newIngredient = {
      id,
      name: finalName,
      stock: Math.round(stockNum * 100) / 100,
      minThreshold: Number(minThreshold) || 0,
      unit: unit || 'kg',
    };

    liveIngredients.push(newIngredient);

    const inventoryLogs = getInventoryLogs();
    inventoryLogs.push({
      id: `ir-init-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ingredientId: id,
      ingredientName: finalName.zh,
      type: 'incoming',
      quantityChanged: stockNum,
      remainingStock: stockNum,
      note: '新增原料：初始建置庫存'
    });

    saveStateToDisk();
    res.json({ success: true, ingredient: newIngredient });
  });

  // Get Inventory Logs (Cursor / Paginated)
  app.get('/api/inventory/logs', (req, res) => {
    const limitNum = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const inventoryLogs = getInventoryLogs();
    const sorted = [...inventoryLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const sliced = sorted.slice(offset, offset + limitNum);
    const hasMore = offset + limitNum < sorted.length;
    const lastDocId = sliced.length > 0 ? sliced[sliced.length - 1].id : null;

    res.json({ logs: sliced, lastDocId, hasMore, total: sorted.length });
  });

  // Get Materialized View Inventory Stats
  app.get('/api/inventory/stats', (_req, res) => {
    res.json({ item_sales: {}, total_orders: 0 });
  });

  // Adjust Inventory manually
  app.post('/api/inventory/adjust', (req, res) => {
    const { ingredientId, quantityChanged, note } = req.body;
    const liveIngredients = getLiveIngredients();
    const ingredient = liveIngredients.find(ig => ig.id === ingredientId);
    if (!ingredient) {
      return res.status(404).json({ error: '材料不存在 / Ingredient not found' });
    }
    const change = Number(quantityChanged);
    if (isNaN(change)) {
      return res.status(400).json({ error: '無效的異動數量 / Invalid amount' });
    }
    ingredient.stock = Math.round((ingredient.stock + change) * 100) / 100;
    
    const inventoryLogs = getInventoryLogs();
    const newLog: InventoryLog = {
      id: `ir-adj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ingredientId,
      ingredientName: ingredient.name.zh,
      type: 'adjustment',
      quantityChanged: change,
      remainingStock: ingredient.stock,
      note: note || '後台手動庫存核計調整'
    };
    inventoryLogs.push(newLog);
    saveStateToDisk();
    res.json({ success: true, ingredient, log: newLog });
  });
}
