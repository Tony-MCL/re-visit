import type { ProfileId } from "../types/entry";
import type { Plan } from "./plan";

export function isProfileAllowed(plan: Plan, profileId: ProfileId) {
  // Current policy: both profiles are available for Free and Pro.
  // Keep this function for future entitlement rules.
  return profileId === "private" || profileId === "work";
}

export function explainProfileLock() {
  // tekstene ligger i i18n allerede:
  // capture.lockedProfileTitle / capture.lockedProfileMsg
  return {
    titleKey: "capture.lockedProfileTitle",
    msgKey: "capture.lockedProfileMsg",
  } as const;
}
