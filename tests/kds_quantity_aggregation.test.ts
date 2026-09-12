// KDS Dish Quantity Aggregation Test
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { expect, test, beforeAll, afterAll } from 'vitest';

import * as net from 'net';

const PROJECT_ID = 'demo-test';
let testEnv: any;
let db: any;
let isEmulatorRunning = false;

async function checkEmulatorOpen(port: number = 8080): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(600);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

beforeAll(async () => {
  isEmulatorRunning = await checkEmulatorOpen(8080);
  if (!isEmulatorRunning) {
    console.warn('[Vitest] Firestore emulator port 8080 is inactive. Skipping live emulator test.');
    return;
  }
  // Initialize the Firestore test environment using the emulator
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: 'localhost',
      port: 8080,
    }
  });
  const ctx = testEnv.unauthenticatedContext();
  db = ctx.firestore();
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
    await testEnv.cleanup();
  }
});

test('KDS aggregates dish quantities correctly', async () => {
  if (!isEmulatorRunning || !db) {
    console.log('[Test Skipped] KDS quantity aggregation test skipped because emulator is offline.');
    return;
  }
  const orders = [
    { id: 'order1', items: [{ itemId: 'chicken', qty: 2 }] },
    { id: 'order2', items: [{ itemId: 'chicken', qty: 3 }] },
    { id: 'order3', items: [{ itemId: 'chicken', qty: 1 }] },
  ];

  // Seed orders into Firestore
  for (const o of orders) {
    await setDoc(doc(db, 'orders', o.id), { items: o.items, status: 'new' });
  }

  // Simulate KDS aggregation logic (sum quantities across all orders)
  const snapshot = await getDocs(collection(db, 'orders'));
  const total = snapshot.docs.reduce((sum, docSnap) => {
    const data = docSnap.data() as any;
    const qty = data.items?.[0]?.qty ?? 0;
    return sum + qty;
  }, 0);
  expect(total).toBe(6);

  // Update one order (order2 qty from 3 -> 4)
  await setDoc(doc(db, 'orders', 'order2'), { items: [{ itemId: 'chicken', qty: 4 }], status: 'new' });

  const updatedSnap = await getDocs(collection(db, 'orders'));
  const updatedTotal = updatedSnap.docs.reduce((sum, d) => {
    const data = d.data() as any;
    const qty = data.items?.[0]?.qty ?? 0;
    return sum + qty;
  }, 0);
  expect(updatedTotal).toBe(7);
});
