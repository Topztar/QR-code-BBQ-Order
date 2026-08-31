import React, { useState, useEffect } from 'react';
import { Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order } from '../../types';

interface ManagerOrdersTabProps {
  setShowBulkDeleteOrdersModal: (show: boolean) => void;
  handleExportOrdersReport: () => void;
  dateRangeFilter: 'all' | 'today' | 'week' | 'month' | 'custom';
  setDateRangeFilter: (filter: 'all' | 'today' | 'week' | 'month' | 'custom') => void;
  orderQueryStartDate: string;
  setOrderQueryStartDate: (date: string) => void;
  orderQueryEndDate: string;
  setOrderQueryEndDate: (date: string) => void;
  orderQueryKeyword: string;
  setOrderQueryKeyword: (kw: string) => void;
  orderQueryStatus: string;
  setOrderQueryStatus: (status: string) => void;
  filteredStats: {
    revenue: number;
    count: number;
    aov: number;
    memberShare: number;
  };
  filteredOrders: Order[];
  setSelectedOrder: (order: Order | null) => void;
}

export const ManagerOrdersTab: React.FC<ManagerOrdersTabProps> = ({
  setShowBulkDeleteOrdersModal,
  handleExportOrdersReport,
  dateRangeFilter,
  setDateRangeFilter,
  orderQueryStartDate,
  setOrderQueryStartDate,
  orderQueryEndDate,
  setOrderQueryEndDate,
  orderQueryKeyword,
  setOrderQueryKeyword,
  orderQueryStatus,
  setOrderQueryStatus,
  filteredStats,
  filteredOrders,
  setSelectedOrder,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRangeFilter, orderQueryStartDate, orderQueryEndDate, orderQueryKeyword, orderQueryStatus]);

  const totalCount = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  return (
    <div className="space-y-6 animate-fadeIn text-left" id="subtab-section-orders">
      {/* Preset Buttons & Advanced Filters */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white font-serif">💳 營業核數、點單明細與自訂統計查詢</h4>
            <p className="text-white/40 text-xs font-sans">可篩選指定時間、進行單筆交易對帳。點擊表格項目直接下鑽查閱顧客點餐規格細節。</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 md:mt-0">
            <button
              type="button"
              onClick={() => setShowBulkDeleteOrdersModal(true)}
              className="flex items-center justify-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-3.5 py-2 rounded-lg font-bold text-xs active:scale-95 transition whitespace-nowrap cursor-pointer shadow-md border border-rose-500/25"
            >
              <Trash2 size={13} />
              <span>批量刪除歷史訂單</span>
            </button>
            <button
              type="button"
              onClick={handleExportOrdersReport}
              className="flex items-center justify-center space-x-1.5 bg-[#E5B453] hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-black text-xs active:scale-95 transition whitespace-nowrap cursor-pointer shadow-md"
            >
              <Download size={13} />
              <span>匯出查詢結果 (EXCEL格式報表)</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                if(window.confirm('確定要清除「所有舊的測試訂單」與「暫存快取」嗎？\n這將刪除所有訂單資料且無法復原。')) {
                  try {
                    await fetch('/api/orders', { method: 'DELETE' });
                    localStorage.removeItem('sabay_orders_sync_event');
                    localStorage.removeItem('sabay-my-submitted-order-ids');
                    localStorage.removeItem('sabay_offline_queue');
                    alert('清理完成！系統將重新載入。');
                    window.location.reload();
                  } catch(e) {
                    alert('清理失敗: ' + e);
                  }
                }
              }}
              className="flex items-center justify-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-4 py-2 rounded-lg font-black text-xs active:scale-95 transition whitespace-nowrap cursor-pointer shadow-md border border-rose-500/25"
            >
              <Trash2 size={13} />
              <span>一鍵清除所有測試訂單與快取</span>
            </button>
          </div>
        </div>

        {/* Date Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: '全部歷史 orders' },
            { id: 'today', label: '📅 今日銷售 (Today)' },
            { id: 'week', label: '📅 本周銷售 (Last 7 Days)' },
            { id: 'month', label: '📅 本月銷售 (Last 30 Days)' },
            { id: 'custom', label: '🔍 自訂日期區間 (Custom)' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setDateRangeFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition active:scale-95 cursor-pointer ${
                dateRangeFilter === btn.id
                  ? 'bg-amber-400/20 border-amber-400 text-[#E5B453] font-extrabold'
                  : 'bg-black/20 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Date Custom Inputs */}
        {dateRangeFilter === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg border border-white/5 animate-slideDown text-xs">
            <div className="space-y-1">
              <span className="text-white/40 font-bold block">起始日期 Start Date</span>
              <input
                type="date"
                value={orderQueryStartDate}
                onChange={(e) => setOrderQueryStartDate(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#E5B453]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-white/40 font-bold block">截止日期 End Date</span>
              <input
                type="date"
                value={orderQueryEndDate}
                onChange={(e) => setOrderQueryEndDate(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#E5B453]"
              />
            </div>
          </div>
        )}

        {/* Search Key Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-white/40 font-bold">單號/顧客別搜尋 Keyword Search</label>
            <input
              type="text"
              placeholder="輸入 訂單單號 (如 LM-1001) 或顧客姓名搜尋"
              value={orderQueryKeyword}
              onChange={(e) => setOrderQueryKeyword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#E5B453] placeholder-white/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-white/40 font-bold">點單流向狀態 Order Status</label>
            <select
              value={orderQueryStatus}
              onChange={(e) => setOrderQueryStatus(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#E5B453]"
            >
              <option value="all">顯示全部種類狀態</option>
              <option value="pending">⏳ 待處理 Pending</option>
              <option value="preparing">🍳 配備中 Preparing</option>
              <option value="completed">✅ 已送出熟餐 Completed</option>
              <option value="cancelled">❌ 已取消退料 Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregated analytics widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-white/45 font-black uppercase tracking-wider block">篩選區間總營業額</span>
          <p className="text-xl font-black text-[#E5B453] font-mono leading-none mt-2">
            NT$ {(filteredStats.revenue || 0).toLocaleString()}
          </p>
          <p className="text-[9px] text-zinc-500 mt-1">（已扣除已取消訂單）</p>
        </div>
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-white/45 font-black uppercase tracking-wider block">篩選期間總點單筆數</span>
          <p className="text-xl font-black text-white font-mono leading-none mt-2">
            {filteredStats.count} <span className="text-xs text-zinc-400 font-sans">筆</span>
          </p>
          <p className="text-[9px] text-zinc-500 mt-1">（含歷史已取消案件）</p>
        </div>
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-white/45 font-black uppercase tracking-wider block">篩選客單價 (Average Ticket)</span>
          <p className="text-xl font-black text-blue-400 font-mono leading-none mt-2">
            NT$ {(filteredStats.aov || 0).toLocaleString()}
          </p>
          <p className="text-[9px] text-zinc-500 mt-1">平均每張訂單消費額</p>
        </div>
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-white/45 font-black uppercase tracking-wider block">Google 會員佔銷比率</span>
          <p className="text-xl font-black text-emerald-400 font-mono leading-none mt-2">
            {filteredStats.memberShare.toFixed(1)}%
          </p>
          <p className="text-[9px] text-zinc-500 mt-1">核定 Google 會員之消費貢獻</p>
        </div>
      </div>

      {/* Orders Chronology list */}
      <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/45 border-b border-white/10 font-bold uppercase tracking-wide">
                <th className="py-3 px-4 font-normal text-[10px] text-zinc-400">訂單 ID</th>
                <th className="py-3 px-4 font-normal text-[10px] text-zinc-400">點單時間</th>
                <th className="py-3 px-4 font-normal text-[10px] text-zinc-400">客用桌號</th>
                <th className="py-3 px-4 font-normal text-[10px] text-zinc-400">餐客 / 顧客別</th>
                <th className="py-3 px-4 font-normal text-[10px] text-zinc-400 text-right">總計金額</th>
                <th className="py-3 px-4 font-normal text-[10px] text-zinc-400 text-center">出餐進度</th>
                <th className="py-3 px-4 font-normal text-[10px] text-zinc-400 text-center">核對下鑽</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/30 font-medium">
                    無任何符合目前篩選準則的訂單交易紀錄。
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[2%] transition duration-150">
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">{o.id || ''}</td>
                    <td className="py-3 px-4 text-zinc-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</td>
                    <td className="py-3 px-4 text-center font-bold text-white">{o.takeoutInfo || String(o.tableNumber || '').includes('外帶') || o.tableNumber === 'takeout' ? `單號: #${o.id}` : `${o.tableNumber || 'N/A'} 桌`}</td>
                    <td className="py-3 px-4 flex items-center space-x-2.5">
                      <img src={o.customerAvatar || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'} defaultValue="" alt="avatar" className="w-6 h-6 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <span className="font-bold text-white truncate max-w-[120px] block">{o.customerName || 'N/A'}</span>
                      {o.isMember && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold px-1 py-0.2 rounded font-sans">⭐ 會員</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-100 font-extrabold text-sm">NT$ {(o.total || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-extrabold ${
                        o.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : o.status === 'preparing'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : o.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {o.status === 'completed' ? '已完成出餐' : (o.status === 'preparing' ? '廚房配餐中' : (o.status === 'pending' ? '新單待理' : '已取消復歸'))}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1 rounded-lg font-bold transition active:scale-95 text-[11px] cursor-pointer"
                      >
                        🔎 明細單
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/5 bg-black/20 text-xs">
            <div className="flex items-center gap-3 text-zinc-400">
              <span>
                顯示第 <strong className="text-white">{startIndex + 1}</strong> 至 <strong className="text-white">{endIndex}</strong> 筆，共 <strong className="text-[#E5B453]">{totalCount}</strong> 筆
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[11px] text-zinc-500">每頁:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#1e1e1e] border border-white/10 rounded px-2 py-0.5 text-zinc-300 text-xs outline-none focus:border-[#E5B453]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-zinc-300 border border-white/10 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>上一頁</span>
              </button>
              <span className="text-xs font-mono font-bold text-[#E5B453] px-2">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-zinc-300 border border-white/10 transition cursor-pointer"
              >
                <span>下一頁</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
