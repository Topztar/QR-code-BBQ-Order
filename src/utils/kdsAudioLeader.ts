/**
 * 👑 KDS Cross-Tab Audio Leader Election Engine (BroadcastChannel)
 * 
 * Provides:
 * 1. Single Leader Tab Voice Announcement (單一領袖分頁播報) across multiple KDS tabs on the same device.
 * 2. Automatic leader election, heartbeat watchdog, and seamless failover when tabs close.
 * 3. Prevents overlapping/echoing speech synthesis & chime audio when multi-windows are open.
 * 4. Deterministic tie-breaking, split-brain resolution, and manual leader claim capabilities.
 */

export interface BroadcastChannelLike {
  name: string;
  postMessage(message: any): void;
  addEventListener(type: 'message', listener: (event: { data: any }) => void): void;
  removeEventListener(type: 'message', listener: (event: { data: any }) => void): void;
  close(): void;
}

export type LeaderMessage =
  | { type: 'WHO_IS_LEADER'; senderId: string; createdAt: number }
  | { type: 'HEARTBEAT'; leaderId: string; timestamp: number; createdAt: number }
  | { type: 'CLAIM_LEADERSHIP'; candidateId: string; createdAt: number; force?: boolean }
  | { type: 'RESIGN_LEADERSHIP'; leaderId: string };

export interface KdsAudioLeaderOptions {
  channelName?: string;
  tabId?: string;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  queryTimeout?: number;
  claimTimeout?: number;
  channelFactory?: (name: string) => BroadcastChannelLike;
}

export class KdsAudioLeaderElection {
  private tabId: string;
  private createdAt: number;
  private channelName: string;
  private heartbeatInterval: number;
  private heartbeatTimeout: number;
  private queryTimeout: number;
  private claimTimeout: number;

  private isLeaderState: boolean = false;
  private leaderId: string | null = null;
  private channel: BroadcastChannelLike | null = null;

  private heartbeatTimer: any = null;
  private watchdogTimer: any = null;
  private queryTimer: any = null;
  private electionTimer: any = null;

  private subscribers: Set<(isLeader: boolean) => void> = new Set();
  private boundHandleMessage: (event: { data: any }) => void;
  private boundHandleUnload: () => void;
  private isDestroyed: boolean = false;

  constructor(options: KdsAudioLeaderOptions = {}) {
    this.tabId = options.tabId || `kds_tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.createdAt = Date.now();
    this.channelName = options.channelName || 'sabay_kds_audio_leader';
    this.heartbeatInterval = options.heartbeatInterval ?? 1500;
    this.heartbeatTimeout = options.heartbeatTimeout ?? 3500;
    this.queryTimeout = options.queryTimeout ?? 300;
    this.claimTimeout = options.claimTimeout ?? 100;

    this.boundHandleMessage = this.handleMessage.bind(this);
    this.boundHandleUnload = this.handleUnload.bind(this);

    this.initChannel(options.channelFactory);
  }

  private initChannel(channelFactory?: (name: string) => BroadcastChannelLike) {
    if (typeof window === 'undefined' && typeof BroadcastChannel === 'undefined' && !channelFactory) {
      // Non-browser / unsupported environment: default to leader
      this.isLeaderState = true;
      this.leaderId = this.tabId;
      return;
    }

    try {
      if (channelFactory) {
        this.channel = channelFactory(this.channelName);
      } else if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel(this.channelName);
      }

      if (this.channel) {
        this.channel.addEventListener('message', this.boundHandleMessage);
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', this.boundHandleUnload);
      }

      // 1. Query if an active leader is already running
      this.postMessage({
        type: 'WHO_IS_LEADER',
        senderId: this.tabId,
        createdAt: this.createdAt,
      });

      // 2. Wait queryTimeout for a response. If none arrives, claim leadership.
      this.queryTimer = setTimeout(() => {
        if (this.isDestroyed || this.leaderId) return;
        this.startElection(0);
      }, this.queryTimeout);
    } catch (err) {
      console.warn('[KDS Audio Leader] BroadcastChannel init error, falling back to local leader:', err);
      this.isLeaderState = true;
      this.leaderId = this.tabId;
    }
  }

  private postMessage(msg: LeaderMessage) {
    if (!this.channel || this.isDestroyed) return;
    try {
      this.channel.postMessage(msg);
    } catch (err) {
      console.warn('[KDS Audio Leader] postMessage failed:', err);
    }
  }

  private handleMessage(event: { data: any }) {
    if (this.isDestroyed || !event || !event.data) return;
    const msg = event.data as LeaderMessage;

    switch (msg.type) {
      case 'WHO_IS_LEADER': {
        if (this.isLeaderState) {
          // Respond to the newcomer that this tab is active leader
          this.postMessage({
            type: 'HEARTBEAT',
            leaderId: this.tabId,
            timestamp: Date.now(),
            createdAt: this.createdAt,
          });
        }
        break;
      }

      case 'HEARTBEAT': {
        if (msg.leaderId === this.tabId) {
          // Ignore own reflection
          return;
        }

        if (this.isLeaderState) {
          // Split-brain conflict resolution: earlier createdAt wins, then lexicographical ID
          const senderCreatedAt = msg.createdAt || 0;
          if (
            senderCreatedAt < this.createdAt ||
            (senderCreatedAt === this.createdAt && msg.leaderId < this.tabId)
          ) {
            // Other tab has seniority, demote self
            this.demoteToFollower(msg.leaderId);
          } else {
            // This tab has seniority, assert leadership
            this.postMessage({
              type: 'HEARTBEAT',
              leaderId: this.tabId,
              timestamp: Date.now(),
              createdAt: this.createdAt,
            });
          }
        } else {
          // Normal heartbeat from leader
          this.cancelQueryTimer();
          this.cancelElectionTimer();
          this.leaderId = msg.leaderId;
          this.resetWatchdog();
        }
        break;
      }

      case 'CLAIM_LEADERSHIP': {
        if (msg.candidateId === this.tabId) return;

        if (msg.force) {
          // Preemptive claim: demote self immediately
          this.demoteToFollower(msg.candidateId);
          return;
        }

        if (this.isLeaderState) {
          // Leader already exists; inform candidate
          this.postMessage({
            type: 'HEARTBEAT',
            leaderId: this.tabId,
            timestamp: Date.now(),
            createdAt: this.createdAt,
          });
        } else {
          // Candidate claiming while this tab is a follower or candidate
          const senderCreatedAt = msg.createdAt || 0;
          if (
            senderCreatedAt < this.createdAt ||
            (senderCreatedAt === this.createdAt && msg.candidateId < this.tabId)
          ) {
            this.cancelElectionTimer();
            this.leaderId = msg.candidateId;
            this.resetWatchdog();
          }
        }
        break;
      }

      case 'RESIGN_LEADERSHIP': {
        if (msg.leaderId === this.leaderId) {
          this.leaderId = null;
          this.clearWatchdog();
          if (!this.isLeaderState) {
            // Instant failover with small random jitter
            const jitter = Math.floor(Math.random() * 80);
            this.startElection(jitter);
          }
        }
        break;
      }
    }
  }

  public startElection(delayMs: number = 0) {
    if (this.isDestroyed || this.isLeaderState) return;
    this.cancelElectionTimer();

    this.electionTimer = setTimeout(() => {
      if (this.isDestroyed || this.isLeaderState || this.leaderId) return;

      // Broadcast claim
      this.postMessage({
        type: 'CLAIM_LEADERSHIP',
        candidateId: this.tabId,
        createdAt: this.createdAt,
      });

      // Wait claimTimeout to ensure no senior claims arrived
      this.electionTimer = setTimeout(() => {
        if (this.isDestroyed || this.leaderId) return;
        this.promoteToLeader();
      }, this.claimTimeout);
    }, delayMs);
  }

  public promoteToLeader() {
    if (this.isDestroyed) return;
    this.cancelQueryTimer();
    this.cancelElectionTimer();
    this.clearWatchdog();

    const wasLeader = this.isLeaderState;
    this.isLeaderState = true;
    this.leaderId = this.tabId;

    // Send immediate heartbeat
    this.postMessage({
      type: 'HEARTBEAT',
      leaderId: this.tabId,
      timestamp: Date.now(),
      createdAt: this.createdAt,
    });

    // Start periodic heartbeats
    this.startHeartbeatInterval();

    if (!wasLeader) {
      this.notifySubscribers();
    }
  }

  public demoteToFollower(newLeaderId?: string) {
    if (this.isDestroyed) return;
    this.stopHeartbeatInterval();
    this.cancelElectionTimer();

    const wasLeader = this.isLeaderState;
    this.isLeaderState = false;
    if (newLeaderId) {
      this.leaderId = newLeaderId;
    }
    this.resetWatchdog();

    if (wasLeader) {
      this.notifySubscribers();
    }
  }

  public claimLeadership(force: boolean = true) {
    if (this.isDestroyed) return;
    if (this.isLeaderState) return;

    this.postMessage({
      type: 'CLAIM_LEADERSHIP',
      candidateId: this.tabId,
      createdAt: this.createdAt,
      force,
    });

    this.promoteToLeader();
  }

  public resignLeadership() {
    if (this.isDestroyed || !this.isLeaderState) return;

    this.postMessage({
      type: 'RESIGN_LEADERSHIP',
      leaderId: this.tabId,
    });

    this.demoteToFollower();
  }

  private startHeartbeatInterval() {
    this.stopHeartbeatInterval();
    this.heartbeatTimer = setInterval(() => {
      if (!this.isLeaderState || this.isDestroyed) return;
      this.postMessage({
        type: 'HEARTBEAT',
        leaderId: this.tabId,
        timestamp: Date.now(),
        createdAt: this.createdAt,
      });
    }, this.heartbeatInterval);
  }

  private stopHeartbeatInterval() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private resetWatchdog() {
    this.clearWatchdog();
    this.watchdogTimer = setTimeout(() => {
      if (this.isDestroyed || this.isLeaderState) return;
      // Leader missed heartbeat -> trigger new election
      this.leaderId = null;
      const jitter = Math.floor(Math.random() * 120);
      this.startElection(jitter);
    }, this.heartbeatTimeout);
  }

  private clearWatchdog() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private cancelQueryTimer() {
    if (this.queryTimer) {
      clearTimeout(this.queryTimer);
      this.queryTimer = null;
    }
  }

  private cancelElectionTimer() {
    if (this.electionTimer) {
      clearTimeout(this.electionTimer);
      this.electionTimer = null;
    }
  }

  private handleUnload() {
    if (this.isLeaderState) {
      this.resignLeadership();
    }
  }

  private notifySubscribers() {
    for (const listener of this.subscribers) {
      try {
        listener(this.isLeaderState);
      } catch (err) {
        console.error('[KDS Audio Leader] listener error:', err);
      }
    }
  }

  public subscribe(listener: (isLeader: boolean) => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  public isLeader(): boolean {
    return this.isLeaderState;
  }

  public getLeaderId(): string | null {
    return this.leaderId;
  }

  public getTabId(): string {
    return this.tabId;
  }

  public destroy() {
    this.isDestroyed = true;
    this.cancelQueryTimer();
    this.cancelElectionTimer();
    this.clearWatchdog();
    this.stopHeartbeatInterval();

    if (this.channel) {
      try {
        this.channel.removeEventListener('message', this.boundHandleMessage);
        this.channel.close();
      } catch (_) {}
      this.channel = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.boundHandleUnload);
    }

    this.subscribers.clear();
  }
}

// Global Singleton for application runtime
let globalLeaderElectionInstance: KdsAudioLeaderElection | null = null;

export function getKdsAudioLeaderManager(): KdsAudioLeaderElection {
  if (!globalLeaderElectionInstance) {
    globalLeaderElectionInstance = new KdsAudioLeaderElection();
  }
  return globalLeaderElectionInstance;
}

export function isAudioLeader(): boolean {
  return getKdsAudioLeaderManager().isLeader();
}

export function getAudioLeaderId(): string | null {
  return getKdsAudioLeaderManager().getLeaderId();
}

export function getAudioTabId(): string {
  return getKdsAudioLeaderManager().getTabId();
}

export function claimAudioLeadership(force: boolean = true): void {
  getKdsAudioLeaderManager().claimLeadership(force);
}

export function resignAudioLeadership(): void {
  getKdsAudioLeaderManager().resignLeadership();
}

export function subscribeAudioLeader(listener: (isLeader: boolean) => void): () => void {
  return getKdsAudioLeaderManager().subscribe(listener);
}
