import type { ProfileId } from "../types/entry";
import type { Plan } from "./plan";

export function isProfileAllowed(plan: Plan, profileId: ProfileId) {
  if (plan === "pro") return true;
  return profileId === "private";
}

export function explainProfileLock() {
  // tekstene ligger i i18n allerede:
  // capture.lockedProfileTitle / capture.lockedProfileMsg
  return {
    titleKey: "capture.lockedProfileTitle",
    msgKey: "capture.lockedProfileMsg",
  } as const;
}
