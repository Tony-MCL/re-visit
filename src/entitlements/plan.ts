import AsyncStorage from "@react-native-async-storage/async-storage";

export type Plan = "free" | "pro";

const KEY = "revisit.plan.v1";

export async function getPlan(): Promise<Plan> {
  const v = await AsyncStorage.getItem(KEY);
  return v === "pro" ? "pro" : "free";
}

export async function setPlan(plan: Plan) {
  await AsyncStorage.setItem(KEY, plan);
}

/**
 * OPTIONAL: handy for tests in dev (not used automatically).
 */
export async function togglePlan(): Promise<Plan> {
  const cur = await getPlan();
  const next: Plan = cur === "free" ? "pro" : "free";
  await setPlan(next);
  return next;
}
