export interface Member {
  email: string;
  name: string;
  phone?: string;
  points?: number;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const MEMBERS_STORAGE_KEY = 'google-members-database';
export const MEMBERS_UPDATED_EVENT = 'local-points-updated';

class MemberService {
  /**
   * 取得所有會員列表，保證回傳有效陣列
   */
  getMembers(): Member[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('[memberService] Failed to parse members database:', e);
      return [];
    }
  }

  /**
   * 從後端 API 同步全域最新會員資料至本地快取
   */
  async syncFromBackend(): Promise<Member[]> {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.saveMembers(data, true);
          return data;
        }
      }
    } catch (err) {
      console.warn('[memberService] Background sync with /api/members failed, using local cache:', err);
    }
    return this.getMembers();
  }

  /**
   * 儲存會員列表至 localStorage 並發送全域同步事件
   */
  saveMembers(members: Member[], emitEvent: boolean = true): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
      if (emitEvent) {
        this.notifyMembersUpdated();
      }
    } catch (e) {
      console.error('[memberService] Failed to save members database:', e);
    }
  }

  /**
   * 依 Email 尋找會員（自動不區分大小寫與前後空白）
   */
  getMemberByEmail(email: string | null | undefined): Member | null {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    const members = this.getMembers();
    return members.find(m => m.email && m.email.toLowerCase().trim() === cleanEmail) || null;
  }

  /**
   * 依姓名尋找會員
   */
  getMemberByName(name: string | null | undefined): Member | null {
    if (!name) return null;
    const cleanName = name.trim();
    const members = this.getMembers();
    return members.find(m => m.name && m.name.trim() === cleanName) || null;
  }

  /**
   * 增減會員點數，回傳更新後結果
   */
  updateMemberPoints(email: string, delta: number): { success: boolean; newPoints?: number; error?: string } {
    if (!email) {
      return { success: false, error: '未提供會員 Email！' };
    }
    if (isNaN(delta)) {
      return { success: false, error: '❌ 請輸入有效的整數點數！' };
    }

    const cleanEmail = email.toLowerCase().trim();
    const members = this.getMembers();
    const targetIdx = members.findIndex(m => m.email && m.email.toLowerCase().trim() === cleanEmail);

    if (targetIdx === -1) {
      return { success: false, error: '找不到該會員帳號！' };
    }

    const currentPoints = Number(members[targetIdx].points) || 0;
    const finalPoints = Math.max(0, currentPoints + delta);
    
    members[targetIdx] = {
      ...members[targetIdx],
      points: finalPoints,
      updatedAt: new Date().toISOString()
    };

    // 同步歷史點數 key
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`google-points-${members[targetIdx].email}`, String(finalPoints));
    }

    this.saveMembers(members, true);
    return { success: true, newPoints: finalPoints };
  }

  /**
   * 增減會員儲值餘額
   */
  updateMemberBalance(email: string, delta: number): { success: boolean; newBalance?: number; error?: string } {
    if (!email) {
      return { success: false, error: '未提供會員 Email！' };
    }
    if (isNaN(delta)) {
      return { success: false, error: '❌ 請輸入有效的餘額數值！' };
    }

    const cleanEmail = email.toLowerCase().trim();
    const members = this.getMembers();
    const targetIdx = members.findIndex(m => m.email && m.email.toLowerCase().trim() === cleanEmail);

    if (targetIdx === -1) {
      return { success: false, error: '找不到該會員帳號！' };
    }

    const currentBalance = Number(members[targetIdx].balance) || 0;
    const finalBalance = Math.max(0, currentBalance + delta);

    members[targetIdx] = {
      ...members[targetIdx],
      balance: finalBalance,
      updatedAt: new Date().toISOString()
    };

    this.saveMembers(members, true);
    return { success: true, newBalance: finalBalance };
  }

  /**
   * 新增會員
   */
  addMember(newMember: {
    name: string;
    email: string;
    avatar?: string;
    balance?: number;
    points?: number;
    joinedAt?: string;
  }): { success: boolean; member?: Member; error?: string } {
    if (!newMember.email || !newMember.name) {
      return { success: false, error: '姓名與 Email 為必填欄位！' };
    }
    const cleanEmail = newMember.email.toLowerCase().trim();
    const members = this.getMembers();

    if (members.some(m => m.email && m.email.toLowerCase().trim() === cleanEmail)) {
      return { success: false, error: '此電子郵箱已被其他會員綁定使用！' };
    }

    const member: Member = {
      name: newMember.name.trim(),
      email: cleanEmail,
      avatar: newMember.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      joinedAt: newMember.joinedAt || new Date().toISOString().split('T')[0],
      balance: Number(newMember.balance) || 0,
      points: Number(newMember.points) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    members.push(member);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`google-points-${cleanEmail}`, String(member.points));
    }

    this.saveMembers(members, true);
    return { success: true, member };
  }

  /**
   * 批次或通用更新特定會員資料
   */
  updateMember(email: string, updates: Partial<Member>): { success: boolean; member?: Member; error?: string } {
    if (!email) return { success: false, error: '未提供會員 Email！' };
    const cleanEmail = email.toLowerCase().trim();
    const members = this.getMembers();
    const idx = members.findIndex(m => m.email && m.email.toLowerCase().trim() === cleanEmail);
    if (idx === -1) return { success: false, error: '找不到該會員帳號！' };

    members[idx] = {
      ...members[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveMembers(members, true);
    return { success: true, member: members[idx] };
  }

  /**
   * 清除所有本地會員資料
   */
  clearAllMembers(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(MEMBERS_STORAGE_KEY);
      this.notifyMembersUpdated();
    }
  }

  /**
   * 刪除會員並同步清除關聯點數 key
   */
  deleteMember(email: string): { success: boolean; error?: string } {
    if (!email) {
      return { success: false, error: '未提供欲刪除之會員 Email！' };
    }
    const cleanEmail = email.toLowerCase().trim();
    const members = this.getMembers();
    const filtered = members.filter(m => !m.email || m.email.toLowerCase().trim() !== cleanEmail);

    if (filtered.length === members.length) {
      return { success: false, error: '找不到該會員或已被刪除！' };
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`google-points-${email}`);
    }

    this.saveMembers(filtered, true);
    return { success: true };
  }

  /**
   * 發出全域資料更新廣播事件
   */
  notifyMembersUpdated(): void {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event(MEMBERS_UPDATED_EVENT));
    }
  }
}

export const memberService = new MemberService();
