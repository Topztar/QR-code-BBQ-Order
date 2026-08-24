import { describe, it, expect, beforeEach } from 'vitest';

export interface QueuedOrder {
  clientOrderId: string;
  tableNumber: string;
  items: Array<{ menuItemId: string; qty: number }>;
  total: number;
  timestamp: number;
  retryCount: number;
}

export class OfflineQueueManager {
  private queue: QueuedOrder[] = [];

  enqueue(order: Omit<QueuedOrder, 'timestamp' | 'retryCount'>): boolean {
    // Idempotency: prevent enqueuing duplicate clientOrderId
    if (this.queue.some(q => q.clientOrderId === order.clientOrderId)) {
      return false;
    }
    this.queue.push({
      ...order,
      timestamp: Date.now(),
      retryCount: 0
    });
    return true;
  }

  dequeue(): QueuedOrder | undefined {
    return this.queue.shift();
  }

  peek(): QueuedOrder | undefined {
    return this.queue[0];
  }

  getQueue(): QueuedOrder[] {
    return [...this.queue];
  }

  size(): number {
    return this.queue.length;
  }

  incrementRetry(clientOrderId: string): number {
    const item = this.queue.find(q => q.clientOrderId === clientOrderId);
    if (item) {
      item.retryCount += 1;
      return item.retryCount;
    }
    return -1;
  }

  remove(clientOrderId: string): boolean {
    const idx = this.queue.findIndex(q => q.clientOrderId === clientOrderId);
    if (idx > -1) {
      this.queue.splice(idx, 1);
      return true;
    }
    return false;
  }

  clear() {
    this.queue = [];
  }
}

describe('Offline FIFO Queue Manager', () => {
  let queueManager: OfflineQueueManager;

  beforeEach(() => {
    queueManager = new OfflineQueueManager();
  });

  it('maintains strict First-In-First-Out (FIFO) delivery order', () => {
    queueManager.enqueue({ clientOrderId: 'ORD-1', tableNumber: '1', items: [{ menuItemId: 'sk-01', qty: 2 }], total: 120 });
    queueManager.enqueue({ clientOrderId: 'ORD-2', tableNumber: '2', items: [{ menuItemId: 'sk-02', qty: 1 }], total: 60 });
    queueManager.enqueue({ clientOrderId: 'ORD-3', tableNumber: '3', items: [{ menuItemId: 'sk-03', qty: 4 }], total: 240 });

    expect(queueManager.size()).toBe(3);
    expect(queueManager.dequeue()?.clientOrderId).toBe('ORD-1');
    expect(queueManager.dequeue()?.clientOrderId).toBe('ORD-2');
    expect(queueManager.dequeue()?.clientOrderId).toBe('ORD-3');
    expect(queueManager.size()).toBe(0);
  });

  it('rejects duplicate clientOrderId submissions to ensure idempotency', () => {
    const success1 = queueManager.enqueue({ clientOrderId: 'ORD-DUP', tableNumber: '1', items: [], total: 100 });
    const success2 = queueManager.enqueue({ clientOrderId: 'ORD-DUP', tableNumber: '1', items: [], total: 100 });

    expect(success1).toBe(true);
    expect(success2).toBe(false);
    expect(queueManager.size()).toBe(1);
  });

  it('correctly tracks and increments retry attempts per order', () => {
    queueManager.enqueue({ clientOrderId: 'ORD-FAIL', tableNumber: '5', items: [], total: 200 });

    expect(queueManager.incrementRetry('ORD-FAIL')).toBe(1);
    expect(queueManager.incrementRetry('ORD-FAIL')).toBe(2);
    expect(queueManager.peek()?.retryCount).toBe(2);
  });

  it('allows removing specific synced orders upon successful backend acknowledgment', () => {
    queueManager.enqueue({ clientOrderId: 'ORD-A', tableNumber: '1', items: [], total: 50 });
    queueManager.enqueue({ clientOrderId: 'ORD-B', tableNumber: '2', items: [], total: 80 });

    const removed = queueManager.remove('ORD-A');
    expect(removed).toBe(true);
    expect(queueManager.size()).toBe(1);
    expect(queueManager.peek()?.clientOrderId).toBe('ORD-B');
  });
});
