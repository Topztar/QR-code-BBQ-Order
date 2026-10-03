import express from 'express';
import { Firestore } from 'firebase-admin/firestore';
 // Use relative import to index or redefine RouteContext

export function registerMembersRoutes(app: express.Application, ctx: any) {
  const { db, requireStaffAuth, sendErrorResponse } = ctx;
  const membersRef = db.collection('members');

  // 雙路徑路由包裝器
  const get = (routePath: string, ...handlers: express.RequestHandler[]) => app.get([`/api${routePath}`, routePath], ...handlers);
  const post = (routePath: string, ...handlers: express.RequestHandler[]) => app.post([`/api${routePath}`, routePath], ...handlers);

  // GET /members — list all members (staff-only view)
  get('/members', requireStaffAuth, async (_req: express.Request, res: express.Response) => {
    try {
      const snap = await membersRef.get();
      const members = snap.docs.map((doc: any) => ({ ...doc.data() }));
      res.json(members);
    } catch (err) {
      sendErrorResponse(res, err, '取得會員列表失敗');
    }
  });

  // GET /members/:email — fetch a single member by email
  get('/members/:email', requireStaffAuth, async (req: express.Request, res: express.Response) => {
    try {
      const email = String(req.params.email).toLowerCase();
      const doc = await membersRef.doc(email).get();
      if (!doc.exists) {
        return res.status(404).json({ error: '會員不存在' });
      }
      res.json(doc.data());
    } catch (err) {
      sendErrorResponse(res, err, '取得會員失敗');
    }
  });

  // POST /members — upsert a member (create or update name/avatar/points from Google sign-in)
  post('/members', async (req: express.Request, res: express.Response) => {
    try {
      const { email, name, avatar, idToken } = req.body;
      if (!email) return res.status(400).json({ error: '缺少會員信箱' });

      const normalEmail = String(email).toLowerCase();
      const docRef = membersRef.doc(normalEmail);

      await db.runTransaction(async (t: any) => {
        const doc = await t.get(docRef);
        if (doc.exists) {
          t.update(docRef, {
            name: String(name || doc.data()?.name || '').trim(),
            avatar: avatar ? String(avatar) : doc.data()?.avatar,
            updatedAt: Date.now()
          });
        } else {
          t.set(docRef, {
            email: normalEmail,
            name: String(name || '').trim(),
            avatar: avatar ? String(avatar) : '',
            points: 0,
            balance: 0,
            joinDate: Date.now(),
            updatedAt: Date.now()
          });
        }
      });

      const updatedDoc = await docRef.get();
      res.json({ success: true, member: updatedDoc.data() });
    } catch (err) {
      sendErrorResponse(res, err, '更新會員資料失敗');
    }
  });

  // POST /members/:email/topup — add stored-value balance (staff cashier top-up)
  post('/members/:email/topup', requireStaffAuth, async (req: express.Request, res: express.Response) => {
    try {
      const email = String(req.params.email).toLowerCase();
      const { amount } = req.body;
      const amtNum = parseInt(amount, 10);

      if (isNaN(amtNum) || amtNum <= 0) {
        return res.status(400).json({ error: '儲值金額必須為大於零的有效整數' });
      }

      const docRef = membersRef.doc(email);
      let newBalance = 0;

      await db.runTransaction(async (t: any) => {
        const doc = await t.get(docRef);
        if (!doc.exists) {
          throw new Error('會員不存在，無法儲值');
        }
        const currentBalance = doc.data()?.balance || 0;
        newBalance = currentBalance + amtNum;
        t.update(docRef, {
          balance: newBalance,
          updatedAt: Date.now()
        });
      });

      const updatedDoc = await docRef.get();
      res.json({ success: true, member: updatedDoc.data() });
    } catch (err) {
      sendErrorResponse(res, err, '會員儲值失敗');
    }
  });

  // POST /members/:email/deduct — deduct balance at checkout (server-side validation)
  post('/members/:email/deduct', requireStaffAuth, async (req: express.Request, res: express.Response) => {
    try {
      const email = String(req.params.email).toLowerCase();
      const { amount, orderId } = req.body;
      const amtNum = parseInt(amount, 10);

      if (isNaN(amtNum) || amtNum <= 0) {
        return res.status(400).json({ error: '扣款金額必須為大於零的有效整數' });
      }

      const docRef = membersRef.doc(email);
      const earnedPoints = Math.floor(amtNum / 100);

      await db.runTransaction(async (t: any) => {
        const doc = await t.get(docRef);
        if (!doc.exists) {
          throw new Error('會員不存在，無法扣款');
        }
        const currentBalance = doc.data()?.balance || 0;
        if (currentBalance < amtNum) {
          throw new Error('會員儲值金餘額不足');
        }

        t.update(docRef, {
          balance: currentBalance - amtNum,
          points: (doc.data()?.points || 0) + earnedPoints,
          updatedAt: Date.now()
        });
      });

      const updatedDoc = await docRef.get();
      res.json({ success: true, member: updatedDoc.data(), earnedPoints });
    } catch (err: any) {
      if (err.message && (err.message.includes('餘額不足') || err.message.includes('不存在'))) {
        return res.status(400).json({ error: err.message });
      }
      sendErrorResponse(res, err, '會員扣款失敗');
    }
  });
}
