import React, { useState } from 'react';
import { Lock, Unlock, Check, QrCode, Edit, Trash2 } from 'lucide-react';
import { TableConfig } from '../../../types';
import { useDashboardStore } from '../../../stores/dashboard/useDashboardStore';

export interface CashierFloorPlanProps {
  tables: TableConfig[];
  localTablePositions: Record<string, { x: number; y: number }>;
  handleTableMouseDown: (e: React.MouseEvent, tableId: string) => void;
  handleTableTouchStart: (e: React.TouchEvent, tableId: string) => void;
  handleFineTunePosition: (dx: number, dy: number) => Promise<void>;
  triggerEditTableMode: (table: TableConfig) => void;
  onUpdateTableStatus?: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean; error?: string }>;
  onDeleteTable: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const CashierFloorPlan: React.FC<CashierFloorPlanProps> = ({
  tables,
  localTablePositions,
  handleTableMouseDown,
  handleTableTouchStart,
  handleFineTunePosition,
  triggerEditTableMode,
  onUpdateTableStatus,
  onDeleteTable,
}) => {
  const {
    setIsTableFormOpen, setEditingTableObj, setTableError, setTableSuccess,
    tableToDeleteId, setTableToDeleteId, selectedFineTuneTableId, setSelectedFineTuneTableId
  } = useDashboardStore();

  const [tableLayoutMode, setTableLayoutMode] = useState<'grid' | 'floormap'>('floormap');
  const [gridSize, setGridSize] = useState(5);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isTableLayoutLocked, setIsTableLayoutLocked] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center space-x-1.5">
          <QrCode size={15} className="text-[#E5B453]" />
          <h4 className="font-bold text-sm">🥢 餐廳客用桌席與 QR Code 連結設定</h4>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTableObj(null);

            setTableError(null);
            setTableSuccess(null);
            setIsTableFormOpen(true);
          }}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2.5 py-1.5 rounded text-xs transition font-extrabold cursor-pointer"
        >
          新增桌次定位 Add
        </button>
      </div>

      {/* Table View Layout Mode Selector */}
      <div className="flex items-center justify-between bg-black/45 border border-white/5 p-1 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setTableLayoutMode('floormap')}
          className={`flex-1 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            tableLayoutMode === 'floormap'
              ? 'bg-[#E5B453] text-[#0C0C0C] font-extrabold shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🗺️ 餐廳平面排桌圖 Floor Map</span>
        </button>
        <button
          type="button"
          onClick={() => setTableLayoutMode('grid')}
          className={`flex-1 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            tableLayoutMode === 'grid'
              ? 'bg-[#E5B453] text-[#0C0C0C] font-extrabold shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📋 傳統卡片列表 Grid View</span>
        </button>
      </div>

      {/* 1. Floor Map Graphical Visualizer */}
      {tableLayoutMode === 'floormap' && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-[11px] text-zinc-400 leading-relaxed bg-[#202020]/40 p-3 rounded-lg border border-white/5">
            💡 <strong>直覺拖曳排桌模式 (Drag & Drop Floor Map)</strong>：您可以直接<strong>游標拖曳</strong>任一客桌至理想位置，來模擬餐廳實際的室內格局。若是行動觸控裝置，可先點選欲調整的客桌，再直接在平面圖下方使用「微調定位方向鈕」進行精確對位。系統將會即時自動保存配置。
          </p>

          {/* 🔒 桌席位置鎖定與確認調整狀態欄 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1b1a16] border border-[#E5B453]/25 p-4 rounded-xl justify-between" id="table-layout-lock-bar">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${isTableLayoutLocked ? 'bg-zinc-800 text-zinc-400' : 'bg-[#E5B453]/10 text-[#E5B453] animate-pulse'}`}>
                {isTableLayoutLocked ? <Lock size={18} /> : <Unlock size={18} />}
              </div>
              <div className="text-left font-sans">
                <span className="text-[10px] font-bold text-[#E5B453] tracking-wider block uppercase">桌席排列位置安全保護 Table Placement Security</span>
                <span className="text-xs font-extrabold text-white">
                  {isTableLayoutLocked ? '🔒 桌席位置已確認鎖定 (Locked)' : '🔓 啟用桌席編排與位置調整中 (Adjusting)'}
                </span>
                <span className="text-[10.5px] text-zinc-400 block mt-0.5">
                  {isTableLayoutLocked ? '系統已鎖定位置，無法移動桌席。防止前台日常或收銀操作及點餐時誤觸。' : '系統處於解鎖狀態，您可以直接拖曳任何桌子，或利用下方方向鍵精細微調定位。'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              {isTableLayoutLocked ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsTableLayoutLocked(false);
                    localStorage.setItem('table-layout-locked', 'false');
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <Unlock size={13} className="text-[#E5B453]" />
                  <span>⚙️ 啟動調整 (Unlock Layout)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsTableLayoutLocked(true);
                    localStorage.setItem('table-layout-locked', 'true');
                    setSelectedFineTuneTableId(null);
                    alert('✅ 桌席位置已確認儲存，並安全鎖定！日常操作中將防誤觸、不可再隨意拖曳更改。');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-lg text-xs shadow-md shadow-emerald-900/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={13} />
                  <span>💾 確認桌席編排（鎖定防誤觸）</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid Alignment Options */}
          <div className="flex flex-wrap items-center gap-4 bg-[#202020]/20 border border-white/5 p-3 rounded-xl justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">📏 網格對齊 (Snap to Grid)</span>
              <span className="text-[10px] text-zinc-400">啟用後拖曳桌席會自動對齊至最近格點</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-zinc-300 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="accent-[#E5B453] w-4 h-4 rounded border-zinc-700 bg-zinc-800"
                />
                <span>啟用網格對齊</span>
              </label>
              {snapToGrid && (
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-zinc-500">網格尺寸:</span>
                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="bg-[#1a1a1a] text-xs text-[#E5B453] font-mono border-0 p-1 rounded focus:ring-0 cursor-pointer"
                  >
                    <option value={2}>2%</option>
                    <option value={5}>5% (預設)</option>
                    <option value={8}>8%</option>
                    <option value={10}>10%</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 🎫 Real-time Table Status visual legend and counts */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-zinc-950/40 p-3 rounded-xl border border-white/5 text-xs text-left" id="table-status-legend-bar">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>🟢 空桌 Empty</span>
              </div>
              <span className="text-lg font-black text-white mt-1">
                {tables.filter(t => !t.status || t.status === 'available').length} <span className="text-[10px] font-medium text-emerald-500/60">桌</span>
              </span>
            </div>
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-2.5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-550 bg-sky-500 shrink-0 animate-pulse" />
                <span>🔵 已入座 Seated</span>
              </div>
              <span className="text-lg font-black text-white mt-1">
                {tables.filter(t => t.status === 'in_use').length} <span className="text-[10px] font-medium text-sky-500/60">桌</span>
              </span>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>🟡 待結帳 Unpaid</span>
              </div>
              <span className="text-lg font-black text-white mt-1">
                {tables.filter(t => t.status === 'pending_checkout').length} <span className="text-[10px] font-medium text-amber-500/60">桌</span>
              </span>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 font-bold text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                <span>🔴 清潔中 Cleaning</span>
              </div>
              <span className="text-lg font-black text-white mt-1">
                {tables.filter(t => t.status === 'cleaning').length} <span className="text-[10px] font-medium text-rose-500/60">桌</span>
              </span>
            </div>
            <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-lg p-2.5 flex flex-col justify-between col-span-2 sm:col-span-1 border-dashed">
              <div className="flex items-center gap-1.5 font-bold text-fuchsia-400">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 shrink-0 animate-pulse" />
                <span>🟣 預約保留 Reserved</span>
              </div>
              <span className="text-lg font-black text-white mt-1">
                {tables.filter(t => t.status === 'preserved').length} <span className="text-[10px] font-medium text-fuchsia-500/60">桌</span>
              </span>
            </div>
          </div>

          {/* Map Container */}
          <div
            id="floor-map-container"
            className="relative w-full h-[450px] bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
              backgroundSize: snapToGrid ? `${gridSize}% ${gridSize}%` : '24px 24px',
            }}
          >
            {/* Floor layout structural reference tags */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-900/80 border border-white/5 rounded-full text-[9px] font-mono font-bold tracking-[0.15em] text-zinc-500 uppercase select-none flex items-center gap-1">
              📴 外場主候位客席區 (Main Dining Hall)
            </div>

            {/* Visual Kitchen boundary wall decoration */}
            <div className="absolute bottom-0 right-0 w-[180px] h-[100px] bg-zinc-900/40 border-l border-t border-dashed border-white/10 rounded-tl-xl p-3 flex flex-col justify-end select-none pointer-events-none">
              <span className="text-[10px] font-extrabold tracking-widest text-zinc-500">🍳 出餐廚房 KITCHEN</span>
              <span className="text-[8px] text-zinc-650 text-zinc-500 font-mono">KDS Service Area</span>
            </div>

            {/* Visual Entrance Area */}
            <div className="absolute top-0 left-0 w-[150px] h-[60px] bg-zinc-900/20 border-r border-b border-dashed border-white/10 rounded-br-xl p-2.5 flex flex-col justify-start select-none pointer-events-none">
              <span className="text-[9px] font-extrabold tracking-widest text-[#E5B453]/60">🚪 餐廳正門 ENTRANCE</span>
              <span className="text-[8px] text-zinc-600 font-mono">櫃檯買單區 Reception</span>
            </div>

            {/* Map Surface containing tables */}
            <div className="absolute inset-0 select-none">
              {tables.map(tb => {
                const posX = localTablePositions[tb.id]?.x !== undefined ? localTablePositions[tb.id].x : (tb.positionX || 10);
                const posY = localTablePositions[tb.id]?.y !== undefined ? localTablePositions[tb.id].y : (tb.positionY || 10);
                
                // Determine status highlight color based on customer's exact colors
                let statusColorClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20';
                let iconLabel = '🟢 空桌';
                if (tb.status === 'in_use') {
                  statusColorClass = 'border-sky-500 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20';
                  iconLabel = '🔵 已入座';
                } else if (tb.status === 'pending_checkout') {
                  statusColorClass = 'border-amber-500 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 animate-pulse';
                  iconLabel = '🟡 待結帳';
                } else if (tb.status === 'cleaning') {
                  statusColorClass = 'border-rose-500 bg-rose-500/15 text-rose-450 hover:bg-rose-500/25';
                  iconLabel = '🔴 清潔中';
                } else if (tb.status === 'preserved') {
                  statusColorClass = 'border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-400 hover:bg-fuchsia-500/25';
                  iconLabel = '🟣 預約預訂';
                }

                const isSelectedForFineTune = selectedFineTuneTableId === tb.id;

                return (
                  <div
                    key={tb.id}
                    onMouseDown={(e) => {
                      setSelectedFineTuneTableId(tb.id);
                      handleTableMouseDown(e, tb.id);
                    }}
                    onTouchStart={(e) => {
                      setSelectedFineTuneTableId(tb.id);
                      handleTableTouchStart(e, tb.id);
                    }}
                    onClick={() => setSelectedFineTuneTableId(tb.id)}
                    className={`absolute rounded-xl border-2 p-3 font-sans transition-all duration-75 flex flex-col justify-between select-none shadow-lg min-w-[110px] min-h-[90px] ${statusColorClass} ${
                      isTableLayoutLocked ? 'cursor-pointer hover:border-white/20' : 'cursor-move border-dashed hover:scale-[1.02] border-[#E5B453]/50 animate-pulse'
                    } ${
                      isSelectedForFineTune ? 'ring-2 ring-[#E5B453] border-[#E5B453] shadow-md scale-102' : ''
                    }`}
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-black text-xs text-white shrink-0">🥢 {tb.id} 桌</span>
                        <span className="text-[8px] font-mono text-zinc-500">T-{tb.id}</span>
                      </div>
                      <div className="text-[10px] font-bold mt-1 text-left">
                        {tb.status === 'preserved' ? (
                          <span className="text-fuchsia-300 line-clamp-1" title={tb.preservedFor || ''}>
                            👤 {tb.preservedFor || '已預約'}
                          </span>
                        ) : tb.status === 'in_use' ? (
                          <span className="text-sky-300 font-extrabold font-sans">💙 已入座用餐</span>
                        ) : tb.status === 'pending_checkout' ? (
                          <span className="text-amber-300 font-black font-sans">💵 顧客待結帳</span>
                        ) : tb.status === 'cleaning' ? (
                          <span className="text-rose-400 font-black font-sans">🧹 收拾清潔中</span>
                        ) : (
                          <span className="text-emerald-400/80 font-medium font-sans">🟢 可入座空桌</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-semibold border-t border-white/5 pt-1 mt-1.5">
                      <span>{iconLabel}</span>
                      {tb.mergedWith && (
                        <span className="bg-sky-500 text-white px-1 rounded-sm text-[7px]" title={`已與 ${tb.mergedWith} 桌併桌`}>
                          併 {tb.mergedWith}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Touch & Fine-Tuning direction keys */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#202020]/20 border border-white/5 p-4 rounded-xl">
            <div className="space-y-1.5 text-left w-full sm:w-auto">
              <span className="text-[10px] font-bold text-[#E5B453] tracking-widest block uppercase">🛠️ 觸控裝置定位與微調面板 (Selected Table Control)</span>
              <p className="text-[11px] text-zinc-400">
                目前選取：<strong>{selectedFineTuneTableId ? `🥢 餐廳 ${selectedFineTuneTableId} 桌` : '💡 (請先在平面圖中點選任意桌次)'}</strong>
              </p>
              {selectedFineTuneTableId && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const tbl = tables.find(t => t.id === selectedFineTuneTableId);
                      if (tbl && onUpdateTableStatus) {
                        // Complete cycle: 空桌available(綠) -> 入座in_use(藍) -> 待結帳pending_checkout(黃) -> 清潔中cleaning(紅) -> 預約preserved(紫)
                        const statusOrder: ('available' | 'in_use' | 'pending_checkout' | 'cleaning' | 'preserved')[] = [
                          'available',
                          'in_use',
                          'pending_checkout',
                          'cleaning',
                          'preserved'
                        ];
                        const currentIndex = statusOrder.indexOf((tbl.status as any) || 'available');
                        const nextIndex = (currentIndex + 1) % statusOrder.length;
                        const nextStatus = statusOrder[nextIndex];
                        
                        let presName = tbl.preservedFor || '';
                        if (nextStatus === 'preserved' && !presName) {
                          const ans = prompt('請輸入預約保留顧客姓名 (Preserved Customer Name)：');
                          if (ans) presName = ans.trim();
                        }
                        await onUpdateTableStatus(selectedFineTuneTableId, { status: nextStatus, preservedFor: nextStatus === 'preserved' ? presName : '' });
                      }
                    }}
                    className="px-2.5 py-1 text-[10px] bg-[#E5B453]/10 hover:bg-[#E5B453] hover:text-black text-[#E5B453] rounded font-bold border border-[#E5B453]/20 transition cursor-pointer"
                  >
                    🔄 快速切換狀態 (Cycle Status)
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const tbl = tables.find(t => t.id === selectedFineTuneTableId);
                      const name = prompt('更改客席保留/預約姓名 (Preserved Name)：', tbl?.preservedFor || '');
                      if (name !== null && onUpdateTableStatus) {
                        await onUpdateTableStatus(selectedFineTuneTableId, { preservedFor: name.trim() });
                      }
                    }}
                    className="px-2.5 py-1 text-[10px] bg-white/5 hover:bg-white/10 text-white rounded font-bold border border-white/10 transition cursor-pointer"
                  >
                    👤 編輯保留姓名
                  </button>
                </div>
              )}
            </div>

            {/* Direction cross button pad */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono text-zinc-500 hidden md:block">方向微調:</span>
              <div className="relative w-28 h-24 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center shrink-0">
                <button
                  type="button"
                  disabled={!selectedFineTuneTableId}
                  onClick={() => handleFineTunePosition(0, -3)}
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                  title="向上移動"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={!selectedFineTuneTableId}
                  onClick={() => handleFineTunePosition(-3, 0)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                  title="向左移動"
                >
                  ◀
                </button>
                <div className="w-6 h-6 rounded-full bg-[#E5B453]/10 border border-[#E5B453]/20 flex items-center justify-center text-[8px] text-[#E5B453] font-mono uppercase">
                  XY
                </div>
                <button
                  type="button"
                  disabled={!selectedFineTuneTableId}
                  onClick={() => handleFineTunePosition(3, 0)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                  title="向右移動"
                >
                  ▶
                </button>
                <button
                  type="button"
                  disabled={!selectedFineTuneTableId}
                  onClick={() => handleFineTunePosition(0, 3)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-7 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer text-xs leading-none"
                  title="向下移動"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Traditional Grid List of Tables details */}
      {tableLayoutMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
        {tables.map(tb => (
          <div key={tb.id} className="p-4 bg-black/35 border border-white/10 rounded-xl flex flex-col justify-between space-y-3.5 shadow-md hover:border-[#E5B453]/25 transition text-left">
            <div className="space-y-2.5">
              <p className="font-extrabold text-white text-sm flex items-center justify-between">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span>🥢 {tb.id} 桌</span>
                  {(tb.status === 'available' || !tb.status) && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-550/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">空閒中</span>}
                  {tb.status === 'in_use' && <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">已入座</span>}
                  {tb.status === 'pending_checkout' && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded animate-pulse">待結帳</span>}
                  {tb.status === 'cleaning' && <span className="bg-rose-500/10 text-rose-450 border border-rose-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">清潔中</span>}
                  {tb.status === 'preserved' && <span className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">預訂保留</span>}
                  {tb.mergedWith && <span className="bg-sky-500 text-white font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded">併至 {tb.mergedWith} 桌</span>}
                </span>
                <span className="text-[9px] font-mono text-zinc-500">Table {tb.id}</span>
              </p>
              
              {/* Display state context helpers */}
              <div className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                {tb.status === 'in_use' ? (
                  <span className="text-sky-300 font-medium">💙 已帶位/用餐中</span>
                ) : tb.status === 'pending_checkout' ? (
                  <span className="text-amber-400 font-bold">💵 帳單待結清</span>
                ) : tb.status === 'cleaning' ? (
                  <span className="text-rose-450 text-rose-400 font-medium">🧹 待翻洗/整理中</span>
                ) : tb.status === 'preserved' ? (
                  <span className="text-fuchsia-300 font-medium">👤 保留：{tb.preservedFor || '預訂客戶'}</span>
                ) : (
                  <span className="text-emerald-400">🟢 空閒可接待</span>
                )}
              </div>

              {/* Interactive Occupancy Select */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold block">客座狀態設定:</span>
                <select
                  value={tb.status || 'available'}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    let newPresName = tb.preservedFor || '';
                    if (newStatus === 'preserved' && !newPresName) {
                      const ans = prompt('請輸入預約保留顧客姓名 (Preserved Name)：');
                      if (ans !== null && ans.trim()) {
                        newPresName = ans.trim();
                      }
                    }
                    if (onUpdateTableStatus) {
                      await onUpdateTableStatus(tb.id, { status: newStatus as any, preservedFor: newStatus === 'preserved' ? newPresName : '' });
                    }
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded bg-[#1e1e1e] text-white text-[11px] h-7 px-1.5 cursor-pointer outline-none focus:border-amber-400 text-xs"
                >
                  <option value="available">🟢 空桌 Available (可帶位)</option>
                  <option value="in_use">🔵 入座 Occupied (已入座)</option>
                  <option value="pending_checkout">🟡 待結帳 Pending Unpaid (未付)</option>
                  <option value="cleaning">🔴 清潔中 Cleaning (收拾中)</option>
                  <option value="preserved">🟣 預約保留 Preserved (預約中)</option>
                </select>
                
                {tb.status === 'preserved' && (
                  <div className="flex items-center gap-1.5 mt-1 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                    <span className="text-[9px] text-rose-400 font-bold shrink-0">保留姓名:</span>
                    <input
                      type="text"
                      value={tb.preservedFor || ''}
                      placeholder="請輸入姓名"
                      onChange={async (e) => {
                        if (onUpdateTableStatus) {
                          await onUpdateTableStatus(tb.id, { preservedFor: e.target.value });
                        }
                      }}
                      className="bg-transparent border-none text-white text-[10px] p-0 font-bold focus:ring-0 w-full font-sans"
                    />
                  </div>
                )}
              </div>

              {/* Interactive Merging Select */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold block">合併桌位 (併桌):</span>
                <select
                  value={tb.mergedWith || ''}
                  onChange={async (e) => {
                    const targetMerge = e.target.value;
                    if (onUpdateTableStatus) {
                      await onUpdateTableStatus(tb.id, { mergedWith: targetMerge });
                    }
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded bg-[#1e1e1e] text-white text-[11px] h-7 px-1.5 cursor-pointer outline-none focus:border-amber-400"
                >
                  <option value="">🔗 獨立（不合併）</option>
                  {tables.filter(other => other.id !== tb.id).map(other => (
                    <option key={other.id} value={other.id}>
                      併帳至 ➔ {other.id} 桌
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[9px] min-[360px]:text-[10px] text-zinc-400 break-all bg-black/40 p-2 rounded-lg border border-white/5 font-mono max-h-12 overflow-y-auto scrollbar-none" title={tb.qrCodeUrl}>
                <span className="text-zinc-600 font-sans block text-[9px] mb-0.5">桌位 QR 連結:</span>
                {tb.qrCodeUrl || '無設定連結'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              {tableToDeleteId === tb.id ? (
                <div className="flex flex-wrap items-center justify-between gap-1.5 w-full bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg">
                  <span className="text-rose-450 font-bold text-[10px] shrink-0 text-rose-400">確定刪除？</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        await onDeleteTable(tb.id);
                        setTableToDeleteId(null);
                      }}
                      className="text-white bg-rose-600 hover:bg-rose-500 font-bold font-sans text-[10px] px-2.5 py-1 rounded cursor-pointer leading-none h-6 active:scale-90 transition"
                    >
                      確定
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableToDeleteId(null)}
                      className="text-zinc-300 hover:text-white bg-white/10 font-sans text-[10px] px-2.5 py-1 rounded cursor-pointer leading-none h-6 active:scale-90 transition"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => triggerEditTableMode(tb)}
                    className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-[#E5B453] hover:text-[#0C0C0C] text-[#E5B453] border border-amber-500/20 rounded-lg transition active:scale-95 text-[11px] font-bold cursor-pointer"
                    title="編輯桌次 QR 碼"
                  >
                    <Edit size={11} />
                    <span>編輯</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableToDeleteId(tb.id)}
                    className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 rounded-lg transition active:scale-95 text-[11px] font-bold cursor-pointer"
                    title="刪除"
                  >
                    <Trash2 size={11} />
                    <span>刪除</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
