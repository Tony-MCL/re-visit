export const LIMITS = {
  free: {
    maxEntries: 100,
    warnAt: 80,
    profiles: ["private", "work"] as const,
  },
  pro: {
    maxEntries: Number.POSITIVE_INFINITY,
    warnAt: Number.POSITIVE_INFINITY,
    profiles: ["private", "work"] as const,
  },
} as const;

export type AllowedProfileId = (typeof LIMITS.pro.profiles)[number];
