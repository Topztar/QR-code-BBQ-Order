import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [points, setPoints] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setBalance('0');
      setPoints('0');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const parsedBalance = parseInt(balance, 10) || 0;
    const parsedPoints = parseInt(points, 10) || 0;

    if (!trimmedName) {
      setError('請輸入顧客姓名！');
      return;
    }
    if (!trimmedEmail) {
      setError('請輸入電子郵箱！');
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setError('請輸入有效的電子郵箱格式！');
      return;
    }

    const dbStr = localStorage.getItem('google-members-database');
    let db: any[] = [];
    if (dbStr) {
      try {
        db = JSON.parse(dbStr);
      } catch (_e) {
        db = [];
      }
    }

    if (db.some((m: any) => m.email && m.email.toLowerCase().trim() === trimmedEmail)) {
      setError('此電子郵箱已被其他會員綁定使用！');
      return;
    }

    const newMember = {
      name: trimmedName,
      email: trimmedEmail,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      joinedAt: new Date().toISOString().split('T')[0],
      balance: parsedBalance,
      points: parsedPoints,
    };

    db.push(newMember);
    localStorage.setItem('google-members-database', JSON.stringify(db));
    localStorage.setItem(`google-points-${trimmedEmail}`, String(parsedPoints));

    window.dispatchEvent(new Event('local-points-updated'));
    onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[10000] flex items-center justify-center p-4 text-xs font-sans animate-fadeIn"
      id="add-member-modal-container"
    >
      <div className="bg-[#18181A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp text-left">
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 text-[#E5B453]">
            <Plus size={22} className="shrink-0 animate-bounce" />
            <h3 className="font-extrabold text-white text-base tracking-wide font-sans">
              👤 手動新增顧客會員 Add New Member
            </h3>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-semibold rounded-lg text-left">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-zinc-400 font-bold block text-[11px]">
                顧客姓名 Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="例如: 王小明"
                className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-bold block text-[11px]">
                電子郵箱 Email * (用於唯一帳戶識別)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="例如: xiaoming@gmail.com"
                className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block text-[11px]">
                  初始儲值金 (NT$)
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => {
                    setBalance(e.target.value);
                    setError(null);
                  }}
                  min="0"
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block text-[11px]">
                  初始點數 (Points)
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => {
                    setPoints(e.target.value);
                    setError(null);
                  }}
                  min="0"
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#E5B453] transition font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-zinc-300 font-extrabold rounded-lg transition active:scale-95 cursor-pointer text-[11px]"
            >
              取消 Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#E5B453] hover:bg-[#d6a546] text-black font-extrabold rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-[#E5B453]/10 text-[11px]"
            >
              確認新增 Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
