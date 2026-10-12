import express from 'express';
import { TableConfig, Reservation } from '../../types';

export interface TablesRouteContext {
  getLiveTables: () => TableConfig[];
  setLiveTables: (tables: TableConfig[]) => void;
  getLiveReservations: () => Reservation[];
  setLiveReservations: (reservations: Reservation[]) => void;
  getLiveOrders: () => any[];
  setLiveOrders: (orders: any[]) => void;
  getLiveNotificationSettings: () => any;
  getFirestoreDb: () => any;
  getTableCheckoutTimeouts: () => Map<string, NodeJS.Timeout>;
  getLiveTakeoutSeq: () => number;
  setLiveTakeoutSeq: (seq: number) => void;
  getLastTakeoutDate: () => string;
  setLastTakeoutDate: (date: string) => void;
  syncTableStatusesWithTodayReservations: () => void;
  cleanupUnlistedReservationData: () => void;
  validateReservationBooking: (date: string, time: string, guestCount: number, tableNumber: string, isStaffOverride: boolean, currentId?: string) => { error?: string };
  sendReservationNotifications: (reservation: any, options: any) => Promise<any>;
  saveStateToDisk: () => void;
  reservationRateLimiter?: express.RequestHandler;
  setDoc: any;
  doc: any;
  deleteDoc: any;
}

export function registerTablesRoutes(app: express.Express, ctx: TablesRouteContext) {
  const {
    getLiveTables,
    getLiveReservations,
    getLiveOrders,
    setLiveOrders,
    getLiveNotificationSettings,
    getFirestoreDb,
    getTableCheckoutTimeouts,
    getLiveTakeoutSeq,
    setLiveTakeoutSeq,
    getLastTakeoutDate,
    setLastTakeoutDate,
    syncTableStatusesWithTodayReservations,
    cleanupUnlistedReservationData,
    validateReservationBooking,
    sendReservationNotifications,
    saveStateToDisk,
    reservationRateLimiter = ((_req, _res, next) => next()),
    setDoc,
    doc,
    deleteDoc
  } = ctx;

  // Tables Management Endpoints
  app.get('/api/tables', (_req, res) => {
    syncTableStatusesWithTodayReservations();
    res.json(getLiveTables());
  });

  app.post('/api/tables', (req, res) => {
    const { id, qrCodeUrl, status, preservedFor, mergedWith, positionX, positionY, maxCapacity } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id / 缺少桌號 ID' });
    }
    const cleanId = id.toString().trim();
    if (!cleanId) {
      return res.status(400).json({ error: 'Invalid Table ID / 無效桌號' });
    }
    const liveTables = getLiveTables();
    if (liveTables.some(t => t.id === cleanId)) {
      return res.status(400).json({ error: 'Table ID already exists / 桌號已存在' });
    }
    const newTable: TableConfig = {
      id: cleanId,
      qrCodeUrl: qrCodeUrl || `/?table=${cleanId}`,
      status: status || 'available',
      preservedFor: preservedFor || '',
      mergedWith: mergedWith || '',
      positionX: positionX !== undefined ? parseFloat(positionX) : 10,
      positionY: positionY !== undefined ? parseFloat(positionY) : 10,
      maxCapacity: maxCapacity !== undefined ? parseInt(maxCapacity, 10) : undefined
    };
    liveTables.push(newTable);
    // Sort table list numerically if possible
    liveTables.sort((a, b) => {
      const numA = parseInt(a.id, 10);
      const numB = parseInt(b.id, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.id.localeCompare(b.id);
    });
    syncTableStatusesWithTodayReservations();
    saveStateToDisk();
    res.status(201).json(newTable);
  });

  app.put('/api/tables/:id', (req, res) => {
    const { id } = req.params;
    const { qrCodeUrl, status, preservedFor, mergedWith, positionX, positionY, maxCapacity, cleaningStartedAt } = req.body;
    const decodedId = decodeURIComponent(id).trim();
    const liveTables = getLiveTables();
    const tableCheckoutTimeouts = getTableCheckoutTimeouts();
    const tableIndex = liveTables.findIndex(t => t.id.toString().trim() === decodedId);
    if (tableIndex > -1) {
      if (qrCodeUrl !== undefined) {
        liveTables[tableIndex].qrCodeUrl = qrCodeUrl;
      }
      if (status !== undefined) {
        liveTables[tableIndex].status = status;
        if (status === 'cleaning' && cleaningStartedAt === undefined && !liveTables[tableIndex].cleaningStartedAt) {
          liveTables[tableIndex].cleaningStartedAt = new Date().toISOString();
        } else if (status !== 'cleaning') {
          liveTables[tableIndex].cleaningStartedAt = null;
          if (tableCheckoutTimeouts.has(decodedId)) {
            clearTimeout(tableCheckoutTimeouts.get(decodedId)!);
            tableCheckoutTimeouts.delete(decodedId);
          }
        }
      }
      if (cleaningStartedAt !== undefined) {
        liveTables[tableIndex].cleaningStartedAt = cleaningStartedAt;
      }
      if (preservedFor !== undefined) {
        liveTables[tableIndex].preservedFor = preservedFor;
      }
      if (mergedWith !== undefined) {
        liveTables[tableIndex].mergedWith = mergedWith;
      }
      if (positionX !== undefined) {
        liveTables[tableIndex].positionX = parseFloat(positionX);
      }
      if (positionY !== undefined) {
        liveTables[tableIndex].positionY = parseFloat(positionY);
      }
      if (maxCapacity !== undefined) {
        liveTables[tableIndex].maxCapacity = parseInt(maxCapacity, 10);
      }
      saveStateToDisk();
      return res.json({ success: true, table: liveTables[tableIndex] });
    }
    res.status(404).json({ error: 'Table not found / 找不到此桌號' });
  });

  app.delete('/api/tables/:id', (req, res) => {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id).trim();
    const liveTables = getLiveTables();
    const tableIndex = liveTables.findIndex(t => t.id.toString().trim() === decodedId);
    if (tableIndex > -1) {
      const deleted = liveTables.splice(tableIndex, 1);
      saveStateToDisk();
      return res.json({ success: true, deleted });
    }
    res.status(404).json({ error: 'Table not found / 找不到此桌號' });
  });

  // Reservations Management Endpoints
  app.get('/api/reservations', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授權存取：憑證格式不正確' });
    }
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token || (!token.startsWith('st_') && token !== 'authenticated')) {
      return res.status(403).json({ error: '安全憑證無效或已過期，請確認管理員權限' });
    }
    cleanupUnlistedReservationData();
    syncTableStatusesWithTodayReservations();
    res.json(getLiveReservations());
  });

  app.post('/api/reservations', reservationRateLimiter, (req, res) => {
    const { customerName, phone, guestCount, tableNumber, date, time, notes, status } = req.body;
    if (!customerName || !phone || !tableNumber || !date || !time) {
      return res.status(400).json({ error: 'Missing required field: customerName, phone, tableNumber, date, time / 缺少預約必填欄位' });
    }

    const validation = validateReservationBooking(
      date,
      time,
      guestCount,
      tableNumber,
      !!req.body.isStaffOverride
    );
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const newReservation: Reservation = {
      id: 'res-' + Math.random().toString(36).substring(2, 11),
      customerName: customerName.trim(),
      phone: phone.trim(),
      guestCount: parseInt(guestCount, 10) || 1,
      tableNumber: tableNumber.trim(),
      date: date.trim(),
      time: time.trim(),
      notes: notes || '',
      status: status || 'pending',
      createdAt: new Date().toISOString()
    };
    const liveReservations = getLiveReservations();
    liveReservations.push(newReservation);

    // Sync table status with reservation (only for today's reservations)
    syncTableStatusesWithTodayReservations();

    const firestoreDb = getFirestoreDb();
    if (firestoreDb && setDoc && doc) {
      setDoc(doc(firestoreDb, 'reservations', newReservation.id), newReservation)
        .catch((err: any) => console.error('[Firebase] Failed to sync new reservation to firestore:', err));
    }

    saveStateToDisk();

    // Real-time Admin Notifications (LINE & Gmail) - non-blocking background dispatch
    sendReservationNotifications(newReservation, { notificationConfig: getLiveNotificationSettings() }).catch((err: any) => {
      console.error('[Notification] Background dispatch error:', err);
    });

    res.status(201).json(newReservation);
  });

  app.put('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const { customerName, phone, guestCount, tableNumber, date, time, notes, status } = req.body;
    const decodedId = decodeURIComponent(id).trim();
    const liveReservations = getLiveReservations();
    const liveTables = getLiveTables();
    const firestoreDb = getFirestoreDb();
    const index = liveReservations.findIndex(r => r.id === decodedId || (r as any).reservationNo === decodedId);
    if (index > -1) {
      const existing = liveReservations[index];
      const newDate = date !== undefined ? date.trim() : existing.date;
      const newTime = time !== undefined ? time.trim() : existing.time;
      const newTable = tableNumber !== undefined ? tableNumber.trim() : existing.tableNumber;
      const newStatus = status !== undefined ? status : existing.status;

      const now = new Date();
      now.setMonth(now.getMonth() + 3);
      const maxDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (newDate && newDate > maxDateStr) {
        return res.status(400).json({ error: `預約日期最多只能提前 3 個月 (最晚至 ${maxDateStr})！` });
      }

      // 預約若被取消，一併刪除該預約紀錄與專屬點餐通道
      if (newStatus === 'cancelled') {
        const [deleted] = liveReservations.splice(index, 1);
        cleanupUnlistedReservationData();
        syncTableStatusesWithTodayReservations();
        saveStateToDisk();
        if (firestoreDb && deleteDoc && doc) {
          deleteDoc(doc(firestoreDb, 'reservations', deleted.id)).catch((err: any) => console.error('[Firebase] Failed to delete cancelled reservation:', err));
        }
        return res.json({ success: true, message: 'Reservation cancelled and deleted / 預約已取消並刪除', reservation: deleted });
      }

      if (newStatus !== 'cancelled' && (date !== undefined || time !== undefined || tableNumber !== undefined || guestCount !== undefined)) {
        const validation = validateReservationBooking(
          newDate,
          newTime,
          guestCount !== undefined ? parseInt(guestCount as any, 10) || 1 : existing.guestCount,
          newTable,
          !!req.body.isStaffOverride,
          existing.id
        );
        if (validation.error) {
          return res.status(400).json({ error: validation.error });
        }
      }
      if (customerName !== undefined) liveReservations[index].customerName = customerName;
      if (phone !== undefined) liveReservations[index].phone = phone;
      if (guestCount !== undefined) liveReservations[index].guestCount = parseInt(guestCount, 10) || 1;
      if (tableNumber !== undefined) liveReservations[index].tableNumber = tableNumber;
      if (date !== undefined) liveReservations[index].date = date;
      if (time !== undefined) liveReservations[index].time = time;
      if (notes !== undefined) liveReservations[index].notes = notes;
      if (status !== undefined) liveReservations[index].status = status;

      const updatedRes = liveReservations[index];
      if (updatedRes.status === 'seated') {
        const tb = liveTables.find(t => t.id.toString().trim() === updatedRes.tableNumber.toString().trim());
        if (tb) {
          tb.status = 'in_use';
          tb.preservedFor = '';
        }
      } else {
        syncTableStatusesWithTodayReservations();
      }

      saveStateToDisk();
      return res.json({ success: true, reservation: liveReservations[index] });
    }
    res.status(404).json({ error: 'Reservation not found / 找不到此預約' });
  });

  app.delete('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id).trim();
    const liveReservations = getLiveReservations();
    const firestoreDb = getFirestoreDb();
    const index = liveReservations.findIndex(r => r.id === decodedId || (r as any).reservationNo === decodedId);
    if (index > -1) {
      const [deleted] = liveReservations.splice(index, 1);

      // 手動刪除訂位資料時，暫存的訂位點餐資料也一併刪除
      let liveOrders = getLiveOrders();
      if (Array.isArray(liveOrders)) {
        liveOrders = liveOrders.filter(order => {
          if (!order.reservationNo && !order.reservationDate) return true;
          const isMatchingResNo = order.reservationNo && (
            order.reservationNo === deleted.id || 
            order.reservationNo === (deleted as any).reservationNo || 
            order.reservationNo === decodedId
          );
          const isMatchingTableAndDate = order.reservationDate && 
            order.reservationDate === deleted.date && 
            String(order.tableNumber).trim() === String(deleted.tableNumber).trim();
          return !(isMatchingResNo || isMatchingTableAndDate);
        });
        setLiveOrders(liveOrders);
      }

      cleanupUnlistedReservationData();
      syncTableStatusesWithTodayReservations();
      saveStateToDisk();

      if (firestoreDb && deleteDoc && doc) {
        try {
          await deleteDoc(doc(firestoreDb, 'reservations', deleted.id));
        } catch (err) {
          console.error('[Firebase] Failed to delete reservation:', err);
        }
      }

      return res.json({ success: true, deleted });
    }
    res.status(404).json({ error: 'Reservation not found / 找不到此預約' });
  });

  // Takeout scan auto-increment & daily-midnight-reset endpoint
  app.post('/api/takeout/scan', (_req, res) => {
    const today = new Date().toDateString();
    let liveTakeoutSeq = getLiveTakeoutSeq();
    if (today !== getLastTakeoutDate()) {
      liveTakeoutSeq = 0;
      setLastTakeoutDate(today);
    }
    liveTakeoutSeq++;
    setLiveTakeoutSeq(liveTakeoutSeq);
    const assigned = `外帶 #${liveTakeoutSeq}`;
    saveStateToDisk();
    res.json({ success: true, tableNumber: assigned, sequence: liveTakeoutSeq });
  });

  app.get('/api/takeout/status', (_req, res) => {
    const today = new Date().toDateString();
    let liveTakeoutSeq = getLiveTakeoutSeq();
    if (today !== getLastTakeoutDate()) {
      liveTakeoutSeq = 0;
      setLastTakeoutDate(today);
      setLiveTakeoutSeq(0);
    }
    res.json({ sequence: liveTakeoutSeq, lastResetDate: getLastTakeoutDate() });
  });
}
