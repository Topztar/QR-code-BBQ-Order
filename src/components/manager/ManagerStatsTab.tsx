import React from 'react';
import {
  FileText,
  Download,
  Check,
  AlertTriangle,
  Coins,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Ingredient, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import PrintLogsD3Chart from '../PrintLogsD3Chart';

interface ManagerStatsTabProps {
  currentLang: Language;
  analytics: {
    totalRevenue: number;
    ordersCount: number;
    categorySales: { category: string; revenue: number }[];
    hourlyDistribution: { timeSlot: string; orders: number }[];
    topDishes: { name: string; qty: number }[];
    stockWarnings: Ingredient[];
  };
  takeoutStatus: { sequence: number; lastResetDate: string };
  chartCategoryData: any[];
  chartHourlyData: any[];
  printLogs: any[];
  fetchPrintLogs: () => void;
  handleExportLast30DaysOrdersCSV: () => void;
  csvExportSuccess: string | null;
  csvExportError: string | null;
  menuItems: any[];
  localPopularIds: string[];
  setLocalPopularIds: React.Dispatch<React.SetStateAction<string[]>>;
  showClearAllPopularConfirm: boolean;
  setShowClearAllPopularConfirm: (val: boolean) => void;
  popularItemToRemoveId: string | null;
  setPopularItemToRemoveId: (id: string | null) => void;
  popularSaveStatus: { type: 'success' | 'error' | null; message: string };
  setPopularSaveStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error' | null; message: string }>>;
  isSavingPopular: boolean;
  setIsSavingPopular: (val: boolean) => void;
  onUpdatePopularItemIds?: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
}

export const ManagerStatsTab: React.FC<ManagerStatsTabProps> = ({
  currentLang,
  analytics,
  takeoutStatus,
  chartCategoryData,
  chartHourlyData,
  printLogs,
  fetchPrintLogs,
  handleExportLast30DaysOrdersCSV,
  csvExportSuccess,
  csvExportError,
  menuItems,
  localPopularIds,
  setLocalPopularIds,
  showClearAllPopularConfirm,
  setShowClearAllPopularConfirm,
  popularItemToRemoveId,
  setPopularItemToRemoveId,
  popularSaveStatus,
  setPopularSaveStatus,
  isSavingPopular,
  setIsSavingPopular,
  onUpdatePopularItemIds,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn" id="subtab-section-stats">
      {/* Offline Accounting & Export Header Banner */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl" id="stats-accounting-banner">
        <div className="space-y-1 text-left">
          <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
            <FileText size={18} className="text-[#E5B453]" />
            營運數據分析與離線對帳管理 (Business Analytics & Offline Accounting)
          </h3>
          <p className="text-xs text-white/40">
            將過去 30 天內已完成 (Status: Completed) 的所有顧客交易訂單明細匯出為完整的 CSV 檔格式，方便執行會計記帳或損益試算。
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleExportLast30DaysOrdersCSV}
          className="bg-[#E5B453] hover:bg-amber-400 active:scale-95 text-[#0F0F0F] font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 shrink-0 border border-[#E5B453]/25 shadow-lg shadow-amber-500/5"
        >
          <Download size={14} className="stroke-[3]" />
          <span>匯出 30 天已完成交易 CSV</span>
        </button>
      </div>

      {/* Toast / Status messages inside Stats Tab */}
      {(csvExportSuccess || csvExportError) && (
        <div className="animate-slideIn" id="csv-export-alerts">
          {csvExportSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
              <Check size={14} className="stroke-[3]" />
              <span>{csvExportSuccess}</span>
            </div>
          )}
          {csvExportError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
              <AlertTriangle size={14} className="stroke-[3]" />
              <span>{csvExportError}</span>
            </div>
          )}
        </div>
      )}

      {/* Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="stats-kpi-grid">
        <div className="bg-[#161616] rounded-xl p-5 border border-white/10 shadow-sm flex items-center space-x-4">
          <div className="bg-amber-500/10 text-[#E5B453] p-3 rounded-lg">
            <Coins size={22} className="text-[#E5B453]" />
          </div>
          <div className="text-left font-sans">
            <span className="text-xs text-white/45 font-black uppercase tracking-wider block">累計點餐營業額</span>
            <p className="text-xl font-black text-white font-mono mt-0.5">NT$ {(analytics.totalRevenue || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-[#161616] rounded-xl p-5 border border-white/10 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-lg">
            <TrendingUp size={22} className="text-blue-400" />
          </div>
          <div className="text-left font-sans">
            <span className="text-xs text-white/45 font-black uppercase tracking-wider block">完成出單交易量</span>
            <p className="text-xl font-black text-white font-mono mt-0.5">{analytics.ordersCount} 筆交易</p>
          </div>
        </div>
        <div className="bg-[#161616] rounded-xl p-5 border border-white/10 shadow-sm flex items-center space-x-4">
          <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg">
            <AlertTriangle size={22} className="text-rose-400" />
          </div>
          <div className="text-left font-sans">
            <span className="text-xs text-white/45 font-black uppercase tracking-wider block">食材庫存水位警報</span>
            <p className="text-xl font-black text-white font-mono mt-0.5">
              {analytics.stockWarnings.length > 0 ? (
                <span className="text-rose-400 animate-pulse">{analytics.stockWarnings.length} 個料件告警</span>
              ) : (
                <span className="text-emerald-400 text-sm font-semibold">健康安全 ok</span>
              )}
            </p>
          </div>
        </div>
        <div className="bg-[#161616] rounded-xl p-5 border border-white/10 shadow-sm flex items-center space-x-4">
          <div className="bg-[#E5B453]/10 text-[#E5B453] p-3 rounded-lg">
            <ShoppingBag size={22} className="text-[#E5B453]" />
          </div>
          <div className="text-left font-sans">
            <span className="text-xs text-white/45 font-black uppercase tracking-wider block">外帶編號取餐序列</span>
            <p className="text-sm font-bold text-white mt-0.5">
              目前外帶累計: <span className="font-mono text-base font-extrabold text-[#E5B453]">#{takeoutStatus.sequence}</span> 號
            </p>
          </div>
        </div>
      </div>

      {/* Business Charts with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="manager-charts-workspace">
        {/* Category breakdown sales BarChart */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5 shadow-sm space-y-2 text-left">
          <h4 className="font-bold text-sm text-white font-serif tracking-wide">
            📊 各類別銷售營業額分析 Sales Breakdown by Categories
          </h4>
          <p className="text-white/40 text-xs text-sans">用以分析哪些料理為沙貝之金雞母類別</p>
          <div className="h-64 pt-3" id="revenue-barchart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCategoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={formattedValue => `NT$ ${formattedValue}`} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#161616', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} formatter={(value) => [`NT$ ${value}`, '營業額']} />
                <Bar dataKey="營業額 NT$" fill="#E5B453" radius={[5, 5, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 今日各類別商品銷售佔比 Pie Chart */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5 shadow-sm space-y-2 text-left" id="category-sales-piechart-card">
          <h4 className="font-bold text-sm text-white font-serif tracking-wide">
            🍰 今日各類別銷售佔比 Category Sales Share (Pie Chart)
          </h4>
          <p className="text-white/40 text-xs text-sans">視覺化分析今日不同餐點類別之營業額佔比份額</p>
          <div className="h-64 pt-3 flex flex-col md:flex-row items-center justify-center gap-2" id="piechart-container">
            <div className="w-1/2 h-full min-h-[160px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="營業額 NT$"
                    nameKey="name"
                  >
                    {chartCategoryData.map((_entry, index) => {
                      const colors = ['#E5B453', '#FFA500', '#F3CD78', '#D4AF37', '#FF8C00', '#FFD700', '#CD7F32'];
                      return (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161616', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} 
                    formatter={(value, name) => [`NT$ ${value}`, name]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom list of categories on the side so the user reads values and colors clearly */}
            <div className="w-1/2 flex flex-col space-y-1.5 max-h-[220px] overflow-y-auto px-1 pr-2">
              {chartCategoryData.map((entry, index) => {
                const colors = ['#E5B453', '#FFA500', '#F3CD78', '#D4AF37', '#FF8C00', '#FFD700', '#CD7F32'];
                const totalRevenue = chartCategoryData.reduce((sum, item) => sum + (item['營業額 NT$'] || 0), 0);
                const percentage = totalRevenue > 0 ? ((entry['營業額 NT$'] / totalRevenue) * 100).toFixed(1) : '0.0';
                return (
                  <div key={index} className="flex flex-col text-[10px] text-zinc-300 font-sans border-b border-white/5 pb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span className="truncate font-semibold text-white/90">{entry.name}</span>
                    </div>
                    <div className="pl-3.5 flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-0.5">
                      <span>{percentage}%</span>
                      <span className="text-zinc-500 text-[9px]">NT$ {entry['營業額 NT$']}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hourly busy dining line graph */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5 shadow-sm space-y-2 text-left">
          <h4 className="font-bold text-sm text-white font-serif tracking-wide">
            📈 宵夜尖峰點餐時段趨勢 Hourly Dining Orders Trends
          </h4>
          <p className="text-white/40 text-xs text-sans">營業時間 17:30 - 00:30。有助於適當調度內外場人力。</p>
          <div className="h-64 pt-3" id="busy-hours-linechart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="用餐時段" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#161616', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="下單數量" stroke="#00C300" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📊 D3-powered hourly revenue and peak order times analytics chart */}
      <PrintLogsD3Chart printLogs={printLogs} onRefresh={fetchPrintLogs} />

      {/* Top selling food rankings */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 text-left">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3 mb-4">
          <Sparkles size={16} className="text-[#E5B453]" />
          <h4 className="font-bold text-sm">🔥 本店熱門人氣銷售排行 (銷量排行 Top Dishes)</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
          {analytics.topDishes.map((dish, i) => (
            <div key={dish.name} className="bg-black/30 border border-white/5 p-3 rounded-lg text-center relative overflow-hidden">
              <span className="absolute top-0 left-0 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-br">
                NO.{i + 1}
              </span>
              <p className="font-bold text-xs text-white truncate mt-2">{dish.name}</p>
              <p className="font-mono text-xs text-blue-400 font-extrabold mt-1">{dish.qty} 份</p>
            </div>
          ))}
        </div>
      </div>

      {/* 今日熱銷設定 Today's Bestsellers Configuration */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-5 text-left space-y-4" id="stats-popular-settings-card">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <Flame size={18} className="text-[#E5B453] fill-amber-500 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-white">🔥 今日熱銷設定 Today's Bestsellers Configuration</h4>
            <p className="text-[11px] text-white/40 font-sans">
              手動編輯與自訂消費者點餐首頁頂端顯示的「今日今日熱銷」人氣商品清單，引導導購成效。
            </p>
          </div>
        </div>

        {popularSaveStatus.type && (
          <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between border animate-fadeIn transition-all duration-300 ${
            popularSaveStatus.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-455 text-rose-400'
          }`}>
            <span className="flex items-center gap-1.5">
              {popularSaveStatus.type === 'success' ? '✨' : '⚠️'}
              {popularSaveStatus.message}
            </span>
            <button 
              type="button" 
              onClick={() => setPopularSaveStatus({ type: null, message: '' })}
              className="text-white/50 hover:text-white px-2 py-0.5 hover:bg-white/5 rounded cursor-pointer transition font-mono border-0 bg-transparent text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
          {/* Left Column: Active Bestsellers */}
          <div className="bg-black/25 border border-white/5 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-400">當前今日熱銷品項 ({localPopularIds.length})</span>
              {showClearAllPopularConfirm ? (
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                  <span className="text-rose-455 font-bold text-[9px] text-rose-400 shrink-0">確定清空？</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalPopularIds([]);
                      setShowClearAllPopularConfirm(false);
                    }}
                    className="px-1.5 py-0.5 text-[9px] bg-rose-600 hover:bg-rose-500 text-white font-bold rounded cursor-pointer transition active:scale-90"
                  >
                    確定
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearAllPopularConfirm(false)}
                    className="px-1.5 py-0.5 text-[9px] bg-zinc-700 hover:bg-zinc-650 text-zinc-300 rounded cursor-pointer transition active:scale-90"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearAllPopularConfirm(true)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-mono transition cursor-pointer bg-transparent border-0"
                >
                  🗑️ 全部清空
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {localPopularIds.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-xs">
                  目前未選擇任何品項，點餐頁將預設顯示前 4 項上架商品。
                </div>
              ) : (
                localPopularIds.map((itemId) => {
                  const item = menuItems.find(m => m.id === itemId);
                  if (!item) return null;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between bg-[#1f1f1f] p-2 border border-white/5 rounded-lg text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'}
                          alt={getLocalizedText(item.name, currentLang)}
                          className="w-8 h-8 object-cover rounded bg-black flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate">
                          <p className="font-bold text-white truncate">{getLocalizedText(item.name, currentLang)}</p>
                          <p className="text-[9px] text-zinc-400 font-mono">ID: {item.id} • NT$ {item.price}</p>
                        </div>
                      </div>
                      
                      {popularItemToRemoveId === itemId ? (
                        <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-1 rounded-lg">
                          <span className="text-rose-455 font-bold text-[9px] text-rose-400 shrink-0">移除？</span>
                          <button
                            type="button"
                            onClick={() => {
                              setLocalPopularIds(prev => prev.filter(id => id !== itemId));
                              setPopularItemToRemoveId(null);
                            }}
                            className="px-1.5 py-0.5 text-[9px] bg-rose-600 hover:bg-rose-500 text-white font-bold rounded cursor-pointer transition active:scale-90"
                          >
                            確定
                          </button>
                          <button
                            type="button"
                            onClick={() => setPopularItemToRemoveId(null)}
                            className="px-1.5 py-0.5 text-[9px] bg-zinc-700 hover:bg-zinc-650 text-zinc-300 rounded cursor-pointer transition active:scale-90"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPopularItemToRemoveId(itemId)}
                          className="p-1 px-2 text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/35 rounded transition cursor-pointer font-bold active:scale-95"
                        >
                          移除
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Add New Bestseller */}
          <div className="bg-black/25 border border-white/5 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs text-zinc-300">可選餐點清單 (點按餐點快速加入)</span>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {menuItems.map((item) => {
                const isSelected = localPopularIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        setLocalPopularIds(prev => prev.filter(id => id !== item.id));
                      } else {
                        if (localPopularIds.length >= 8) {
                          alert('💡 為了點餐頁之最佳版面與體驗，今日熱銷品項上限為 8 項，請先移除現有品項。');
                          return;
                        }
                        setLocalPopularIds(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer text-xs transition-all select-none ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/15'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150'}
                        alt={getLocalizedText(item.name, currentLang)}
                        className="w-8 h-8 object-cover rounded bg-black flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{getLocalizedText(item.name, currentLang)}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">Category: {item.category}</p>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="text-[10px] font-black text-[#E5B453] bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">
                          ✓ 已選中
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-400 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                          + 點選
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Button Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/5 font-sans">
          <span className="text-[11px] text-zinc-500 font-medium">
            變更將即時儲存並同步至前台顧客手機點餐首頁。
          </span>
          <button
            type="button"
            disabled={isSavingPopular}
            onClick={async () => {
              setIsSavingPopular(true);
              setPopularSaveStatus({ type: null, message: '' });
              try {
                if (onUpdatePopularItemIds) {
                  const res = await onUpdatePopularItemIds(localPopularIds);
                  if (res && res.success) {
                    setPopularSaveStatus({
                      type: 'success',
                      message: '🎉 今日熱銷設定完成，已成功同步上雲端並更新前台點餐系統！'
                    });
                    try {
                      alert('🎉 今日熱銷設定完成，已成功同步上雲端並更新前台點餐系統！');
                    } catch (e) {
                      console.warn('Alert blocked in iframe sandbox', e);
                    }
                  } else {
                    const errorMsg = res?.error || '未知錯誤';
                    setPopularSaveStatus({
                      type: 'error',
                      message: `⚠️ 儲存失敗: ${errorMsg}`
                    });
                    try {
                      alert(`⚠️ 儲存失敗: ${errorMsg}`);
                    } catch (e) {
                      console.warn('Alert blocked in iframe sandbox', e);
                    }
                  }
                } else {
                  setPopularSaveStatus({
                    type: 'error',
                    message: '⚠️ 系統異常：點購率 API 連結未就緒！'
                  });
                  try {
                    alert('⚠️ 系統異常：點購率 API 連結未就緒！');
                  } catch (e) {
                    console.warn('Alert blocked', e);
                  }
                }
              } catch (err: any) {
                console.error('[Save Popular Error]', err);
                const errMsg = err?.message || '連線錯誤';
                setPopularSaveStatus({
                  type: 'error',
                  message: `❌ 連線伺服器失敗: ${errMsg}，請確認網路！`
                });
                try {
                  alert('❌ 連線伺服器失敗，請確認網路！');
                } catch (e) {
                  console.warn('Alert blocked', e);
                }
              } finally {
                setIsSavingPopular(false);
              }
            }}
            className="bg-[#E5B453] hover:bg-amber-400 disabled:bg-amber-500/40 text-[#0F0F0F] font-black text-xs px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-2 border border-[#E5B453]/20 shadow-md shadow-amber-500/5 active:scale-95 text-center min-w-[150px] justify-center h-9"
          >
            {isSavingPopular ? '正在儲存同步...' : '確認儲存今日熱銷設定'}
          </button>
        </div>
      </div>
    </div>
  );
};
