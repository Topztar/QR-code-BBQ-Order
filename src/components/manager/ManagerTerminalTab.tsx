import React from 'react';
import { ShoppingBag, Minimize2, Maximize2, ShoppingCart, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Category, Language, TableConfig } from '../../types';
import { getLocalizedText } from '../../utils/i18n';

interface ManagerTerminalTabProps {
  currentLang: Language;
  menuItems: any[];
  categories: Category[];
  tables: TableConfig[];
  terminalCategory: string;
  setTerminalCategory: (cat: string) => void;
  terminalTable: string;
  setTerminalTable: (tbl: string) => void;
  terminalCart: any[];
  setTerminalCart: React.Dispatch<React.SetStateAction<any[]>>;
  terminalPage: number;
  setTerminalPage: React.Dispatch<React.SetStateAction<number>>;
  terminalCartPage: number;
  setTerminalCartPage: React.Dispatch<React.SetStateAction<number>>;
  isTerminalFullScreen: boolean;
  setIsTerminalFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  onPlaceOrder?: (orderData: any) => Promise<any>;
}

export const ManagerTerminalTab: React.FC<ManagerTerminalTabProps> = ({
  currentLang,
  menuItems,
  categories,
  tables,
  terminalCategory,
  setTerminalCategory,
  terminalTable,
  setTerminalTable,
  terminalCart,
  setTerminalCart,
  terminalPage,
  setTerminalPage,
  terminalCartPage,
  setTerminalCartPage,
  isTerminalFullScreen,
  setIsTerminalFullScreen,
  onPlaceOrder,
}) => {
  const filteredMenuItems = menuItems.filter(item => item.available && (terminalCategory === 'all' || item.category === terminalCategory));
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredMenuItems.length / itemsPerPage));
  const currentPage = Math.min(terminalPage, totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredMenuItems.slice(startIndex, startIndex + itemsPerPage);

  const cartItemsPerPage = 5;
  const totalCartPages = Math.max(1, Math.ceil(terminalCart.length / cartItemsPerPage));
  const currentCartPage = Math.min(terminalCartPage, totalCartPages);
  const cartStartIndex = (currentCartPage - 1) * cartItemsPerPage;
  const paginatedCartItems = terminalCart.slice(cartStartIndex, cartStartIndex + cartItemsPerPage);

  return (
    <div className={isTerminalFullScreen ? "fixed inset-0 z-50 bg-[#0c0c0c] p-6 flex flex-col h-screen w-screen overflow-hidden animate-fadeIn" : "space-y-6 animate-fadeIn"} id="subtab-section-terminal">
      <div className={`bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl relative ${isTerminalFullScreen ? 'h-full flex flex-col overflow-hidden' : 'overflow-hidden'}`}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#E5B453] flex items-center gap-2">
              <ShoppingBag size={22} />
              管理員快速點餐終端 (Resilient Terminal)
            </h3>
            <p className="text-xs text-white/40">具備獨立運作能力。離線時訂單將存入本地事務隊列，恢復連線後自動對賬。</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTerminalFullScreen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
            >
              {isTerminalFullScreen ? (
                <>
                  <Minimize2 size={14} className="text-[#E5B453]" />
                  <span>退出全螢幕 Exit</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} className="text-[#E5B453]" />
                  <span>全螢幕 Fullscreen</span>
                </>
              )}
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${navigator.onLine ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-bounce'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{navigator.onLine ? 'Online' : 'OFFLINE - Local Auth Mode'}</span>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-[26%_74%] ${isTerminalFullScreen ? 'h-full flex-1 min-h-0' : 'h-[650px]'} gap-8`}>
          {/* 1. 訂單預覽與送出 (Cart on the Left) */}
          <div className="bg-black/20 rounded-xl p-5 border border-white/5 flex flex-col h-full min-h-0 justify-between">
            <div className="flex flex-col flex-1 min-h-0">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-tighter border-b border-white/5 pb-2 mb-4 shrink-0">點餐籃 Cart</h4>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0 custom-scrollbar">
                {terminalCart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/10">
                    <ShoppingCart size={32} className="mb-2 opacity-30" />
                    <p className="text-[10px]">請從右側點選菜品</p>
                  </div>
                ) : (
                  paginatedCartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-xs">
                      <span className="font-bold text-white">{getLocalizedText(item.name, 'zh')}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white/40">x{item.qty}</span>
                        <span className="font-mono text-[#E5B453]">${item.price * item.qty}</span>
                        <button onClick={() => setTerminalCart(prev => prev.filter(i => i.id !== item.id))} className="text-rose-500 hover:text-rose-400 cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-4 shrink-0">
              <div className="flex justify-between text-sm font-black text-white">
                <span>總計 Total</span>
                <span className="text-[#E5B453] font-mono">${terminalCart.reduce((s, i) => s + (i.price * i.qty), 0)}</span>
              </div>
              <button
                onClick={async () => {
                  if (!onPlaceOrder) return;
                  const success = await onPlaceOrder({
                    tableNumber: terminalTable,
                    items: terminalCart,
                    paymentMethod: 'cash',
                    guestCount: 1
                  });
                  if (success) {
                    setTerminalCart([]);
                    alert('訂單已送出' + (navigator.onLine ? '' : ' (進入離線事務隊列)'));
                  }
                }}
                className={`w-full py-3 bg-[#E5B453] text-black font-black text-sm rounded-xl transition-all active:scale-95 ${terminalCart.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-amber-400 cursor-pointer'}`}
                disabled={terminalCart.length === 0}
              >
                🚀 {navigator.onLine ? '即時送出訂單' : '存入離線事務隊列 (Offline Submit)'}
              </button>

              {/* Pagination under the Cart container as well for seamless dual control */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => setTerminalCartPage(p => Math.max(1, p - 1))}
                  disabled={currentCartPage === 1 || terminalCart.length === 0}
                  className="flex-1 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                >
                  <ChevronLeft size={16} className="text-[#E5B453]" />
                  <span>上一頁 Prev</span>
                </button>
                <span className="text-xs font-bold font-mono text-white/80 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  {currentCartPage} / {totalCartPages}
                </span>
                <button
                  onClick={() => setTerminalCartPage(p => Math.min(totalCartPages, p + 1))}
                  disabled={currentCartPage === totalCartPages || terminalCart.length === 0}
                  className="flex-1 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>下一頁 Next</span>
                  <ChevronRight size={16} className="text-[#E5B453]" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. 選單選購區 (Menu on the Right) */}
          <div className="space-y-4 flex flex-col justify-between h-full min-h-0">
            <div className="space-y-4 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white/60 uppercase tracking-tighter">菜單 Menu</h4>
                  <span className="text-[10px] font-mono text-white/30">
                    ({getLocalizedText(categories.find(c => c.id === terminalCategory)?.name, currentLang) || '全部 All'})
                  </span>
                </div>
                <select
                  value={terminalTable}
                  onChange={(e) => setTerminalTable(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-[#E5B453] font-bold outline-none cursor-pointer"
                >
                  {tables.map(t => <option key={t.id} value={t.id}>桌號: {t.id}</option>)}
                  <option value="takeout">外帶 Takeout</option>
                </select>
              </div>

              {/* 菜色分類標籤控制 Categories Panel */}
              <div className="flex border border-[#008ec4] bg-[#008ec4] rounded-lg overflow-hidden shrink-0" id="terminal-categories-panel">
                <button
                  id="btn-term-cat-all"
                  onClick={() => setTerminalCategory('all')}
                  className={`flex-1 py-3 text-center text-xs font-black transition-all cursor-pointer outline-none border-r border-white/10 last:border-r-0 ${
                    terminalCategory === 'all'
                      ? 'bg-[#8ac249] text-white font-extrabold'
                      : 'bg-[#008ec4] text-white hover:bg-[#007cb3]'
                  }`}
                >
                  全部 All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    id={`btn-term-cat-${cat.id}`}
                    onClick={() => setTerminalCategory(cat.id)}
                    className={`flex-1 py-3 text-center text-xs font-black transition-all cursor-pointer outline-none border-r border-white/10 last:border-r-0 ${
                      terminalCategory === cat.id
                        ? 'bg-[#8ac249] text-white font-extrabold'
                        : 'bg-[#008ec4] text-white hover:bg-[#007cb3]'
                    }`}
                  >
                    {getLocalizedText(cat.name, currentLang) || cat.id}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col justify-between min-h-0">
                <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 py-2">
                  {paginatedItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTerminalCart(prev => {
                          const existing = prev.find(i => i.menuItemId === item.id);
                          if (existing) {
                            return prev.map(i => i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i);
                          }
                          return [...prev, {
                            id: `term-${Date.now()}`,
                            menuItemId: item.id,
                            name: item.name,
                            price: item.price,
                            qty: 1,
                            customization: { spiciness: 0, notes: "" }
                          }];
                        });
                      }}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 text-left flex flex-col justify-between transition-all cursor-pointer w-full h-full min-h-[100px] aspect-[1.3/1] shadow-lg hover:border-[#E5B453]/40 active:scale-95 group"
                    >
                      <div className="text-[clamp(10px,1.15vw,14px)] font-black text-white group-hover:text-[#E5B453] leading-snug tracking-tight whitespace-normal break-words overflow-hidden" style={{ wordBreak: 'break-word' }}>
                        {getLocalizedText(item.name, 'zh')}
                      </div>
                      <div className="text-[clamp(9px,1vw,12px)] font-mono font-black text-[#E5B453] text-right shrink-0 mt-1">
                        $ {item.price}
                      </div>
                    </button>
                  ))}
                  {paginatedItems.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-white/20">
                      無可用菜品 No items available
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5 shrink-0">
                  <button
                    onClick={() => setTerminalPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <ChevronLeft size={16} className="text-[#E5B453]" />
                    <span>上一頁 Prev Page</span>
                  </button>
                  <span className="text-xs font-bold font-mono text-white/80 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    頁次 {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setTerminalPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>下一頁 Next Page</span>
                    <ChevronRight size={16} className="text-[#E5B453]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
