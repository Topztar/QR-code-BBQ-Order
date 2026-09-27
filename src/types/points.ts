export const POINTS_CONFIG = {
  EARN_RATIO: 20, // NT$20 = 1 point
  VIP_THRESHOLD: 1000,
  VIP_DISCOUNT_RATE: 0.9,
} as const;

export interface VipStatus {
  isVip: boolean;
  pointsToNext: number;
}

export function calculateEarnedPoints(amount: number, ratio: number = POINTS_CONFIG.EARN_RATIO): number {
  if (!amount || amount <= 0 || ratio <= 0) return 0;
  return Math.floor(amount / ratio);
}

export function isVipMember(totalPoints: number | undefined, threshold: number = POINTS_CONFIG.VIP_THRESHOLD): boolean {
  return (totalPoints || 0) >= threshold;
}

export const pointsHelper = {
  calculateEarnedPoints,
  calculateVipStatus: (points: number | undefined, threshold: number = POINTS_CONFIG.VIP_THRESHOLD): VipStatus => {
    const p = points || 0;
    const isVip = isVipMember(p, threshold);
    const pointsToNext = Math.max(0, threshold - p);
    return { isVip, pointsToNext };
  },
  canRedeemReward: (points: number | undefined, cost: number): boolean => {
    return (points || 0) >= cost;
  }
};
