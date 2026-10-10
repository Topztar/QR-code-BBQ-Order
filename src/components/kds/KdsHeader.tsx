import React from 'react';
import { Category, Language } from '../../types';
import { getLocalizedText } from '../../utils/i18n';
import { unlockAudio } from '../../utils/kdsAudio';
import { safeStorage } from '../../lib/safeStorage';
import {
  ChefHat,
  Search,
  X,
  Eye,
  RefreshCw,
  Clock,
  Volume2,
  Settings,
} from 'lucide-react';

export interface KdsHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  kdsRole: 'kitchen' | 'staff';
  handleRoleSwitch: (role: 'kitchen' | 'staff') => void;
  filterStatus: 'active' | 'all';
  setFilterStatus: (status: 'active' | 'all') => void;
  isMergedView: boolean;
  setIsMergedView: (val: boolean) => void;
  autoScrollEnabled: boolean;
  setAutoScrollEnabled: (val: boolean) => void;
  scrollToHeaderTop: () => void;
  hideOlderCompleted: boolean;
  setHideOlderCompleted: (val: boolean) => void;
  audioNeedsUnlock: boolean;
  setAudioNeedsUnlock: (val: boolean) => void;
  ttsEnabled: boolean;
  handleToggleTts: () => void;
  announceOrderNotification: (msg: string, force?: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: Category[];
  currentLang: Language;
  beepSim: boolean;
  kdsHeaderRef?: React.RefObject<HTMLDivElement | null>;
}

export const KdsHeader: React.FC<KdsHeaderProps> = React.memo(({
  searchQuery,
  setSearchQuery,
  kdsRole,
  handleRoleSwitch,
  filterStatus,
  setFilterStatus,
  isMergedView,
  setIsMergedView,
  autoScrollEnabled,
  setAutoScrollEnabled,
  scrollToHeaderTop,
  hideOlderCompleted,
  setHideOlderCompleted,
  audioNeedsUnlock,
  setAudioNeedsUnlock,
  ttsEnabled,
  handleToggleTts,
  announceOrderNotification,
  selectedCategory,
  setSelectedCategory,
  categories,
  currentLang,
  beepSim,
}) => {
  return (
    <>
      {/* Sound notification indicator simulation */}
      {beepSim && (
        <div className="fixed top-8 right-8 bg-[#161616] border border-[#E5B453] shadow-2xl text-white px-5 py-3 rounded-xl flex items-center space-x-2 z-50 animate-bounce">
          <Volume2 className="text-[#E5B453] animate-pulse" size={20} />
          <span className="font-bold text-xs text-[#E5B453]">🔊 [逼逼！廚房票據機已列印全新工作單]</span>
        </div>
      )}

      <div className="bg-[#161616] text-white rounded-xl p-5 border border-white/10 space-y-4" id="kds-header-main-box">
        {/* Top Row: Brand & Core Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="bg-[#E5B453] text-[#0F0F0F] p-2.5 rounded-xl">
              <ChefHat size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif tracking-wide text-white">
                沙貝廚房備餐顯示屏 (KDS Monitor)
              </h2>
              <p className="text-white/40 text-xs">即時同步桌席點單 · 最新 1 秒連線正常</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
            {/* Search Input Filter */}
            <div className="relative flex items-center w-full sm:w-52" id="kds-search-bar-container">
              <Search size={14} className="absolute left-3 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋桌號或訂單編號..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E5B453] focus:ring-1 focus:ring-[#E5B453] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-white/40 hover:text-white p-0.5 transition cursor-pointer"
                  title="清除搜尋"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Role Selector: 廚房 vs 店員 */}
            <div
              className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0 select-none font-sans"
              id="kds-role-selector"
            >
              <span className="text-[10px] text-white/50 font-bold px-1 select-none">登錄角色:</span>
              <button
                type="button"
                id="kds-role-kitchen-btn"
                onClick={() => handleRoleSwitch('kitchen')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                  kdsRole === 'kitchen'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-white/40 hover:text-white'
                }`}
                title="廚房角色：獨佔主控寫入權限，資料優先寫入"
              >
                <ChefHat size={12} />
                <span>🍳 廚房 (主控權限)</span>
              </button>

              <button
                type="button"
                id="kds-role-staff-btn"
                onClick={() => handleRoleSwitch('staff')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                  kdsRole === 'staff'
                    ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                    : 'text-white/40 hover:text-white'
                }`}
                title="店員角色：對齊廚房最新資料，衝突時以廚房為準"
              >
                <Eye size={12} />
                <span>👤 店員 (對齊廚房)</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 select-none font-sans">
              <button
                id="kds-filter-active"
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                  filterStatus === 'active'
                    ? 'bg-[#E5B453] text-[#0F0F0F]'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {currentLang === 'zh'
                  ? '未完成 (備餐中)'
                  : currentLang === 'en'
                    ? 'Active (Preparing)'
                    : currentLang === 'ko'
                      ? '미완료 (준비 중)'
                      : currentLang === 'ja'
                        ? '未完了 (準備中)'
                        : currentLang === 'th'
                          ? 'ยังไม่เสร็จ (กำลังปรุง)'
                          : currentLang === 'ru'
                            ? 'В процессе'
                            : currentLang === 'es'
                              ? 'En preparación'
                              : 'Chưa xong (Đang chuẩn bị)'}
              </button>
              <button
                id="kds-filter-all"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-[#E5B453] text-[#0F0F0F]'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {currentLang === 'zh'
                  ? '全部歷史票'
                  : currentLang === 'en'
                    ? 'All History Tickets'
                    : currentLang === 'ko'
                      ? '전체 내역서'
                      : currentLang === 'ja'
                        ? '全履歴伝票'
                        : currentLang === 'th'
                          ? 'ประวัติทั้งหมด'
                          : currentLang === 'ru'
                            ? 'Все чеки истории'
                            : currentLang === 'es'
                              ? 'Historial de tickets'
                              : 'Tất cả phiếu lịch sử'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Secondary KDS workspace configure helper */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/60 pt-0.5">
          <span className="text-[10px] font-bold text-[#E5B453]/70 uppercase tracking-wider mr-1.5 font-sans">
            {currentLang === 'zh' ? '工作台配置 Panel Config:' : 'Workspace Configuration:'}
          </span>

          {/* View Mode Toggle Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 select-none font-sans">
            <button
              id="kds-view-standard"
              onClick={() => setIsMergedView(false)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                !isMergedView ? 'bg-[#E5B453] text-[#0F0F0F]' : 'text-white/40 hover:text-white'
              }`}
              title="時間直欄訂單票長視圖"
            >
              {currentLang === 'zh'
                ? '標準訂單票卡'
                : currentLang === 'en'
                  ? 'Standard Tickets'
                  : currentLang === 'ko'
                    ? '일반 주문서'
                    : currentLang === 'ja'
                      ? '標準伝票'
                      : currentLang === 'th'
                        ? 'บัตรออเดอร์ทั่วไป'
                        : currentLang === 'ru'
                          ? 'Стандартные тикеты'
                          : currentLang === 'es'
                            ? 'Tickets estándar'
                            : 'Phiếu gọi món chuẩn'}
            </button>
            <button
              id="kds-view-merged-toggle"
              onClick={() => setIsMergedView(true)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                isMergedView ? 'bg-[#E5B453] text-[#0F0F0F]' : 'text-white/40 hover:text-white'
              }`}
              title="合併相同品項與計量進行批次製作"
            >
              <ChefHat size={11} className={isMergedView ? 'animate-bounce' : ''} />
              <span>
                {currentLang === 'zh'
                  ? '合併相似菜色'
                  : currentLang === 'en'
                    ? 'Merged View'
                    : currentLang === 'ko'
                      ? '메뉴 병합 보기'
                      : currentLang === 'ja'
                        ? 'メニュー統合表示'
                        : currentLang === 'th'
                          ? 'รวมเมนูที่เหมือนกัน'
                          : currentLang === 'ru'
                            ? 'Группировка блюд'
                            : currentLang === 'es'
                              ? 'Vista agrupada'
                              : 'Gộp món giống nhau'}
              </span>
            </button>
          </div>

          {/* Auto-Scroll To Top Monitor Controls */}
          <div
            className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 select-none gap-2"
            id="kds-scroll-top-wrapper"
          >
            <button
              id="kds-autoscroll-toggle-btn"
              type="button"
              onClick={() => {
                const nextVal = !autoScrollEnabled;
                setAutoScrollEnabled(nextVal);
                try {
                  safeStorage.setItem('kds-autoscroll-enabled', String(nextVal));
                } catch (e) {
                  console.error(e);
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                autoScrollEnabled
                  ? 'bg-[#E5B453] text-[#0F0F0F]'
                  : 'text-white/40 hover:text-white'
              }`}
              title={autoScrollEnabled ? '關閉新訂單自動滾動置頂輔助' : '開啟新訂單自動滾動置頂輔助'}
            >
              <RefreshCw size={11} className={autoScrollEnabled ? 'animate-spin' : ''} />
              <span>
                {autoScrollEnabled
                  ? currentLang === 'zh'
                    ? '自動滾動: 開'
                    : 'Auto-Scroll: ON'
                  : currentLang === 'zh'
                    ? '自動滾動: 關'
                    : 'Auto-Scroll: OFF'}
              </span>
            </button>

            <button
              id="kds-scroll-direct-top"
              type="button"
              onClick={scrollToHeaderTop}
              className="px-2 py-1 hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-[10px] font-extrabold text-[#E5B453] hover:text-amber-300 transition cursor-pointer flex items-center gap-1 active:scale-95"
              title="手動立即滾置頂部 (Manual scroll back to top)"
            >
              <span>{currentLang === 'zh' ? '置頂 ⬆️' : 'Top ⬆️'}</span>
            </button>
          </div>

          {/* Auto-Hide Completed Orders > 30mins */}
          <div
            className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 select-none gap-2"
            id="kds-hide-completed-wrapper"
          >
            <button
              id="kds-hide-completed-toggle-btn"
              type="button"
              onClick={() => {
                const nextVal = !hideOlderCompleted;
                setHideOlderCompleted(nextVal);
                try {
                  safeStorage.setItem('kds-hide-completed-30m', String(nextVal));
                } catch (e) {
                  console.error(e);
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                hideOlderCompleted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
              title={
                hideOlderCompleted
                  ? '點擊關閉「隱藏 30 分鐘前已完成訂單」'
                  : '點擊開啟「自動隱藏 30 分鐘前已完成訂單」以維持 KDS 介面清爽'
              }
            >
              <Clock size={11} className={hideOlderCompleted ? 'text-rose-400 animate-pulse' : ''} />
              <span>
                {hideOlderCompleted
                  ? currentLang === 'zh'
                    ? '自動隱藏已完成 >30m'
                    : 'Auto-Hide Done >30m'
                  : currentLang === 'zh'
                    ? '自動隱藏已完成 >30m (關)'
                    : 'Auto-Hide Done >30m (OFF)'}
              </span>
            </button>
          </div>

          {/* TTS & Web Audio Notifications */}
          <div
            className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 select-none gap-2"
            id="kds-speech-synth-toggle-wrapper"
          >
            {audioNeedsUnlock && (
              <button
                id="kds-audio-unlock-btn"
                type="button"
                onClick={async () => {
                  await unlockAudio();
                  setAudioNeedsUnlock(false);
                  announceOrderNotification('廚房音效與語音已啟用', true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-lg text-[11px] font-bold animate-pulse transition cursor-pointer"
                title="點擊以開啟瀏覽器語音與音效播放權限"
              >
                <Volume2 size={12} className="text-amber-400" />
                <span>{currentLang === 'zh' ? '點擊啟用廚房音效' : 'Click to Enable Audio'}</span>
              </button>
            )}
            <button
              id="kds-tts-toggle-btn"
              type="button"
              onClick={handleToggleTts}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                ttsEnabled ? 'bg-[#E5B453] text-[#0F0F0F]' : 'text-white/40 hover:text-white'
              }`}
              title={ttsEnabled ? '關閉新訂單語音自動播報' : '開啟新訂單語音自動播報'}
            >
              <Volume2 size={12} className={ttsEnabled ? 'animate-pulse' : ''} />
              <span>
                {ttsEnabled
                  ? currentLang === 'zh'
                    ? '語音廣播: 開'
                    : 'Voice Readout: ON'
                  : currentLang === 'zh'
                    ? '語音廣播: 關'
                    : 'Voice Readout: OFF'}
              </span>
            </button>
            {ttsEnabled && (
              <button
                id="kds-tts-test-btn"
                type="button"
                onClick={async () => {
                  await unlockAudio();
                  setAudioNeedsUnlock(false);
                  announceOrderNotification('語音測試，沙貝燒烤祝您用餐愉快', true);
                }}
                className="px-2 py-1 hover:bg-white/5 border border-[#E5B453]/20 hover:border-[#E5B453]/40 rounded-lg text-[10px] font-bold text-[#E5B453] hover:text-white transition cursor-pointer"
                title="測試播放音量與語音廣播"
              >
                {currentLang === 'zh' ? '測試 (Test)' : 'Test'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Station Filter Bar */}
      <div
        className="bg-[#161616] border border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between text-left gap-4"
        id="kds-category-filter-bar"
      >
        <div className="flex items-center space-x-2">
          <Settings size={16} className="text-[#E5B453]" />
          <h3 className="font-bold text-sm text-white font-serif tracking-wide text-left">
            站點分類篩選 (Kitchen Prep Station Filter)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2" id="kds-category-buttons">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-[#E5B453] text-[#0F0F0F] border-[#E5B453] shadow-[0_2px_8px_rgba(229,180,83,0.35)]'
                : 'bg-black/40 text-white/50 border-white/5 hover:text-white hover:bg-black/60 hover:border-white/10'
            }`}
          >
            全部品項 (All Stations)
          </button>
          {categories
            .filter((cat) => cat.showOnCustomerPage !== false)
            .map((cat) => {
              const name = getLocalizedText(cat.name, currentLang) || cat.id;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#E5B453] text-[#0F0F0F] border-[#E5B453] shadow-[0_2px_8px_rgba(229,180,83,0.35)]'
                      : 'bg-black/40 text-white/50 border-white/5 hover:text-white hover:bg-black/60 hover:border-white/10'
                  }`}
                >
                  {name}
                </button>
              );
            })}
        </div>
      </div>
    </>
  );
});
