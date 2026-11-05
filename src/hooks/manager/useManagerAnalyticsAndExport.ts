import { useState, useMemo } from 'react';
import { Order, Ingredient, Category, Language } from '../../types';
import { apiFetch } from '../../lib/api';
import { getLocalizedText } from '../../utils/i18n';
import { getStatusMeta } from '../../utils/orderUtils';
import { exportToCSV } from '../../components/manager/ManagerDashboardUtils';

interface UseManagerAnalyticsAndExportParams {
  orders: Order[];
  menuItems: any[];
  ingredients: Ingredient[];
  categories: Category[];
  currentLang: Language;
  analytics: {
    totalRevenue: number;
    ordersCount: number;
    categorySales: { category: string; revenue: number }[];
    hourlyDistribution: { timeSlot: string; orders: number }[];
    topDishes: { name: string; qty: number }[];
    stockWarnings: Ingredient[];
  };
  dbInventoryLogs: any[];
}

export function useManagerAnalyticsAndExport({
  orders,
  menuItems,
  ingredients,
  categories,
  currentLang,
  analytics,
  dbInventoryLogs,
}: UseManagerAnalyticsAndExportParams) {
  // CSV Export states
  const [csvExportSuccess, setCsvExportSuccess] = useState<string | null>(null);
  const [csvExportError, setCsvExportError] = useState<string | null>(null);

  // Sales Query states
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [orderQueryStartDate, setOrderQueryStartDate] = useState('');
  const [orderQueryEndDate, setOrderQueryEndDate] = useState('');
  const [orderQueryStatus, setOrderQueryStatus] = useState<string>('all');
  const [orderQueryKeyword, setOrderQueryKeyword] = useState('');

  const handleExportLast30DaysOrdersCSV = async () => {
    try {
      setCsvExportError(null);
      setCsvExportSuccess(null);

      // Attempt true server-side historical query first (up to 1,000 orders spanning 30 days)
      let candidateOrders: Order[] = [];
      try {
        const res = await apiFetch('/api/orders/export?days=30');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            candidateOrders = data.orders;
          }
        }
      } catch (networkErr) {
        console.warn('[ManagerDashboard] Server-side export query failed, falling back to local memory orders cache:', networkErr);
      }

      // Graceful fallback to client orders cache if server query returned empty or failed
      if (candidateOrders.length === 0) {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        candidateOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt).getTime();
          return order.status === 'completed' && orderDate >= thirtyDaysAgo;
        });
      }

      if (candidateOrders.length === 0) {
        setCsvExportError('在過去 30 天內沒有找到已完成的訂單。 No completed orders found in the last 30 days.');
        return;
      }

      // Sort chronological (oldest to newest)
      const sortedOrders = [...candidateOrders].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const flatData = sortedOrders.map(order => {
        const itemSummaries = order.items.map((it) => {
          const customizationDetails: string[] = [];
          if (it.customization?.spiciness !== undefined) {
            customizationDetails.push(`辣：${it.customization.spiciness === 1 ? '辣味' : '不辣'}`);
          }
          if (it.customization?.noodleType) {
            const noodle = it.customization.noodleType === 'rice-noodle' ? '河粉' : (it.customization.noodleType === 'vermicelli' ? '米線' : '無');
            customizationDetails.push(`麵：${noodle}`);
          }
          if (it.customization?.soupBase === 'coconut-milk') {
            customizationDetails.push('湯：椰奶');
          }
          if (it.customization?.selectedAddOns && it.customization.selectedAddOns.length > 0) {
            const addOnsText = it.customization.selectedAddOns.map((addon: any) => `+${getLocalizedText(addon.name, 'zh')} x${addon.qty || 1}`).join(',');
            customizationDetails.push(`加購配料：${addOnsText}`);
          }
          if (it.customization?.notes) {
            customizationDetails.push(`備註：${it.customization.notes}`);
          }
          const customizationStr = customizationDetails.length > 0 ? ` [${customizationDetails.join('; ')}]` : '';
          return `${getLocalizedText(it.name, 'zh')} x${it.qty}${customizationStr}`;
        }).join(' | ');

        return {
          id: order.id,
          tableNumber: order.tableNumber,
          status: order.status,
          isPaid: order.isPaid ? 'YES' : 'NO',
          paymentMethod: order.paymentMethod || '未填/未指定',
          subtotal: order.subtotal,
          serviceCharge: order.serviceCharge,
          discount: order.discount || 0,
          total: order.total,
          createdAt: new Date(order.createdAt).toISOString(),
          itemsSummary: itemSummaries
        };
      });

      const headersMap: Record<string, string> = {
        id: 'Order ID / 訂單編號',
        tableNumber: 'Table Number / 桌號外帶號',
        status: 'Order Status / 訂單狀態',
        isPaid: 'Is Paid / 是否已結帳',
        paymentMethod: 'Payment Method / 付款方式',
        subtotal: 'Subtotal / 小計',
        serviceCharge: 'Service Charge (10%) / 服務費',
        discount: 'Discount / 折扣',
        total: 'Total Revenue / 總計金額',
        createdAt: 'Created Time / 成立時間',
        itemsSummary: 'Items Detail / 餐點客製明細'
      };

      exportToCSV(flatData, headersMap, `Sabay_Accounting_Orders_30Days_${new Date().toISOString().split('T')[0]}.csv`);

      setCsvExportSuccess(`已成功儲存 30 天內已完成餐點對帳明細 (共 ${sortedOrders.length} 筆)！`);
      setTimeout(() => {
        setCsvExportSuccess(null);
      }, 5000);
    } catch (err: any) {
      console.error('CSV Export Error:', err);
      setCsvExportError(`匯出 CSV 失敗: ${err.message || '未知錯誤'}`);
    }
  };

  // Order Filtering Engine
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    const todayStr = new Date().toISOString().split('T')[0];

    if (dateRangeFilter === 'today') {
      list = list.filter(o => o.createdAt.startsWith(todayStr));
    } else if (dateRangeFilter === 'week') {
      const sevenDays = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      list = list.filter(o => new Date(o.createdAt) >= sevenDays);
    } else if (dateRangeFilter === 'month') {
      const thirtyDays = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      list = list.filter(o => new Date(o.createdAt) >= thirtyDays);
    } else if (dateRangeFilter === 'custom') {
      if (orderQueryStartDate) {
        const start = new Date(orderQueryStartDate + 'T00:00:00');
        list = list.filter(o => new Date(o.createdAt) >= start);
      }
      if (orderQueryEndDate) {
        const end = new Date(orderQueryEndDate + 'T23:59:59');
        list = list.filter(o => new Date(o.createdAt) <= end);
      }
    }

    if (orderQueryStatus !== 'all') {
      list = list.filter(o => o.status === orderQueryStatus);
    }

    if (orderQueryKeyword.trim()) {
      const k = orderQueryKeyword.toLowerCase().trim();
      list = list.filter(o =>
        o.id.toLowerCase().includes(k) ||
        o.customerName.toLowerCase().includes(k) ||
        (o.tableNumber && o.tableNumber.includes(k))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, dateRangeFilter, orderQueryStartDate, orderQueryEndDate, orderQueryStatus, orderQueryKeyword]);

  // Aggregate stats in the filtered interval:
  const filteredStats = useMemo(() => {
    const activeOrders = filteredOrders.filter(o => o && o.status !== 'cancelled');
    const totalRev = activeOrders.reduce((sum, o) => sum + (o?.total || 0), 0);
    const count = filteredOrders.length;
    const aov = count > 0 ? Math.round(totalRev / count) : 0;

    const memberSales = activeOrders.filter(o => o?.isMember).reduce((sum, o) => sum + (o?.total || 0), 0);
    const memberShare = totalRev > 0 ? (memberSales / totalRev) * 100 : 0;

    return { revenue: totalRev, count, aov, memberShare };
  }, [filteredOrders]);

  // Export Orders CSV Report
  const handleExportOrdersReport = () => {
    const flatData = filteredOrders.map(o => ({
      id: o.id || '',
      createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A',
      tableNumber: o.tableNumber || 'N/A',
      customerName: o.customerName || 'N/A',
      paymentMethod: o.paymentMethod === 'twqr' ? 'TWQR支付' : (o.paymentMethod === 'credit' ? '信用卡' : (o.paymentMethod === 'member' ? '會員儲值' : '現金')),
      subtotal: o.subtotal || 0,
      serviceCharge: o.serviceCharge || 0,
      total: o.total || 0,
      status: getStatusMeta(o.status).label,
      isMember: o.isMember ? '實體貴賓會員' : '非會員一般餐客'
    }));
    const map = {
      id: '訂單單號', createdAt: '銷售日期時間', tableNumber: '桌位號碼',
      customerName: '客戶名稱', paymentMethod: '付清途徑',
      subtotal: '餐點小計金額', serviceCharge: '服務費', total: '結賬實付總金額',
      status: '點單狀態', isMember: '是否為實體會員'
    };
    exportToCSV(flatData, map, `沙貝燒烤-銷售財務報表-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export Inventory CSV Report
  const handleExportInventoryReport = () => {
    const flatData = dbInventoryLogs.map(l => ({
      timestamp: new Date(l.timestamp).toLocaleString(),
      ingredientName: l.ingredientName,
      type: l.type === 'incoming' ? '大批入採進貨' : (l.type === 'outgoing' ? '顧客消費抵消' : '手控盤核壞報'),
      quantityChanged: `${l.quantityChanged > 0 ? '+' : ''}${l.quantityChanged}`,
      remainingStock: l.remainingStock,
      note: l.note
    }));
    const map = {
      timestamp: '交易過帳時間', ingredientName: '原料名稱',
      type: '交易屬性型態', quantityChanged: '異動數量增減',
      remainingStock: '期末殘存現有庫量', note: '盤損事件錄記備註'
    };
    exportToCSV(flatData, map, `沙貝燒烤-進銷存流帳報表-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Dynamic aggregation fallback: when backend bootstrap analytics is zeroed, derive real-time metrics from live synced orders & ingredients
  const effectiveAnalytics = useMemo(() => {
    if (analytics && analytics.ordersCount > 0 && analytics.totalRevenue > 0) {
      return analytics;
    }

    const activeOrders = (orders || []).filter(o => o && o.status !== 'cancelled');
    const totalRev = activeOrders.reduce((sum, o) => sum + (o?.total || 0), 0);
    const count = activeOrders.length;

    // Category Sales breakdown
    const catSalesMap: Record<string, number> = {};
    activeOrders.forEach(o => {
      (o.items || []).forEach(it => {
        const menuItem = menuItems.find(m => m.id === it.menuItemId || m.id === it.id);
        const catId = menuItem?.category || 'other';
        const lineTotal = (it.price || 0) * (it.qty || 1);
        catSalesMap[catId] = (catSalesMap[catId] || 0) + lineTotal;
      });
    });
    const categorySales = Object.entries(catSalesMap)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // Hourly distribution
    const hourMap: Record<string, number> = {};
    activeOrders.forEach(o => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        if (!isNaN(d.getTime())) {
          const slot = `${d.getHours().toString().padStart(2, '0')}:00`;
          hourMap[slot] = (hourMap[slot] || 0) + 1;
        }
      }
    });
    const hourlyDistribution = Object.entries(hourMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timeSlot, ordersCount]) => ({ timeSlot, orders: ordersCount }));

    // Top selling dishes
    const dishMap: Record<string, number> = {};
    activeOrders.forEach(o => {
      (o.items || []).forEach(it => {
        const dishName = typeof it.name === 'string'
          ? it.name
          : (getLocalizedText(it.name, currentLang) || '餐點');
        dishMap[dishName] = (dishMap[dishName] || 0) + (it.qty || 1);
      });
    });
    const topDishes = Object.entries(dishMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 12);

    // Stock warnings
    const stockWarnings = (ingredients || []).filter(
      ig => typeof ig.stock === 'number' && typeof ig.minThreshold === 'number' && ig.stock <= ig.minThreshold
    );

    return {
      totalRevenue: totalRev,
      ordersCount: count,
      categorySales,
      hourlyDistribution,
      topDishes,
      stockWarnings,
    };
  }, [analytics, orders, menuItems, ingredients, currentLang]);

  const chartCategoryData = useMemo(() => {
    return effectiveAnalytics.categorySales.map((item) => {
      const foundCat = categories.find((c) => c.id === item.category);
      return {
        name: foundCat ? getLocalizedText(foundCat.name, currentLang) : (item.category === 'other' ? '其他餐點' : item.category),
        '營業額 NT$': item.revenue,
      };
    });
  }, [effectiveAnalytics.categorySales, categories, currentLang]);

  const chartHourlyData = useMemo(() => {
    return effectiveAnalytics.hourlyDistribution.map((item) => ({
      '用餐時段': item.timeSlot,
      '下單數量': item.orders,
    }));
  }, [effectiveAnalytics.hourlyDistribution]);

  const recipeCompositionMap: { [dishId: string]: { name: string; qty: string }[] } = useMemo(() => ({
    'dish-2602121834434': [
      { name: 'Choice 原肉板腱牛', qty: '140g' },
      { name: '秘傳泰式香料鹽', qty: '5g' }
    ],
    'dish-2509281752083': [
      { name: '台灣深海 L 號大魷魚', qty: '1隻' },
      { name: '獨門泰式酸辣沾醬', qty: '30ml' }
    ],
    'dish-2508252136150': [
      { name: '澳洲進口小羔羊肉串', qty: '10串' },
      { name: '特級孜然香料粉', qty: '8g' }
    ],
    'dish-2508252133258': [
      { name: '黃金牛肋肉塊', qty: '10串' },
      { name: '特製黑胡椒烤肉醬', qty: '20ml' }
    ]
  }), []);

  return {
    csvExportSuccess,
    csvExportError,
    handleExportLast30DaysOrdersCSV,
    dateRangeFilter,
    setDateRangeFilter,
    orderQueryStartDate,
    setOrderQueryStartDate,
    orderQueryEndDate,
    setOrderQueryEndDate,
    orderQueryStatus,
    setOrderQueryStatus,
    orderQueryKeyword,
    setOrderQueryKeyword,
    filteredOrders,
    filteredStats,
    handleExportOrdersReport,
    handleExportInventoryReport,
    effectiveAnalytics,
    chartCategoryData,
    chartHourlyData,
    recipeCompositionMap,
  };
}

