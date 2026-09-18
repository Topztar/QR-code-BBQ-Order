import React, { useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { Check } from 'lucide-react';
import { Order, MenuItem, Language } from '../../../types';
import { TakeoutLiveCard } from '../TakeoutLiveCard';
import { CashierOrderCard } from '../CashierOrderCard';
import { useDashboardStore } from '../../../stores/dashboard/useDashboardStore';

export interface CashierOrderSidebarProps {
  orders: Order[];
  menuItems: MenuItem[];
  currentLang: Language;
  isOpen: boolean;
  minSpend: number;
  handleSelectCashierOrder: (orderId: string) => void;
  handleSimulateElapsedOrder: (orderId: string) => void;
  handleOpenTakeoutDetailModal: (order: Order) => void;
}

export const CashierOrderSidebar: React.FC<CashierOrderSidebarProps> = ({
  orders,
  menuItems,
  currentLang,
  isOpen,
  minSpend,
  handleSelectCashierOrder,
  handleSimulateElapsedOrder,
  handleOpenTakeoutDetailModal
}) => {
  const {
    cashierListFilter,
    setCashierListFilter,
    selectedCashierOrderId,
    simulatedElapsedOrders,
    setCopiedGoogleLinkNotice
  } = useDashboardStore();

  const filteredCashierOrders = useMemo(() => {
    switch (cashierListFilter) {
      case 'completed':
        return orders.filter(o => !o.isPaid && o.status === 'completed');
      case 'dinein':
        return orders.filter(o => !o.isPaid && o.tableNumber && !String(o.tableNumber || '').includes('外帶'));
      case 'takeout':
        return orders.filter(o => !o.isPaid && o.tableNumber && String(o.tableNumber || '').includes('外帶'));
      case 'all':
      default:
        return orders.filter(o => !o.isPaid);
    }
  }, [orders, cashierListFilter]);

  const activeTakeoutOrders = useMemo(() => {
    return orders.filter(o => !o.isPaid && ((o.tableNumber && String(o.tableNumber || '').includes('外帶')) || o.takeoutInfo));
  }, [orders]);

  const unpaidCountsByTable = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      if (!o.isPaid && o.status !== 'cancelled' && o.tableNumber) {
        const tableKey = String(o.tableNumber).trim();
        counts[tableKey] = (counts[tableKey] || 0) + 1;
      }
    }
    return counts;
  }, [orders]);

  return (
            <div className="lg:col-span-12 flex flex-col space-y-4" id="cashier-queue-panel">
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-4.5 flex flex-col min-h-[500px] overflow-hidden">
                <div className="border-b border-white/5 pb-3">
                  <h5 className="font-black text-sm tracking-wide flex items-center justify-between">
                    <span>⏳ 待結帳帳單佇列 (點擊任一項目進行結帳)</span>
                    <span className="font-mono text-xs bg-amber-500/10 border border-amber-500/25 text-[#E5B453] px-2 py-0.5 rounded-full">
                      {orders.filter(o => !o.isPaid).length} 筆未結
                    </span>
                  </h5>
                </div>

                {/* 🥡 DEDICATED TAKE-OUT ORDERS LIVE MANAGEMENT SECTION */}
                {activeTakeoutOrders.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-[#121212] border-2 border-purple-500/40 rounded-2xl p-4 my-3 shadow-xl relative overflow-hidden text-left font-sans" id="cashier-takeout-live-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🥡</span>
                        <div>
                          <h5 className="font-extrabold text-sm text-purple-300 flex items-center gap-2">
                            <span>外帶自取即時專區 (Take-out Live Hub)</span>
                            <span className="bg-purple-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full font-mono shadow">
                              {activeTakeoutOrders.length} 筆進行中
                            </span>
                          </h5>
                          <p className="text-[11px] text-purple-200/70 mt-0.5">
                            外帶顧客訂單獨立即時管理，支援快速檢視顧客姓名、預約取餐時間、一鍵撥打/複製電話及明細核對。
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        id="filter-takeout-only-btn"
                        onClick={() => setCashierListFilter('takeout')}
                        className="self-start sm:self-auto text-xs text-purple-200 hover:text-white font-bold bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span>僅看外帶佇列 ➔</span>
                      </button>
                    </div>

                    <VirtuosoGrid
                      useWindowScroll
                      data={activeTakeoutOrders}
                      computeItemKey={(_index, tOrder) => tOrder.id}
                      listClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
                      itemClassName="h-full flex flex-col"
                      itemContent={(_index, tOrder) => (
                        <TakeoutLiveCard
                          order={tOrder}
                          isSelected={selectedCashierOrderId === tOrder.id}
                          menuItems={menuItems}
                          onSelectOrder={(id) => handleSelectCashierOrder(id)}
                          onOpenDetailModal={handleOpenTakeoutDetailModal}
                        />
                      )}
                    />
                  </div>
                )}

                {/* Sub-Queue Filter Tabs */}
                <div className="flex flex-wrap gap-1 mt-3 mb-3">
                  {[
                    { id: 'all', label: '🗂️ 全部未結', count: orders.filter(o => !o.isPaid).length },
                    { id: 'completed', label: '✅ 廚房出餐完成', count: orders.filter(o => !o.isPaid && o.status === 'completed').length },
                    { id: 'dinein', label: '🪑 客席桌出席', count: orders.filter(o => !o.isPaid && o.tableNumber && !String(o.tableNumber || '').includes('外帶')).length },
                    { id: 'takeout', label: '🛍️ 外帶佇列', count: orders.filter(o => !o.isPaid && o.tableNumber && String(o.tableNumber || '').includes('外帶')).length }
                  ].map((subT) => {
                    const subCount = subT.count;
                    const isActive = cashierListFilter === subT.id;
                    return (
                      <button
                        key={subT.id}
                        type="button"
                        onClick={() => {
                          setCashierListFilter(subT.id as any);
                        }}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-bold h-8 flex items-center gap-1 cursor-pointer transition active:scale-95 ${
                          isActive
                            ? 'bg-[#E5B453] text-zinc-950 border-[#E5B453] font-black'
                            : 'bg-[#181818] text-white/50 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <span>{subT.label}</span>
                        {subCount > 0 && (
                          <span className={`font-mono text-[9px] px-1 rounded ${isActive ? 'bg-zinc-950 text-[#E5B453]' : 'bg-white/10 text-white/70'}`}>
                            {subCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Scroll Queue */}
                <div className="flex-1 overflow-y-auto pr-1 font-sans mt-2">
                  {orders.filter(o => !o.isPaid).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30 space-y-2 py-32">
                      <Check className="text-emerald-500 mx-auto" size={32} />
                      <p className="text-xs font-bold text-white/80">
                        目前全店暫無已出餐或未結帳訂單！
                      </p>
                      <p className="text-[10px]">
                        所有客人的帳目均已收銀完成。
                      </p>
                    </div>
                  ) : filteredCashierOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30 py-32">
                      <p className="text-xs font-bold">此篩選條件下無待結帳帳單</p>
                      <p className="text-[10px] mt-1">請切換其他佇列類別</p>
                    </div>
                  ) : (
                    <VirtuosoGrid
                      useWindowScroll
                      data={filteredCashierOrders}
                      computeItemKey={(_index, order) => order.id}
                      listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      itemClassName="h-full flex flex-col"
                      itemContent={(_index, order) => {
                        const tableKey = order.tableNumber ? String(order.tableNumber).trim() : '';
                        const sameTableUnpaidCount = tableKey ? (unpaidCountsByTable[tableKey] || 0) : 0;
                        const isSimulated = simulatedElapsedOrders.includes(order.id);

                        return (
                          <CashierOrderCard
                            order={order}
                            isSelected={selectedCashierOrderId === order.id}
                            isOpen={isOpen}
                            minSpend={minSpend}
                            menuItems={menuItems}
                            currentLang={currentLang}
                            isSimulated={isSimulated}
                            sameTableUnpaidCount={sameTableUnpaidCount}
                            onSelectOrder={handleSelectCashierOrder}
                            onSimulateElapsed={handleSimulateElapsedOrder}
                            onOpenTakeoutDetail={handleOpenTakeoutDetailModal}
                          />
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

  );
};
