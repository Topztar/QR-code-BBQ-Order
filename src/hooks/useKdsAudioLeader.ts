import { useState, useEffect } from 'react';
import {
  isAudioLeader,
  getAudioLeaderId,
  getAudioTabId,
  claimAudioLeadership,
  resignAudioLeadership,
  subscribeAudioLeader,
} from '../utils/kdsAudioLeader';

export interface UseKdsAudioLeaderReturn {
  isLeader: boolean;
  leaderId: string | null;
  tabId: string;
  claimLeadership: (force?: boolean) => void;
  resignLeadership: () => void;
}

export function useKdsAudioLeader(): UseKdsAudioLeaderReturn {
  const [isLeader, setIsLeader] = useState<boolean>(() => isAudioLeader());
  const [leaderId, setLeaderId] = useState<string | null>(() => getAudioLeaderId());
  const tabId = getAudioTabId();

  useEffect(() => {
    setIsLeader(isAudioLeader());
    setLeaderId(getAudioLeaderId());

    const unsubscribe = subscribeAudioLeader((newIsLeader) => {
      setIsLeader(newIsLeader);
      setLeaderId(getAudioLeaderId());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isLeader,
    leaderId,
    tabId,
    claimLeadership: (force: boolean = true) => claimAudioLeadership(force),
    resignLeadership: () => resignAudioLeadership(),
  };
}
