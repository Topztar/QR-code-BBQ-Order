// KDS Dish Quantity Aggregation Test
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { expect, test, beforeAll, afterAll } from 'vitest';

const PROJECT_ID = 'demo-test';
let testEnv: any;
let db: FirebaseFirestore.Firestore;

beforeAll(async () => {
  // Initialize the Firestore test environment using the emulator
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: 'localhost',
      port: 8080,
      // No custom rules are needed for this aggregation test
    }
  });
  const ctx = testEnv.unauthenticatedContext();
  db = ctx.firestore();
});

afterAll(async () => {
  // Clean up all documents created during the tests
  await testEnv.clearFirestore();
  await testEnv.cleanup();
});

test('KDS aggregates dish quantities correctly', async () => {
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
