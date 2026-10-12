/**
 * Feature Flags Configuration
 * SABAY BBQ - Operational & Resiliency Feature Flags
 */

export const FEATURES = {
  USE_WALL_CLOCK_COOLDOWN: true,
  ENFORCE_IOS_MEMORY_CACHE: true,
  ENABLE_STAFF_BOOTSTRAP_TTL: true,
  LAZY_INVENTORY_LOGS: true,
} as const;
