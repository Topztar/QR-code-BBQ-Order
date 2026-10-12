import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  KdsAudioLeaderElection,
  BroadcastChannelLike,
  isAudioLeader,
  getAudioLeaderId,
  claimAudioLeadership,
  resignAudioLeadership,
  getKdsAudioLeaderManager,
} from '../src/utils/kdsAudioLeader';
import { announceOrderNotification } from '../src/utils/kdsAudio';

// In-memory BroadcastChannel simulator for multi-tab unit testing
class MockBroadcastChannel implements BroadcastChannelLike {
  public name: string;
  private static channels: Map<string, Set<MockBroadcastChannel>> = new Map();
  private listeners: Set<(event: { data: any }) => void> = new Set();

  constructor(name: string) {
    this.name = name;
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, new Set());
    }
    MockBroadcastChannel.channels.get(name)!.add(this);
  }

  postMessage(message: any): void {
    const peers = MockBroadcastChannel.channels.get(this.name);
    if (!peers) return;
    // Deliver asynchronously to other peers on the same channel
    for (const peer of peers) {
      if (peer !== this) {
        setTimeout(() => {
          for (const listener of peer.listeners) {
            listener({ data: structuredClone(message) });
          }
        }, 10);
      }
    }
  }

  addEventListener(type: 'message', listener: (event: { data: any }) => void): void {
    if (type === 'message') {
      this.listeners.add(listener);
    }
  }

  removeEventListener(type: 'message', listener: (event: { data: any }) => void): void {
    if (type === 'message') {
      this.listeners.delete(listener);
    }
  }

  close(): void {
    this.listeners.clear();
    const peers = MockBroadcastChannel.channels.get(this.name);
    if (peers) {
      peers.delete(this);
      if (peers.size === 0) {
        MockBroadcastChannel.channels.delete(this.name);
      }
    }
  }

  static resetAll(): void {
    MockBroadcastChannel.channels.clear();
  }
}

describe('KDS Cross-Tab Audio Leader Election (單一領袖分頁播報)', () => {
  beforeEach(() => {
    MockBroadcastChannel.resetAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('elects the first tab as Leader when no other tab is present', async () => {
    const tab1 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_1',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });

    expect(tab1.isLeader()).toBe(false);

    // Advance time past queryTimeout and claimTimeout
    await vi.advanceTimersByTimeAsync(100);

    expect(tab1.isLeader()).toBe(true);
    expect(tab1.getLeaderId()).toBe('tab_1');

    tab1.destroy();
  });

  it('makes the second tab a follower (Standby) when leader already exists', async () => {
    const tab1 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_1',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(tab1.isLeader()).toBe(true);

    // Tab 2 opens
    const tab2 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_2',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });

    // Advance for message exchange (WHO_IS_LEADER -> HEARTBEAT)
    await vi.advanceTimersByTimeAsync(50);

    expect(tab2.isLeader()).toBe(false);
    expect(tab2.getLeaderId()).toBe('tab_1');
    expect(tab1.isLeader()).toBe(true);

    tab1.destroy();
    tab2.destroy();
  });

  it('triggers immediate leader failover when leader resigns (tab closed)', async () => {
    const tab1 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_1',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });
    await vi.advanceTimersByTimeAsync(100);

    const tab2 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_2',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });
    await vi.advanceTimersByTimeAsync(50);

    expect(tab1.isLeader()).toBe(true);
    expect(tab2.isLeader()).toBe(false);

    // Tab 1 closes / resigns
    tab1.resignLeadership();
    await vi.advanceTimersByTimeAsync(50); // message propagation
    await vi.advanceTimersByTimeAsync(150); // claimTimeout + jitter

    // Tab 2 must be promoted to leader
    expect(tab2.isLeader()).toBe(true);
    expect(tab2.getLeaderId()).toBe('tab_2');

    tab1.destroy();
    tab2.destroy();
  });

  it('recovers and promotes follower via watchdog if leader abruptly crashes without resigning', async () => {
    const tab1 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_1',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });
    await vi.advanceTimersByTimeAsync(100);

    const tab2 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_2',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });
    await vi.advanceTimersByTimeAsync(50);
    expect(tab2.isLeader()).toBe(false);

    // Abruptly kill tab1 without resign message
    tab1.destroy();

    // Advance past tab2's heartbeatTimeout (250ms) + claimTimeout
    await vi.advanceTimersByTimeAsync(400);

    expect(tab2.isLeader()).toBe(true);
    expect(tab2.getLeaderId()).toBe('tab_2');

    tab2.destroy();
  });

  it('allows manual force claim to transfer leadership immediately', async () => {
    const tab1 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_1',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });
    await vi.advanceTimersByTimeAsync(100);

    const tab2 = new KdsAudioLeaderElection({
      channelName: 'test_kds_leader',
      tabId: 'tab_2',
      queryTimeout: 50,
      claimTimeout: 30,
      heartbeatInterval: 100,
      heartbeatTimeout: 250,
      channelFactory: (name) => new MockBroadcastChannel(name),
    });
    await vi.advanceTimersByTimeAsync(50);

    expect(tab1.isLeader()).toBe(true);
    expect(tab2.isLeader()).toBe(false);

    // Tab 2 clicks to force claim leadership
    tab2.claimLeadership(true);
    await vi.advanceTimersByTimeAsync(50);

    expect(tab2.isLeader()).toBe(true);
    expect(tab1.isLeader()).toBe(false);
    expect(tab1.getLeaderId()).toBe('tab_2');

    tab1.destroy();
    tab2.destroy();
  });

  it('suppresses announceOrderNotification on follower tab while playing on leader tab', async () => {
    const globalMgr = getKdsAudioLeaderManager();
    // In default single-tab runtime or elected tab, isAudioLeader() is true
    expect(typeof isAudioLeader()).toBe('boolean');

    // Spy on speech synthesis if available or mock
    const speakMock = vi.fn();
    if (typeof window !== 'undefined') {
      window.speechSynthesis = {
        speak: speakMock,
        cancel: vi.fn(),
        resume: vi.fn(),
        pause: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
        speaking: false,
        pending: false,
        paused: false,
        onvoiceschanged: null,
      } as any;
    }

    // Leader plays notification
    if (isAudioLeader()) {
      await announceOrderNotification('桌號 5 號，有新訂單', false, 'zh');
      if (typeof window !== 'undefined') {
        expect(speakMock).toHaveBeenCalled();
      }
    }

    // Now simulate follower by demoting
    globalMgr.demoteToFollower('other_tab');
    expect(isAudioLeader()).toBe(false);
    speakMock.mockClear();

    // Normal order announcement must be suppressed on follower tab
    await announceOrderNotification('桌號 6 號，有新訂單', false, 'zh');
    expect(speakMock).not.toHaveBeenCalled();

    // Forced announcement (e.g. user clicks test sound button) must bypass suppression
    await announceOrderNotification('語音測試', false, 'zh', { force: true });
    if (typeof window !== 'undefined') {
      expect(speakMock).toHaveBeenCalled();
    }

    // Restore leader
    globalMgr.promoteToLeader();
    expect(isAudioLeader()).toBe(true);
  });
});
