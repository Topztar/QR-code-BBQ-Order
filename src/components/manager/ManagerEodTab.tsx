import React from 'react';
import { Calendar } from 'lucide-react';
import { Ingredient, Order } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { safeStorage } from '../../lib/safeStorage';
import { apiFetch } from '../../lib/api';
import { printViaBridge } from '../../lib/posBridgeClient';
import {
  getLocalDateString,
  isOrderOnLocalDate,
  calculateOrderTotalWithPayment
} from './ManagerDashboardUtils';
import { PrinterConfig } from './ManagerPrinterTab';

const localStorage = safeStorage;

interface ManagerEodTabProps {
  orders: Order[];
  ingredients: Ingredient[];
  menuItems: any[];
  eodSelectedDate: string;
  setEodSelectedDate: (date: string) => void;
  recipeCompositionMap: { [dishId: string]: { name: string; qty: string }[] };
  billPrinter: PrinterConfig;
  posBridgeUrl: string;
  printerIp: string;
  onRestock: (id: string, amount: number) => Promise<void>;
  fetchInventoryLogs: () => Promise<void>;
  onPayOrder?: (
    orderId: string,
    checkoutData?: {
      paymentMethod?: string;
      subtotal?: number;
      serviceCharge?: number;
      total?: number;
      discount?: number;
      isPaid?: boolean;
    },
    skipRefresh?: boolean
  ) => Promise<void>;
  setPrintConfirmData: (data: any) => void;
}

export const ManagerEodTab: React.FC<ManagerEodTabProps> = ({
  orders,
  ingredients,
  menuItems,
  eodSelectedDate,
  setEodSelectedDate,
  recipeCompositionMap,
  billPrinter,
  posBridgeUrl,
  printerIp,
  onRestock,
  fetchInventoryLogs,
  onPayOrder,
  setPrintConfirmData,
}) => {
  const todayStr = getLocalDateString();
  const isToday = eodSelectedDate === todayStr;

  // Filter orders strictly for the selected settlement date (defaulting to today)
  const dailyOrders = orders.filter(o => isOrderOnLocalDate(o.createdAt, eodSelectedDate));
  const paidOrders = dailyOrders.filter(o => o.isPaid);
  const unpaidOrders = dailyOrders.filter(o => !o.isPaid && o.status !== 'cancelled');

  const totalRev = paidOrders.reduce((sum, ord) => sum + calculateOrderTotalWithPayment(ord, menuItems).total, 0);
  const cashSum = paidOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, ord) => sum + calculateOrderTotalWithPayment(ord, menuItems).total, 0);
  const creditSum = paidOrders.filter(o => o.paymentMethod === 'credit').reduce((sum, ord) => sum + calculateOrderTotalWithPayment(ord, menuItems).total, 0);
  const twqrSum = paidOrders.filter(o => o.paymentMethod === 'twqr').reduce((sum, ord) => sum + calculateOrderTotalWithPayment(ord, menuItems).total, 0);
  const memberSum = paidOrders.filter(o => o.paymentMethod === 'member').reduce((sum, ord) => sum + calculateOrderTotalWithPayment(ord, menuItems).total, 0);

  // Calculate quantities of each item sold ON THIS SETTLEMENT DAY
  const itemQuants: { [name: string]: { zh: string; qty: number } } = {};
  paidOrders.forEach(o => {
    o.items.forEach(it => {
      const label = getLocalizedText(it.name, 'zh');
      if (!itemQuants[label]) {
        itemQuants[label] = { zh: label, qty: 0 };
      }
      itemQuants[label].qty += it.qty;
    });
  });

  // Calculate standard ingredient consumption based on recipes FOR THIS SETTLEMENT DAY
  const calculatedDeductions: { [ingId: string]: number } = {};
  ingredients.forEach(ig => {
    calculatedDeductions[ig.id] = 0;
  });

  paidOrders.forEach(o => {
    o.items.forEach(it => {
      const targetKey = it.menuItemId || it.id;
      const recipe = recipeCompositionMap[targetKey] || recipeCompositionMap[it.id];
      if (recipe) {
        recipe.forEach(rec => {
          const ingObj = ingredients.find(ig => getLocalizedText(ig.name, 'zh') === rec.name || ig.id === rec.name);
          if (ingObj) {
            const match = rec.qty.match(/([\d\.]+)/);
            const amountPerItem = match ? parseFloat(match[1]) : 1;
            calculatedDeductions[ingObj.id] += amountPerItem * it.qty;
          }
        });
      }
    });
  });

  const handlePerformInventoryEodDeduction = async () => {
    let successCount = 0;
    try {
      for (const ig of ingredients) {
        const consumption = calculatedDeductions[ig.id] || 0;
        if (consumption > 0) {
          const res = await apiFetch('/api/inventory/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredientId: ig.id,
              quantityChanged: -consumption,
              note: `EOD 每日關帳自動扣減 (${eodSelectedDate})：已售餐品配方消耗核銷`
            })
          });
          if (res.ok) {
            successCount++;
          }
        }
      }
      alert(`🎉 庫存連動扣除成功！已為您同步自動化核銷對應 ${successCount} 項餐品配方食材物料流向 (${eodSelectedDate})。`);
      if (ingredients.length > 0) {
        await onRestock(ingredients[0].id, 0); // Sync parent state
      }
      await fetchInventoryLogs();
    } catch (err) {
      console.error(err);
      alert('❌ 自動配方庫存扣減時發生預期外錯誤');
    }
  };

  const handleEodReceiptPrint = () => {
    const lines = Object.entries(itemQuants).map(([lbl, val]) => `  • ${lbl.padEnd(16)} x${val.qty}`).join('\n');
    const ingredientLines = ingredients.map(ig => {
      const consumption = calculatedDeductions[ig.id] || 0;
      return `  • ${getLocalizedText(ig.name, 'zh').padEnd(12)}: 剩餘 ${ig.stock} ${ig.unit} (當日已扣減 ${consumption} ${ig.unit})`;
    }).join('\n');

    const receiptBody = `
========================================
       沙貝燒烤 (每日營業結算日報表)
========================================
列印時間: ${new Date().toLocaleString()}
結算日期: ${eodSelectedDate} ${isToday ? '(今日)' : ''}
-----------------------------------------
【${isToday ? '今日' : eodSelectedDate} 營業數據加總】
實收總額 (Net Revenue): NT$ ${totalRev} 元
成功收款單數 (Paid Bills): ${paidOrders.length} 筆
未收細單單數 (Unpaid Bills): ${unpaidOrders.length} 筆

【付款方式明細匯總】
  - 💵 現金收銀 (Cash):   NT$ ${cashSum} 元
  - 💳 信用卡結 (Credit): NT$ ${creditSum} 元
  - 🖥️ 行動支付 (TWQR):   NT$ ${twqrSum} 元
  - 👤 會員儲值 (Member): NT$ ${memberSum} 元
-----------------------------------------
【餐點熱銷排行明細】
${lines || `  (${isToday ? '今日' : eodSelectedDate} 尚無完成收銀單商品)`}
-----------------------------------------
【連動數據庫存原料位變動】
${ingredientLines || '  (尚無庫存異動記錄)'}
-----------------------------------------
設定店名: ${billPrinter.restaurantName}
聯絡電話: ${billPrinter.printTelephone}
店鋪地址: ${billPrinter.printAddress}
========================================
    `.trim();

    // Direct POS bridge / backend print dispatch
    const targetPort = billPrinter.usbPort?.includes(':') ? billPrinter.usbPort.toUpperCase() : `${billPrinter.usbPort?.toUpperCase() || 'LPT1'}:`;
    printViaBridge({
      text: receiptBody,
      port: targetPort,
      autoOpenDrawer: false
    }, posBridgeUrl).catch(() => {});

    apiFetch('/api/printer/print-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'eod',
        text: receiptBody,
        settings: { ...billPrinter, usbPort: targetPort },
        title: `每日結算日報表 (${eodSelectedDate})`
      })
    }).catch(() => {});

    const pWin = window.open();
    if (pWin) {
      pWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>SABAY 每日結帳報表 (EOD) - ${eodSelectedDate}</title>
            <style>
              body {
                font-family: "Microsoft JhengHei", "PingFang TC", "Heiti TC", "Noto Sans TC", "Segoe UI", sans-serif, monospace;
                background: #fff;
                color: #000;
                padding: 20px;
                font-size: ${billPrinter.width === '58mm' ? '12px' : '14px'};
                max-width: ${billPrinter.width === '58mm' ? '280px' : '400px'};
                margin: 0 auto;
                white-space: pre-wrap;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <pre style="font-family: inherit;">${receiptBody}</pre>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      pWin.document.close();
    }
  };

  const handleCompleteEodAndLogout = () => {
    alert('🏁 每日關帳作業與庫存對帳已核銷完畢，即將登出工作人員並鎖定客用介面！');
    localStorage.removeItem('google-current-member');
    localStorage.removeItem('line-profile');
    window.location.href = '/';
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left font-sans" id="subtab-section-eod">
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏁</span>
            <div>
              <h4 className="font-bold text-sm text-white">沙貝每日關帳結核系統 (Daily Business EOD Checkout Portal)</h4>
              <p className="text-white/40 text-xs">執行每日店面關帳結算，一鍵更新餐點銷售與原料配銷，產印熱感報表與結存變更，強化營運動能。</p>
            </div>
          </div>

          {/* Settlement Date Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-black/40 border border-white/10 p-1.5 rounded-xl text-xs">
            <span className="text-zinc-400 font-semibold pl-1.5 flex items-center gap-1">
              <Calendar size={13} className="text-[#E5B453]" />
              結算日期:
            </span>
            <input
              type="date"
              value={eodSelectedDate}
              onChange={(e) => {
                if (e.target.value) setEodSelectedDate(e.target.value);
              }}
              className="bg-zinc-900 border border-white/10 text-[#E5B453] font-mono font-bold px-2 py-1 rounded-lg text-xs outline-none focus:border-[#E5B453]"
            />
            <button
              type="button"
              onClick={() => setEodSelectedDate(todayStr)}
              className={`px-2 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                isToday ? 'bg-[#E5B453] text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              今日 (Today)
            </button>
            <button
              type="button"
              onClick={() => {
                const y = new Date(Date.now() - 24 * 3600 * 1000);
                setEodSelectedDate(getLocalDateString(y));
              }}
              className={`px-2 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                !isToday && eodSelectedDate === getLocalDateString(new Date(Date.now() - 24 * 3600 * 1000))
                  ? 'bg-[#E5B453] text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              昨日 (Yesterday)
            </button>
          </div>
        </div>

        {/* Stats KPI Card in Checkout Panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="text-center p-2.5 bg-zinc-900 border border-white/5 rounded-lg">
            <span className="text-[10px] text-zinc-500 block font-semibold">{isToday ? '今日' : eodSelectedDate} 關帳實收金額</span>
            <span className="text-lg font-mono font-black text-[#E5B453]">NT$ {totalRev}</span>
          </div>
          <div className="text-center p-2.5 bg-zinc-900 border border-white/5 rounded-lg">
            <span className="text-[10px] text-zinc-500 block font-semibold">已收款單數 ({isToday ? '今日' : '當日'})</span>
            <span className="text-lg font-mono font-black text-white">{paidOrders.length} 筆</span>
          </div>
          <div className="text-center p-2.5 bg-zinc-900 border border-white/5 rounded-lg">
            <span className="text-[10px] text-zinc-500 block font-semibold">現金收訖 (Cash)</span>
            <span className="text-lg font-mono font-black text-emerald-400">NT$ {cashSum}</span>
          </div>
          <div className="text-center p-2.5 bg-zinc-900 border border-white/5 rounded-lg">
            <span className="text-[10px] text-zinc-500 block font-semibold">信用卡收訖 (Credit)</span>
            <span className="text-lg font-mono font-black text-blue-400">NT$ {creditSum}</span>
          </div>
          <div className="text-center p-2.5 bg-zinc-900 border border-white/5 rounded-lg">
            <span className="text-[10px] text-zinc-500 block font-semibold">TWQR/會員扣抵合計</span>
            <span className="text-lg font-mono font-black text-teal-400">NT$ {twqrSum + memberSum}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Unpaid orders & Payment State transitions */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4">
            <div className="space-y-0.5 border-b border-white/5 pb-2">
              <h5 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                ⏱️ 待核銷未收細單明細 ({unpaidOrders.length})
              </h5>
              <p className="text-[10px] text-zinc-500">此為 {isToday ? '今日' : eodSelectedDate} 仍維持未結帳狀態之點單，關帳前可一鍵變更支付方式或進行收銀狀態流轉。</p>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unpaidOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500 italic">
                  🎉 太棒了！{isToday ? '今日' : eodSelectedDate} 已無任何未結帳點單。
                </div>
              ) : (
                unpaidOrders.map(ord => {
                  const ordTot = calculateOrderTotalWithPayment(ord, menuItems).total;
                  return (
                    <div key={ord.id} className="p-3 bg-zinc-900/80 rounded-lg border border-white/5 text-xs text-zinc-300 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-white">{ord.id.slice(-6).toUpperCase()} ({ord.tableNumber} 桌)</span>
                        <span className="font-mono text-[#E5B453] font-black">NT$ {ordTot}</span>
                      </div>
                      
                      <div className="flex gap-1.5 pt-1 border-t border-white/5">
                        {(['cash', 'credit', 'twqr'] as const).map(pm => (
                          <button
                            key={pm}
                            type="button"
                            onClick={async () => {
                              if (onPayOrder) {
                                await onPayOrder(ord.id, {
                                  paymentMethod: pm,
                                  isPaid: true
                                });
                                alert(`💸 已將點單 ${ord.id.slice(-6).toUpperCase()} 修改為【已結款 (${pm === 'cash' ? '現金' : pm === 'credit' ? '信用卡' : 'TWQR'})】`);
                              }
                            }}
                            className="flex-1 py-1 rounded bg-zinc-800 hover:bg-[#E5B453] hover:text-black transition-colors text-[9px] font-black cursor-pointer"
                          >
                            {pm === 'cash' ? '現結' : pm === 'credit' ? '刷卡' : 'TWQR'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Inventory deductions analysis */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4">
            <div className="space-y-0.5 border-b border-white/5 pb-2">
              <h5 className="font-bold text-xs text-white uppercase tracking-wider">
                📦 連動「數據庫存」{isToday ? '今日' : eodSelectedDate} 配餐配銷扣減
              </h5>
              <p className="text-[10px] text-zinc-500">系統即時比對 {isToday ? '今日' : eodSelectedDate} 已收款餐品之食材配方，模擬計算當日營業流失的理論庫存量。</p>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-white/5 space-y-1.5 max-h-72 overflow-y-auto">
                {ingredients.map(ig => {
                  const consumption = calculatedDeductions[ig.id] || 0;
                  const isWarning = ig.stock - consumption <= ig.minThreshold;
                  return (
                    <div key={ig.id} className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span>{getLocalizedText(ig.name, 'zh')}</span>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-zinc-500">{isToday ? '今日' : '當日'}應扣: </span>
                        <span className="text-amber-400 font-bold pr-2">{consumption} {ig.unit}</span>
                        <span className="text-zinc-500">預估剩餘: </span>
                        <span className={isWarning ? 'text-rose-400 font-black' : 'text-zinc-300'}>
                          {Math.max(0, Math.round((ig.stock - consumption) * 100) / 100)} {ig.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handlePerformInventoryEodDeduction}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xs tracking-wider transition active:scale-95 cursor-pointer uppercase text-center shadow-lg"
              >
                📊 連動扣減：一鍵對應「數據庫存」扣位
              </button>
            </div>
          </div>

          {/* Column 3: Print Receipt Preview layout */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4">
            <div className="space-y-0.5 border-b border-white/5 pb-2">
              <h5 className="font-bold text-xs text-white uppercase tracking-wider">
                🖨️ 每日營業關帳日報表列印預覽
              </h5>
              <p className="text-[10px] text-zinc-500">根據當前設定之熱感式出單硬體寬度（目前：{billPrinter.width}），模擬產生實體對帳聯（含原料變動紀錄）。</p>
            </div>

            {/* Thermal paper simulator */}
            <div className="bg-zinc-950 border border-white/15 p-4 rounded-xl text-[10px] font-mono text-zinc-300 pointer-events-none select-none max-h-64 overflow-y-auto space-y-1 leading-tight">
              <p className="text-center font-bold text-white">沙貝燒烤 每日營業日報表</p>
              <p className="text-[9px] text-[#E5B453] text-center font-bold">結算日期: {eodSelectedDate} {isToday ? '(今日)' : ''}</p>
              <p className="text-[9px] text-zinc-500 text-center">列印時間: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              <div className="border-t border-dashed border-zinc-700 my-1"></div>
              <div className="flex justify-between">
                <span>{isToday ? '今日' : '當日'}實收總額 (Net):</span>
                <span className="font-bold text-[#E5B453]">NT$ {totalRev}</span>
              </div>
              <div className="flex justify-between">
                <span>成功收款單數:</span>
                <span>{paidOrders.length} 筆</span>
              </div>
              <div className="flex justify-between">
                <span>未收細單單數:</span>
                <span>{unpaidOrders.length} 筆</span>
              </div>
              <div className="border-t border-dashed border-zinc-700 my-1"></div>
              <p className="text-[9px] text-[#E5B453] uppercase font-bold">付款方式細點明細:</p>
              <p>  💵 現金收銀 (Cash):   NT$ {cashSum}元</p>
              <p>  💳 信用卡結 (Credit): NT$ {creditSum}元</p>
              <p>  🖥️ 行動支付 (TWQR):   NT$ {twqrSum}元</p>
              <p>  👤 会員帳抵 (Member): NT$ {memberSum}元</p>
              <div className="border-t border-dashed border-zinc-700 my-1"></div>
              <p className="text-[9px] text-[#E5B453] uppercase font-bold">{isToday ? '今日' : '當日'}餐點熱售排行:</p>
              {Object.entries(itemQuants).length === 0 ? (
                <p className="italic text-zinc-650">  ({isToday ? '今日' : eodSelectedDate} 尚無完成結帳商品)</p>
              ) : (
                Object.entries(itemQuants).map(([lbl, val]) => (
                  <p key={lbl}>  • {lbl.slice(0, 10).padEnd(12)} x{val.qty}</p>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const lines = Object.entries(itemQuants).map(([lbl, val]) => `  • ${lbl.padEnd(16)} x${val.qty}`).join('\n');
                const ingredientLines = ingredients.map(ig => {
                  const consumption = calculatedDeductions[ig.id] || 0;
                  return `  • ${getLocalizedText(ig.name, 'zh').padEnd(12)}: 剩餘 ${ig.stock} ${ig.unit} (當日已扣減 ${consumption} ${ig.unit})`;
                }).join('\n');

                const receiptBody = `
========================================
       沙貝燒烤 (每日營業結算日報表)
========================================
列印時間: ${new Date().toLocaleString()}
結算日期: ${eodSelectedDate} ${isToday ? '(今日)' : ''}
-----------------------------------------
【${isToday ? '今日' : eodSelectedDate} 營業數據加總】
實收總額 (Net Revenue): NT$ ${totalRev} 元
成功收款單數 (Paid Bills): ${paidOrders.length} 筆
未收細單單數 (Unpaid Bills): ${unpaidOrders.length} 筆

【付款方式明細匯總】
  - 💵 現金收銀 (Cash):   NT$ ${cashSum} 元
  - 💳 信用卡結 (Credit): NT$ ${creditSum} 元
  - 🖥️ 行動支付 (TWQR):   NT$ ${twqrSum} 元
  - 👤 會員儲值 (Member): NT$ ${memberSum} 元
-----------------------------------------
【餐點熱銷排行明細】
${lines || `  (${isToday ? '今日' : eodSelectedDate} 尚無完成收銀單商品)`}
-----------------------------------------
【連動數據庫存原料位變動】
${ingredientLines || '  (尚無庫存異動記錄)'}
-----------------------------------------
設定店名: ${billPrinter.restaurantName}
聯絡電話: ${billPrinter.printTelephone}
店鋪地址: ${billPrinter.printAddress}
========================================`.trim();

                setPrintConfirmData({
                  title: `列印每日營業結算日報表 (${eodSelectedDate})`,
                  ip: printerIp,
                  receiptType: 'eod',
                  receiptBody: receiptBody,
                  onConfirm: handleEodReceiptPrint
                });
              }}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-bold rounded-lg text-xs transition active:scale-95 cursor-pointer uppercase text-center"
            >
              🖨️ 列印預覽並傳送至熱感印表機 (Print)
            </button>
          </div>
        </div>

        {/* Action and Safe lock Gate */}
        <div className="bg-[#202020] border border-rose-500/20 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold text-rose-400 tracking-widest block uppercase">🏁 安全結帳與登出強制安全鎖</span>
            <p className="text-[11px] text-zinc-400">執行總營業終結轉後，為求當日帳款安全，系統將自動清理當日點餐通道並登出，返回訪客用餐前台頁面。</p>
          </div>
          
          <button
            type="button"
            onClick={handleCompleteEodAndLogout}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg text-xs tracking-wider transition active:scale-95 cursor-pointer uppercase text-center whitespace-nowrap shrink-0"
          >
            🏁 立即執行每日總結帳登出 Exit Safely
          </button>
        </div>
      </div>
    </div>
  );
};
