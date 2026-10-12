import express from 'express';

export interface MemberRouteContext {
  getLiveMembers: () => any[];
  setLiveMembers: (members: any[]) => void;
  getLiveMemberPointsRatio: () => number;
  saveStateToDisk: () => void;
}

export function registerMembersRoutes(app: express.Express, ctx: MemberRouteContext) {
  const {
    getLiveMembers,
    getLiveMemberPointsRatio,
    saveStateToDisk
  } = ctx;

  // GET /api/members — list all members (staff-only view)
  app.get('/api/members', (_req, res) => {
    res.json(getLiveMembers());
  });

  // GET /api/members/:email — fetch a single member by email
  app.get('/api/members/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email).trim().toLowerCase();
    const liveMembers = getLiveMembers();
    const member = liveMembers.find(m => m.email.toLowerCase() === email);
    if (!member) return res.status(404).json({ error: '會員帳號不存在 / Member not found' });
    res.json(member);
  });

  // POST /api/members/:email/topup — add stored-value balance (staff cashier top-up)
  app.post('/api/members/:email/topup', (req, res) => {
    const email = decodeURIComponent(req.params.email).trim().toLowerCase();
    const { amount } = req.body;
    const amtNum = Number(amount);
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      return res.status(400).json({ error: '儲值金額必須為正整數 / Amount must be a positive number' });
    }
    const liveMembers = getLiveMembers();
    const memberIdx = liveMembers.findIndex(m => m.email.toLowerCase() === email);
    if (memberIdx < 0) return res.status(404).json({ error: '會員帳號不存在 / Member not found' });
    liveMembers[memberIdx].balance = (liveMembers[memberIdx].balance || 0) + amtNum;
    liveMembers[memberIdx].updatedAt = Date.now();
    saveStateToDisk();
    console.log(`[Members] Top-up NT$${amtNum} for ${email}. New balance: NT$${liveMembers[memberIdx].balance}`);
    return res.json({ success: true, member: liveMembers[memberIdx] });
  });

  // POST /api/members/:email/deduct — deduct balance at checkout (server-side validation)
  app.post('/api/members/:email/deduct', (req, res) => {
    const email = decodeURIComponent(req.params.email).trim().toLowerCase();
    const { amount, orderId } = req.body;
    const amtNum = Number(amount);
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      return res.status(400).json({ error: '扣款金額必須為正整數 / Amount must be a positive number' });
    }
    const liveMembers = getLiveMembers();
    const memberIdx = liveMembers.findIndex(m => m.email.toLowerCase() === email);
    if (memberIdx < 0) return res.status(404).json({ error: '會員帳號不存在 / Member not found' });
    const currentBalance = liveMembers[memberIdx].balance || 0;
    if (currentBalance < amtNum) {
      return res.status(400).json({
        error: `儲值餘額不足！目前餘額 NT$${currentBalance}，需扣 NT$${amtNum}`,
        currentBalance,
        required: amtNum
      });
    }
    liveMembers[memberIdx].balance = currentBalance - amtNum;
    // Award loyalty points: ratio = NT$liveMemberPointsRatio per 1 point
    const ratio = getLiveMemberPointsRatio();
    const earnedPoints = Math.floor(amtNum / (ratio || 20));
    liveMembers[memberIdx].points = (liveMembers[memberIdx].points || 0) + earnedPoints;
    liveMembers[memberIdx].updatedAt = Date.now();
    saveStateToDisk();
    console.log(`[Members] Deducted NT$${amtNum} (order: ${orderId || 'N/A'}) for ${email}. ` +
      `Remaining: NT$${liveMembers[memberIdx].balance}. Points earned: +${earnedPoints}`);
    return res.json({ success: true, member: liveMembers[memberIdx], earnedPoints });
  });
}
