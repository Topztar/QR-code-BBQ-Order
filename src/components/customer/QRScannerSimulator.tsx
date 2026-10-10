import { QrCode } from 'lucide-react';
import { TableConfig } from '../../types';

export interface QRScannerSimulatorProps {
  isTableFixed: boolean;
  isOrderRoute: boolean;
  tables: TableConfig[];
  handleSimulateScan: (tableId: string) => void;
}

export const QRScannerSimulator: React.FC<QRScannerSimulatorProps> = ({
  isTableFixed,
  isOrderRoute,
  tables,
  handleSimulateScan,
}) => {
  if (isTableFixed || isOrderRoute) return null;

  return (
    <div className="bg-black/30 border border-white/5 rounded-3xl p-4.5 space-y-3 text-left">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#E5B453] flex items-center space-x-1.5 font-sans">
          <QrCode size={14} className="text-[#E5B453]" />
          <span>📲 點餐二維碼模擬器 QR Code Scan Simulator</span>
        </p>
        <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
          內用桌暨外帶單一 QR 碼
        </span>
      </div>
      <p className="text-[11px] text-white/50 leading-relaxed font-sans">
        在店面營運中，顧客可直接用手機掃描設定好的 QR
        碼進行免接觸點餐。請隨意點選下方按鈕模擬顧客掃描：
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleSimulateScan('takeout')}
          className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] px-3 py-2 rounded-xl active:scale-95 transition cursor-pointer shadow-md shadow-rose-955/20 border border-rose-500/10"
        >
          <QrCode size={13} className="animate-spin-slow" />
          <span>掃描外帶單一 QR 碼 (號碼自動累加)</span>
        </button>

        {tables.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSimulateScan(t.id)}
            className="flex items-center space-x-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-bold text-[11px] px-2.5 py-2 rounded-xl active:scale-95 transition cursor-pointer"
          >
            <QrCode size={12} className="text-[#E5B453]/80" />
            <span>內用 {t.id} 桌</span>
          </button>
        ))}
      </div>
    </div>
  );
};
